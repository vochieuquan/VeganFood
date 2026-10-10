package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.model.Order;
import com.veganfood.veganfoodbackend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${api.payosapi.key}")
    private String payosApi;

    @Value("${api.clientid.key}")
    private String clientId;

    @Value("${api.apikey.key}")
    private String apiKey;

    @Value("${api.checksumkey.key}")
    private String checksumKey;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    public PaymentService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public String createPaymentLink(Integer orderId, BigDecimal totalAmount, String buyerName) {
        try {
            int amount = totalAmount.intValueExact();
            if (amount <= 0) {
                throw new IllegalArgumentException("Order amount must be positive");
            }

            long orderCode = orderId.longValue();
            String baseUrl = frontendBaseUrl.replaceAll("/+$", "");
            String description = "VeganFood #" + orderId;
            String returnUrl = baseUrl + "/billing/" + orderId;
            String cancelUrl = baseUrl + "/billing/" + orderId + "?cancelled=1";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            try {
                ResponseEntity<Map> existingResponse = restTemplate.exchange(
                        payosApi.replaceAll("/+$", "") + "/" + orderCode,
                        HttpMethod.GET, new HttpEntity<>(headers), Map.class);
                Map<?, ?> existingBody = existingResponse.getBody();
                if (existingResponse.getStatusCode().is2xxSuccessful() && existingBody != null
                        && "00".equals(String.valueOf(existingBody.get("code")))
                        && existingBody.get("data") instanceof Map<?, ?> existingData) {
                    String status = String.valueOf(existingData.get("status"));
                    if ("PAID".equals(status)) {
                        throw new IllegalStateException("Payment has already been completed");
                    }
                    if ("CANCELLED".equals(status)) {
                        throw new IllegalStateException("Payment link has already been cancelled");
                    }
                    if ("PENDING".equals(status) && existingData.get("checkoutUrl") instanceof String checkoutUrl) {
                        return checkoutUrl;
                    }
                }
            } catch (org.springframework.web.client.HttpClientErrorException.NotFound ignored) {
                // The first payment link for this order has not been created yet.
            }

            Map<String, Object> signedFields = Map.of(
                    "amount", amount,
                    "cancelUrl", cancelUrl,
                    "description", description,
                    "orderCode", orderCode,
                    "returnUrl", returnUrl);
            Map<String, Object> body = new java.util.HashMap<>(signedFields);
            body.put("signature", sign(signedFields));
            body.put("buyerName", buyerName == null ? "Customer" : buyerName);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    payosApi, new HttpEntity<>(body, headers), Map.class);
            Map<?, ?> responseBody = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || responseBody == null
                    || !"00".equals(String.valueOf(responseBody.get("code")))) {
                throw new IllegalStateException("Payment provider rejected the request");
            }

            Object data = responseBody.get("data");
            if (data instanceof Map<?, ?> paymentData && paymentData.get("checkoutUrl") instanceof String url) {
                return url;
            }
            throw new IllegalStateException("Payment provider did not return a checkout URL");
        } catch (ArithmeticException exception) {
            throw new IllegalArgumentException("PayOS requires an integer order amount", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to create payment link", exception);
        }
    }

    public void cancelPaymentLink(Integer orderId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", clientId);
        headers.set("x-api-key", apiKey);
        String url = payosApi.replaceAll("/+$", "") + "/" + orderId + "/cancel";
        ResponseEntity<Map> response = restTemplate.postForEntity(url,
                new HttpEntity<>(Map.of("cancellationReason", "Customer requested cancellation"), headers), Map.class);
        Map<?, ?> body = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || body == null
                || !"00".equals(String.valueOf(body.get("code")))) {
            throw new IllegalStateException("Payment provider could not cancel this payment link");
        }
        if (!(body.get("data") instanceof Map<?, ?> data)
                || !"CANCELLED".equals(String.valueOf(data.get("status")))) {
            throw new IllegalStateException("Payment link is not cancelled");
        }
    }

    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        Object dataValue = payload.get("data");
        if (!(dataValue instanceof Map<?, ?> rawData)) {
            throw new IllegalArgumentException("Missing payment data");
        }

        Map<String, Object> data = new TreeMap<>();
        rawData.forEach((key, value) -> data.put(String.valueOf(key), value));
        String providedSignature = String.valueOf(payload.get("signature"));
        String expectedSignature = sign(data);
        if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8),
                providedSignature.toLowerCase().getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Invalid payment signature");
        }

        if (!"00".equals(String.valueOf(payload.get("code")))
                || !Boolean.parseBoolean(String.valueOf(payload.get("success")))
                || !"00".equals(String.valueOf(data.get("code")))) {
            return;
        }

        long orderCode = Long.parseLong(String.valueOf(data.get("orderCode")));
        int orderId = Math.toIntExact(orderCode);
        int amount = Integer.parseInt(String.valueOf(data.get("amount")));
        if (data.get("currency") != null && !"VND".equals(String.valueOf(data.get("currency")))) {
            throw new IllegalArgumentException("Payment currency does not match the order");
        }
        Order order = orderRepository.findByIdForUpdate(orderId).orElse(null);
        if (order == null) {
            return;
        }

        if (order.getPaymentMethod() != Order.PaymentMethod.VNPAY
                || order.getTotalAmount().compareTo(BigDecimal.valueOf(amount)) != 0) {
            return;
        }
        if (order.getStatus() == Order.OrderStatus.pending) {
            order.setStatus(Order.OrderStatus.paid);
            orderRepository.save(order);
        }
    }

    private String sign(Map<String, Object> fields) {
        try {
            String rawData = new TreeMap<>(fields).entrySet().stream()
                    .map(entry -> entry.getKey() + "=" + normalizeValue(entry.getValue()))
                    .collect(java.util.stream.Collectors.joining("&"));
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(hmac.doFinal(rawData.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign payment data", exception);
        }
    }

    private String normalizeValue(Object value) {
        if (value == null || "null".equalsIgnoreCase(String.valueOf(value))
                || "undefined".equalsIgnoreCase(String.valueOf(value))) {
            return "";
        }
        return String.valueOf(value);
    }
}

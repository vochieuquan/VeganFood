package com.veganfood.veganfoodbackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private static final int REQUEST_LIMIT = 10;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ConcurrentHashMap<String, RequestWindow> requestWindows = new ConcurrentHashMap<>();

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-3.8-flash}")
    private String model;

    @PostMapping("/chatbot")
    public ResponseEntity<Map<String, String>> chat(@RequestBody AiRequest request, HttpServletRequest httpRequest) {
        enforceRateLimit(httpRequest);
        if (request.message == null || request.message.isBlank() || request.message.length() > 1200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message must be between 1 and 1200 characters");
        }
        String menu = formatProducts(request.products, 12);
        String prompt = "You are VeganFood restaurant's multilingual assistant. Answer in the user's language. "
                + "Discuss only vegetarian food, vegan dishes, our menu, ingredients, and cooking. Avoid medical claims. "
                + "Recommend only items from this menu when relevant.\nMENU:\n" + menu
                + "\nCUSTOMER MESSAGE:\n" + request.message;
        return ResponseEntity.ok(Map.of("reply", generate(prompt, false)));
    }

    @PostMapping("/food-suggestions")
    public ResponseEntity<Map<String, String>> suggestFood(@RequestBody AiRequest request,
                                                            HttpServletRequest httpRequest) {
        enforceRateLimit(httpRequest);
        if (request.height == null || request.weight == null || request.healthStatus == null
                || request.height < 100 || request.height > 250 || request.weight < 20 || request.weight > 200
                || request.healthStatus.isBlank() || request.healthStatus.length() > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Height, weight, and health status are invalid");
        }
        String prompt = "Suggest 3 to 5 vegetarian dishes from this menu. Return only JSON with keys "
                + "suggestions (an array of product_id and reason) and general_advice. Do not diagnose, prescribe, "
                + "or make medical claims. Consider the user's stated health context only as a preference.\n"
                + "Height cm: " + request.height + "\nWeight kg: " + request.weight
                + "\nHealth context: " + request.healthStatus
                + "\nMenu:\n" + formatProducts(request.products, 40);
        return ResponseEntity.ok(Map.of("text", generate(prompt, true)));
    }

    private String generate(String prompt, boolean jsonResponse) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI assistant is not configured");
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model
                + ":generateContent?key=" + apiKey;
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", jsonResponse
                        ? Map.of("responseMimeType", "application/json", "maxOutputTokens", 1000)
                        : Map.of("maxOutputTokens", 600));
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url,
                    new org.springframework.http.HttpEntity<>(body, jsonHeaders()), Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI provider is unavailable");
            }
            Object candidatesValue = response.getBody().get("candidates");
            if (candidatesValue instanceof List<?> candidates && !candidates.isEmpty()
                    && candidates.get(0) instanceof Map<?, ?> candidate
                    && candidate.get("content") instanceof Map<?, ?> content
                    && content.get("parts") instanceof List<?> parts && !parts.isEmpty()
                    && parts.get(0) instanceof Map<?, ?> part && part.get("text") instanceof String text) {
                return text;
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI provider returned an empty response");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI provider is unavailable");
        }
    }

    private org.springframework.http.HttpHeaders jsonHeaders() {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String formatProducts(List<Map<String, Object>> products, int limit) {
        if (products == null || products.isEmpty()) {
            return "No menu items are available.";
        }
        List<String> items = new ArrayList<>();
        products.stream().limit(limit).forEach(product -> items.add(
                "ID " + product.get("product_id") + ": " + product.get("name") + " — "
                        + product.get("description") + " (" + product.get("price") + ")"));
        return String.join("\n", items);
    }

    private void enforceRateLimit(HttpServletRequest request) {
        String address = request.getRemoteAddr();
        long now = Instant.now().getEpochSecond();
        RequestWindow window = requestWindows.compute(address, (key, existing) -> {
            if (existing == null || now - existing.startedAt >= 60) {
                return new RequestWindow(now, 1);
            }
            return new RequestWindow(existing.startedAt, existing.count + 1);
        });
        if (requestWindows.size() > 10000) {
            requestWindows.entrySet().removeIf(entry -> now - entry.getValue().startedAt >= 60);
        }
        if (window.count > REQUEST_LIMIT) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please try again in a minute");
        }
    }

    public static class AiRequest {
        public String message;
        public Double height;
        public Double weight;
        public String healthStatus;
        public List<Map<String, Object>> products;
    }

    private record RequestWindow(long startedAt, int count) {}
}

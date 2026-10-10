package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.dto.OrderDTO;
import com.veganfood.veganfoodbackend.dto.OrderItemDTO;
import com.veganfood.veganfoodbackend.dto.TopOrderedProductDTO;
import com.veganfood.veganfoodbackend.dto.request.CheckoutRequest;
import com.veganfood.veganfoodbackend.model.*;
import com.veganfood.veganfoodbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final DiscountRepository discountRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final PaymentService paymentService;

    private static final long SHIPPING_FEE = 20_000;

    public OrderService(UserRepository userRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        DiscountRepository discountRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        PaymentService paymentService) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.discountRepository = discountRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.paymentService = paymentService;
    }

    public String checkout(CheckoutRequest request, java.security.Principal principal) {
        String email = principal.getName();
        return checkoutByEmail(request, email);
    }

    @Transactional
    public String checkoutByEmail(CheckoutRequest request, String email) {
        if (request == null || request.getPaymentMethod() == null || request.getPhoneNumber() == null
                || request.getPhoneNumber().isBlank() || request.getAddress() == null || request.getAddress().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method, phone number, and address are required");
        }
        String phoneNumber = request.getPhoneNumber().trim();
        String address = request.getAddress().trim();
        if (phoneNumber.length() > 20 || !phoneNumber.matches("[+0-9() -]{8,20}") || address.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number or delivery address is invalid");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Cart cart = cartRepository.findByUserUserIdForUpdate(user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart not found"));
        List<CartItem> cartItems = cartItemRepository.findByCart_CartId(cart.getCartId());
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        java.util.Map<Integer, Product> lockedProducts = new java.util.HashMap<>();
        List<CartItem> orderedItems = cartItems.stream()
                .sorted(java.util.Comparator.comparing(item -> item.getProduct().getProduct_id()))
                .toList();
        for (CartItem item : orderedItems) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getProduct_id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Product is no longer available"));
            Double price = product.getPrice();
            Integer stock = product.getStock_quantity();
            if (item.getQuantity() <= 0 || item.getQuantity() > 99 || price == null || !Double.isFinite(price)
                    || price <= 0 || stock == null || stock < item.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cart contains an unavailable or invalid item");
            }
            product.setStock_quantity(stock - item.getQuantity());
            productRepository.save(product);
            lockedProducts.put(product.getProduct_id(), product);
        }

        Order.PaymentMethod paymentMethod;
        try {
            paymentMethod = Order.PaymentMethod.valueOf(request.getPaymentMethod().trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported payment method");
        }

        BigDecimal totalAmount = cartItems.stream()
                .map(item -> BigDecimal.valueOf(lockedProducts.get(item.getProduct().getProduct_id()).getPrice())
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.pending);
        order.setPaymentMethod(paymentMethod);
        order.setPhoneNumber(phoneNumber);
        order.setAddress(address);

        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            Discount discount = discountRepository.findByDiscountCodeForUpdate(request.getDiscountCode().trim().toUpperCase())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount code not found"));
            Integer quantity = discount.getQuantity();
            Integer percentage = discount.getPercentage();
            if (discount.getStatus() != Discount.Status.Available || quantity == null || quantity <= 0
                    || percentage == null || percentage < 0 || percentage > 100) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount code is unavailable");
            }
            totalAmount = totalAmount.subtract(totalAmount.multiply(BigDecimal.valueOf(percentage))
                    .divide(BigDecimal.valueOf(100)));
            discount.setQuantity(quantity - 1);
            if (quantity == 1) {
                discount.setStatus(Discount.Status.Unavailable);
            }
            order.setDiscount(discount);
        }

        totalAmount = totalAmount.setScale(0, java.math.RoundingMode.HALF_UP)
                .add(BigDecimal.valueOf(SHIPPING_FEE));

        if (totalAmount.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order total must be positive");
        }
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        for (CartItem item : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            Product product = lockedProducts.get(item.getProduct().getProduct_id());
            orderItem.setProduct(product);
            orderItem.setUser(user);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPriceAtTime(BigDecimal.valueOf(product.getPrice()));
            orderItemRepository.save(orderItem);
        }
        cartItemRepository.deleteAll(cartItems);
        return String.valueOf(order.getOrderId());
    }

    public List<Order> getRawOrdersForUserOrAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if ("customer".equalsIgnoreCase(user.getRole().name())) {
            return orderRepository.findByUser(user);
        } else {
            return orderRepository.findAll();
        }
    }

    public List<OrderDTO> getOrdersForUserOrAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Order> orders = "customer".equalsIgnoreCase(user.getRole().name())
                ? orderRepository.findByUser(user)
                : orderRepository.findAll();

        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setOrderId(order.getOrderId());
            dto.setUserName(order.getUser().getName());
            dto.setStatus(order.getStatus().name());
            dto.setPaymentMethod(order.getPaymentMethod().name());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setPhoneNumber(order.getPhoneNumber());
            dto.setAddress(order.getAddress());
            dto.setCreatedAt(order.getCreatedAt());

            if (order.getDiscount() != null) {
                dto.setDiscountCode(order.getDiscount().getDiscountCode());
                dto.setDiscountPercentage(order.getDiscount().getPercentage());
            }

            List<OrderItemDTO> items = order.getOrderItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPriceAtTime(item.getPriceAtTime());
                return itemDTO;
            }).collect(Collectors.toList());

            dto.setItems(items);
            return dto;
        }).collect(Collectors.toList());
    }

    public OrderDTO getOrderByIdAndEmail(Integer orderId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return null;

        boolean isOwner = order.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = !user.getRole().name().equalsIgnoreCase("customer");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền truy cập đơn hàng này");
        }

        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setUserName(order.getUser().getName());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod().name());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setAddress(order.getAddress());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getDiscount() != null) {
            dto.setDiscountCode(order.getDiscount().getDiscountCode());
            dto.setDiscountPercentage(order.getDiscount().getPercentage());
        }

        List<OrderItemDTO> items = order.getOrderItems().stream().map(item -> {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPriceAtTime(item.getPriceAtTime());
            return itemDTO;
        }).collect(Collectors.toList());

        dto.setItems(items);
        return dto;
    }

    @Transactional
    public String updateOrderStatus(Integer orderId, Order.OrderStatus status, String email) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status is required");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (user.getRole() == User.Role.customer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only staff can update order status");
        }

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        Order.OrderStatus current = order.getStatus();
        if (current == status) {
            return "success";
        }
        if (current == Order.OrderStatus.cancelled || current == Order.OrderStatus.completed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Order is already in a final state");
        }
        if (status == Order.OrderStatus.paid && order.getPaymentMethod() == Order.PaymentMethod.VNPAY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Online payment status is controlled by the payment webhook");
        }
        if (status == Order.OrderStatus.cancelled && current == Order.OrderStatus.pending) {
            return cancelPendingOrder(orderId, email);
        }

        boolean allowed = switch (current) {
            case pending -> status == Order.OrderStatus.cancelled
                    || (status == Order.OrderStatus.paid && order.getPaymentMethod() == Order.PaymentMethod.CASH)
                    || (order.getPaymentMethod() == Order.PaymentMethod.CASH
                        && (status == Order.OrderStatus.shipping || status == Order.OrderStatus.shipped));
            case paid -> status == Order.OrderStatus.shipping || status == Order.OrderStatus.shipped;
            case shipping -> status == Order.OrderStatus.shipped || status == Order.OrderStatus.delivered;
            case shipped -> status == Order.OrderStatus.delivered;
            case delivered -> status == Order.OrderStatus.completed;
            default -> false;
        };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid order status transition");
        }
        order.setStatus(status);
        orderRepository.save(order);
        return "success";
    }

    @Transactional
    public String cancelPendingOrder(Integer orderId, String email) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        boolean isOwner = order.getUser().getEmail().equalsIgnoreCase(email);
        boolean isStaff = requester.getRole() != User.Role.customer;
        if (!isOwner && !isStaff) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order access denied");
        }
        if (order.getStatus() != Order.OrderStatus.pending) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending orders can be cancelled");
        }
        if (order.getPaymentMethod() == Order.PaymentMethod.VNPAY) {
            try {
                paymentService.cancelPaymentLink(orderId);
            } catch (RuntimeException exception) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "The online payment link could not be cancelled; confirm its status before retrying");
            }
        }
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
        List<OrderItem> orderedItems = items.stream()
                .sorted(java.util.Comparator.comparing(item -> item.getProduct().getProduct_id()))
                .toList();
        for (OrderItem item : orderedItems) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getProduct_id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Product is no longer available"));
            int stock = product.getStock_quantity() == null ? 0 : product.getStock_quantity();
            product.setStock_quantity(stock + item.getQuantity());
            productRepository.save(product);
        }
        if (order.getDiscount() != null) {
            Discount discount = discountRepository.findByDiscountIdForUpdate(order.getDiscount().getDiscountId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Discount is no longer available"));
            Integer quantity = discount.getQuantity();
            discount.setQuantity((quantity == null ? 0 : quantity) + 1);
            if (discount.getStatus() == Discount.Status.Unavailable) {
                discount.setStatus(Discount.Status.Available);
            }
            discountRepository.save(discount);
        }
        order.setStatus(Order.OrderStatus.cancelled);
        orderRepository.save(order);
        return "success";
    }

    public List<TopOrderedProductDTO> getTopOrderedProducts() {
        return orderItemRepository.findTopOrderedProducts();
    }

    public BigDecimal getTotalSpentByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Order> orders = orderRepository.findByUser(user);

        return orders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.paid
                        || order.getStatus() == Order.OrderStatus.shipping
                        || order.getStatus() == Order.OrderStatus.shipped
                        || order.getStatus() == Order.OrderStatus.delivered
                        || order.getStatus() == Order.OrderStatus.completed)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

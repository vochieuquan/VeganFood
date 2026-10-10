package com.veganfood.veganfoodbackend.dto.request;

import com.veganfood.veganfoodbackend.model.Order;

public class UpdateOrderStatusRequest {

    private Order.OrderStatus status;

    public Order.OrderStatus getStatus() {
        return status;
    }

    public void setStatus(Order.OrderStatus status) {
        this.status = status;
    }
}

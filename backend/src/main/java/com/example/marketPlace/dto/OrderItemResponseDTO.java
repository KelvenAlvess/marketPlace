package com.example.marketPlace.dto;

import com.example.marketPlace.model.OrderItem;

import java.math.BigDecimal;

public record OrderItemResponseDTO(
        Long orderItemId,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal priceAtTheTime,
        BigDecimal subtotal
) {
    public static OrderItemResponseDTO from(OrderItem orderItem) {
        BigDecimal subtotal = orderItem.getUnitPrice()
                .multiply(BigDecimal.valueOf(orderItem.getQuantity()));

        return new OrderItemResponseDTO(
                orderItem.getOrderItemId(),
                orderItem.getProduct().getProductId(),
                orderItem.getProduct().getProductName(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                subtotal
        );
    }
}


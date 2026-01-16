package com.example.marketPlace.dto;

import com.example.marketPlace.model.Order;
import com.example.marketPlace.model.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record OrderResponseDTO(
        Long orderId,
        Long buyerId,
        String buyerName,
        String buyerEmail,
        LocalDateTime orderDate,
        OrderStatus status,
        List<OrderItemResponseDTO> items,
        BigDecimal totalAmount,
        Integer totalItems
) {
    public static OrderResponseDTO from(Order order, List<OrderItemResponseDTO> items) {
        BigDecimal totalAmount = items.stream()
                .map(OrderItemResponseDTO::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer totalItems = items.stream()
                .map(OrderItemResponseDTO::quantity)
                .reduce(0, Integer::sum);

        return new OrderResponseDTO(
                order.getOrderId(),
                order.getBuyer().getUserId(),
                order.getBuyer().getUsername(),
                order.getBuyer().getEmail(),
                order.getOrderDate(),
                order.getStatus(),
                items,
                totalAmount,
                totalItems
        );
    }
}


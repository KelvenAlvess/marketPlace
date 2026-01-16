package com.example.marketPlace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderSummaryDTO(
        Long orderId,
        LocalDateTime orderDate,
        String status,
        Integer totalItems,
        BigDecimal totalAmount
) {
}


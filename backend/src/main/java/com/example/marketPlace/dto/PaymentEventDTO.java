package com.example.marketPlace.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public record PaymentEventDTO(
        Long orderId,
        String email,
        BigDecimal amount,
        String status,
        String transactionId
) implements Serializable {}
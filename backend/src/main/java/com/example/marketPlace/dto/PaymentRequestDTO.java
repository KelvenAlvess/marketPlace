package com.example.marketPlace.dto;

public record PaymentRequestDTO(
        Long orderId,
        String token,           // Token do cartão gerado pelo SDK JS
        String paymentMethodId, // "visa", "mastercard", "pix", etc.
        Integer installments,   // Parcelas
        String email
) {}

package com.example.marketPlace.dto;

import com.example.marketPlace.model.enums.PaymentStatus;
import java.math.BigDecimal;

public record PaymentResponseDTO(
        Long paymentId,
        String transactionId,
        BigDecimal amount,
        PaymentStatus status,
        String qrCode,          // Para PIX
        String qrCodeBase64,    // Para PIX
        String ticketUrl        // Para boleto
) {}

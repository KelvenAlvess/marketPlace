package com.example.marketPlace.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record PaymentRequestDTO(
        @NotNull(message = "O ID do pedido é obrigatório")
        Long orderId,

        String token,

        @NotBlank(message = "O método de pagamento é obrigatório")
        String paymentMethodId,

        @NotNull(message = "O número de parcelas é obrigatório")
        @Min(value = 1, message = "O mínimo de parcelas é 1")
        Integer installments,

        @NotBlank(message = "O email do pagador é obrigatório")
        @Email(message = "Formato de email inválido")
        String email,

        @NotNull(message = "Chave de idempotência é obrigatória para segurança da transação")
        UUID idempotencyKey
) {}
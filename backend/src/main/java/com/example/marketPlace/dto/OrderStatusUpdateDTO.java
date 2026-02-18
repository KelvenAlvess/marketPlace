package com.example.marketPlace.dto;

import com.example.marketPlace.model.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateDTO(
        @NotNull(message = "Status é obrigatório")
        OrderStatus status
) {
}


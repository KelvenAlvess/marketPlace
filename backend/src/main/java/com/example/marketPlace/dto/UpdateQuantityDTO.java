package com.example.marketPlace.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateQuantityDTO(
        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade deve ser maior que zero")
        Integer quantity
) {}

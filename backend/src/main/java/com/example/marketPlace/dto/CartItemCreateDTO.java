package com.example.marketPlace.dto;

import jakarta.validation.constraints.NotNull;

public record CartItemCreateDTO(

        @NotNull Long userId,
        @NotNull Long productId,
        @NotNull Integer quantity

        ) {
}

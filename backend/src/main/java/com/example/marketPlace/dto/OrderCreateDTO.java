package com.example.marketPlace.dto;

import jakarta.validation.constraints.NotNull;

public record OrderCreateDTO(
        @NotNull(message = "ID do usuário é obrigatório")
        Long userId
) {
}


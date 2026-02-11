package com.example.marketPlace.dto;

import com.example.marketPlace.model.Category;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CategoryResponseDTO(
        @JsonProperty("category_ID")
        Long categoryId,
        String name,
        String description
) {
    public static CategoryResponseDTO from(Category category) {
        return new CategoryResponseDTO(
                category.getCategoryId(),
                category.getName(),
                category.getDescription()
        );
    }
}

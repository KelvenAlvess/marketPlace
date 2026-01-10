package com.example.marketPlace.dto;

import com.example.marketPlace.model.Category;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CategoryResponseDTO(
        @JsonProperty("category_ID")
        Long categoryId,
        String name
) {
    public static CategoryResponseDTO from(Category category) {
        return new CategoryResponseDTO(
                category.getCategory_ID(),
                category.getName()
        );
    }
}

package com.example.marketPlace.dto;

import com.example.marketPlace.model.Category;
import com.example.marketPlace.model.Product;
import com.example.marketPlace.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record ProductResponseDTO(
        @JsonProperty("product_ID")
        Long product_ID,
        String productName,
        String description,
        BigDecimal productPrice,
        Category category,
        User seller,
        Integer stockQuantity,
        String imageUrl

) {
    public static ProductResponseDTO from(Product product) {
        return new ProductResponseDTO(
                product.getProductId(),
                product.getProductName(),
                product.getDescription(),
                product.getProductPrice(),
                product.getCategory(),
                product.getSeller(),
                product.getStockQuantity(),
                product.getImageUrl()
        );
    }
}

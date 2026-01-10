package com.example.marketPlace.dto;

import com.example.marketPlace.model.Category;
import com.example.marketPlace.model.Product;
import com.example.marketPlace.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductCreateDTO(
        @NotBlank String productName,
        @NotBlank String description,
        @NotNull Long categoryId,        // ← apenas ID
        @NotNull BigDecimal price,
        @NotNull Long sellerId,          // ← apenas ID
        @NotNull Integer stockQuantity
) {
    public Product toEntity(Category category, User seller) {
        Product product = new Product();
        product.setProductName(this.productName);
        product.setDescription(this.description);
        product.setCategory(category);
        product.setProductPrice(this.price);
        product.setSeller(seller);
        product.setStockQuantity(this.stockQuantity);
        return product;
    }
}

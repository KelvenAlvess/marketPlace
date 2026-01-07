package com.example.marketPlace.dto;

import com.example.marketPlace.model.Category;
import com.example.marketPlace.model.Product;
import com.example.marketPlace.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductCreateDTO(

        @NotBlank(message = "O nome do produto é obrigatório")
        String productName,

        @NotBlank(message = "A descrição do produto é obrigatória")
        String description,

        @NotNull(message = "A categoria do produto é obrigatória")
        Category category,

        @NotNull(message = "O preço do produto é obrigatório")
        BigDecimal price,

        @NotNull(message = "O vendedor é obrigatório")
        User seller,

        @NotNull(message = "A quantidade em estoque é obrigatória")
        Integer stockQuantity

) {
    public Product toEntity() {
        Product product = new Product();
        product.setProductName(this.productName);
        product.setDescription(this.description);
        product.setCategory(this.category);
        product.setProductPrice(this.price);
        product.setSeller(this.seller);
        product.setStockQuantity(this.stockQuantity);
        return product;
    }

    public static ProductCreateDTO fromEntity(Product product) {
        return new ProductCreateDTO(
                product.getProductName(),
                product.getDescription(),
                product.getCategory(),
                product.getProductPrice(),
                product.getSeller(),
                product.getStockQuantity()
        );
    }
}

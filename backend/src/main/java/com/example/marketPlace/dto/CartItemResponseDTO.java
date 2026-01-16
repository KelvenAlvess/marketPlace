package com.example.marketPlace.dto;

import com.example.marketPlace.model.CartItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record CartItemResponseDTO(
        @JsonProperty("cartItem_ID")
        Long cartItemId,
        Long userId,
        Long productId,
        String productName,
        Integer quantity,
        Double price,
        Double subtotal,
        LocalDateTime createdAt
) {

    public static CartItemResponseDTO from(CartItem cartItem) {
        return new CartItemResponseDTO(
                cartItem.getId(),
                cartItem.getUser().getUserId(),
                cartItem.getProduct().getProductId(),
                cartItem.getProduct().getProductName(),
                cartItem.getQuantity(),
                cartItem.getPrice(),
                cartItem.getPrice() * cartItem.getQuantity(),
                cartItem.getCreatedAt()
        );
    }
}

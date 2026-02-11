package com.example.marketPlace.dto;

import java.math.BigDecimal;

public record ShippingOptionDTO(
        String name,        // Ex: "PAC", "SEDEX", ".Package (Jadlog)"
        BigDecimal price,   // Ex: 25.50
        Integer days        // Ex: 5 (dias úteis)
) {}
package com.example.marketPlace.dto;

import java.math.BigDecimal;

public record ShippingOptionDTO(
        String name,
        BigDecimal price,
        Integer days
) {}
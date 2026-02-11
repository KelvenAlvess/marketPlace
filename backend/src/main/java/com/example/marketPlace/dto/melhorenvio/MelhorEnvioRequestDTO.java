package com.example.marketPlace.dto.melhorenvio;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record MelhorEnvioRequestDTO(
        @JsonProperty("from") Location from,
        @JsonProperty("to") Location to,
        List<ProductPayload> products
) {
    public record Location(String postal_code) {}

    public record ProductPayload(
            String id,
            int width,
            int height,
            int length,
            double weight,
            double insurance_value,
            int quantity
    ) {}
}
package com.example.marketPlace.dto.melhorenvio;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MelhorEnvioResponseDTO(
        int id,
        String name,
        double price, // Pode vir string ou number, o Jackson tenta converter
        @JsonProperty("custom_price") double customPrice,
        @JsonProperty("delivery_time") int deliveryTime,
        Company company,
        String error
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Company(String name, String picture) {}
}
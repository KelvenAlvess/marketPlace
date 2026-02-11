package com.example.marketPlace.controller;

import com.example.marketPlace.dto.ShippingOptionDTO;
import com.example.marketPlace.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    @GetMapping("/calculate/{cep}")
    public ResponseEntity<List<ShippingOptionDTO>> calculateShipping(@PathVariable String cep) {
        return ResponseEntity.ok(shippingService.calculateOptions(cep));
    }
}
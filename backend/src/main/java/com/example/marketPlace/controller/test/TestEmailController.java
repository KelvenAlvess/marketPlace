package com.example.marketPlace.controller.test;

import com.example.marketPlace.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/test-email")
@RequiredArgsConstructor
public class TestEmailController {

    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<String> sendTestEmail(@RequestParam String email) {
        // Simula um envio de e-mail para o endereço que você passar na URL
        emailService.sendPaymentConfirmation(
                email,
                9999L, // ID do Pedido Falso
                new BigDecimal("150.00") // Valor Falso
        );

        return ResponseEntity.ok("E-mail de teste enviado para: " + email);
    }
}
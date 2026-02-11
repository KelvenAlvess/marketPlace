package com.example.marketPlace.controller;

import com.example.marketPlace.dto.PaymentRequestDTO;
import com.example.marketPlace.dto.PaymentResponseDTO;
import com.example.marketPlace.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pagamentos", description = "Gateway de Pagamento Seguro com Suporte a Idempotência")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/card")
    @Operation(summary = "Pagar com Cartão de Crédito")
    public ResponseEntity<PaymentResponseDTO> processCardPayment(@RequestBody @Valid PaymentRequestDTO request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @PostMapping("/pix")
    @Operation(summary = "Gerar Pagamento via PIX")
    public ResponseEntity<PaymentResponseDTO> processPixPayment(@RequestBody @Valid PaymentRequestDTO request) {
        return ResponseEntity.ok(paymentService.processPixPayment(request));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Webhook do Mercado Pago (Seguro)")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId) {

        log.info(" Webhook recebido: {}", payload);


        String id = extractId(payload);
        String type = (String) payload.getOrDefault("type", payload.get("topic"));

        if (id == null || type == null) {
            return ResponseEntity.badRequest().build();
        }

        if (xSignature != null && xRequestId != null) {
            boolean isValid = paymentService.validateWebhookSignature(xSignature, xRequestId, id);
            if (!isValid) {
                log.warn(" Webhook rejeitado: Assinatura inválida para ID {}", id);
                return ResponseEntity.status(403).build();
            }
        }

        if ("payment".equals(type)) {
            paymentService.processWebhook(type, id);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{transactionId}")
    @Operation(summary = "Consultar Status")
    public ResponseEntity<PaymentResponseDTO> getPaymentStatus(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(transactionId));
    }

    private String extractId(Map<String, Object> payload) {
        if (payload.get("data") instanceof Map) {
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            return String.valueOf(data.get("id"));
        } else if (payload.get("id") != null) {
            return String.valueOf(payload.get("id"));
        }
        return null;
    }
}
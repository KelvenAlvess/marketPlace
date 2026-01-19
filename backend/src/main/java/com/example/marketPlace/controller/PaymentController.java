package com.example.marketPlace.controller;

import com.example.marketPlace.dto.PaymentRequestDTO;
import com.example.marketPlace.dto.PaymentResponseDTO;
import com.example.marketPlace.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Pagamentos", description = "Gateway de Pagamento Seguro com Suporte a Idempotência")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/card")
    @Operation(
            summary = "Pagar com Cartão de Crédito",
            description = "Requer token do cartão (gerado no front), número de parcelas e chave de idempotência."
    )
    public ResponseEntity<PaymentResponseDTO> processCardPayment(@RequestBody @Valid PaymentRequestDTO request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @PostMapping("/pix")
    @Operation(
            summary = "Gerar Pagamento via PIX",
            description = "Gera o QR Code e o código Copia e Cola. Requer email e chave de idempotência."
    )
    public ResponseEntity<PaymentResponseDTO> processPixPayment(@RequestBody @Valid PaymentRequestDTO request) {
        return ResponseEntity.ok(paymentService.processPixPayment(request));
    }

    @PostMapping("/webhook")
    @Operation(
            summary = "Webhook do Mercado Pago",
            description = "Endpoint público para receber notificações de status de pagamento (não requer autenticação de usuário, validado internamente)."
    )
    public ResponseEntity<Void> handleWebhook(@RequestParam String topic, @RequestParam String id) {
        paymentService.processWebhook(topic, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{transactionId}")
    @Operation(
            summary = "Consultar Status",
            description = "Verifica o status atual de uma transação pelo ID do Mercado Pago."
    )
    public ResponseEntity<PaymentResponseDTO> getPaymentStatus(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(transactionId));
    }
}
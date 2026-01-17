package com.example.marketPlace.controller;

import com.example.marketPlace.dto.PaymentRequestDTO;
import com.example.marketPlace.dto.PaymentResponseDTO;
import com.example.marketPlace.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Pagamentos", description = "Endpoints para processamento de pagamentos via Mercado Pago")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/card")
    @Operation(summary = "Processar pagamento com cartão", description = "Processa pagamento usando token do cartão gerado pelo SDK JS do Mercado Pago")
    public ResponseEntity<PaymentResponseDTO> processCardPayment(@RequestBody PaymentRequestDTO request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @PostMapping("/pix")
    @Operation(summary = "Gerar pagamento PIX", description = "Gera QR Code PIX para pagamento do pedido")
    public ResponseEntity<PaymentResponseDTO> processPixPayment(
            @RequestParam Long orderId,
            @RequestParam String email) {
        return ResponseEntity.ok(paymentService.processPixPayment(orderId, email));
    }

    @GetMapping("/status/{transactionId}")
    @Operation(summary = "Consultar status do pagamento", description = "Consulta o status atual do pagamento no Mercado Pago")
    public ResponseEntity<PaymentResponseDTO> getPaymentStatus(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(transactionId));
    }
}

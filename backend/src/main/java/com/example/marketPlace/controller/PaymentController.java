package com.example.marketPlace.controller;

import com.example.marketPlace.dto.PaymentRequestDTO;
import com.example.marketPlace.dto.PaymentResponseDTO;
import com.example.marketPlace.service.OrderService; // <--- Importante
import com.example.marketPlace.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // <--- Logs são essenciais para Webhook
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate; // Para chamar API do MP
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pagamentos", description = "Gateway de Pagamento Seguro com Suporte a Idempotência")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService; // <--- Injeção do OrderService para baixar estoque

    @Value("${mercadopago.access.token}")
    private String mpAccessToken;

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
    @Operation(summary = "Webhook do Mercado Pago")
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {
        log.info("🔔 Webhook recebido no PaymentController: {}", payload);

        String type = (String) payload.get("type");

        if ("payment".equals(type) || "payment".equals(payload.get("topic"))) {
            try {
                String paymentId = null;
                if (payload.get("data") instanceof Map) {
                    Map<String, Object> data = (Map<String, Object>) payload.get("data");
                    paymentId = (String) data.get("id");
                } else if (payload.get("id") != null) {
                    paymentId = String.valueOf(payload.get("id"));
                }

                if (paymentId != null) {
                    checkPaymentStatus(paymentId);
                }

            } catch (Exception e) {
                log.error("Erro ao processar webhook: ", e);
            }
        }

        return ResponseEntity.ok().build();
    }

    private void checkPaymentStatus(String paymentId) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.mercadopago.com/v1/payments/" + paymentId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + mpAccessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map body = response.getBody();

            if (body != null) {
                String status = (String) body.get("status");
                String externalReference = (String) body.get("external_reference");

                log.info("💰 Pagamento {} | Status: {} | Pedido: {}", paymentId, status, externalReference);

                if ("approved".equals(status) && externalReference != null) {
                    Long orderId = Long.valueOf(externalReference);
                    // CHAMA O ORDER SERVICE PARA MUDAR STATUS E BAIXAR ESTOQUE
                    orderService.approveOrder(orderId);
                    log.info("✅ Pedido #{} aprovado via Webhook!", orderId);
                }
            }
        } catch (Exception e) {
            log.error("Falha ao consultar API do Mercado Pago", e);
        }
    }

    @GetMapping("/status/{transactionId}")
    @Operation(summary = "Consultar Status")
    public ResponseEntity<PaymentResponseDTO> getPaymentStatus(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(transactionId));
    }
}
package com.example.marketPlace.service;

import com.example.marketPlace.dto.PaymentEventDTO;
import com.example.marketPlace.dto.PaymentRequestDTO;
import com.example.marketPlace.dto.PaymentResponseDTO;
import com.example.marketPlace.exception.PaymentException;
import com.example.marketPlace.model.Order;
import com.example.marketPlace.model.Payment;
import com.example.marketPlace.model.enums.PaymentMethod;
import com.example.marketPlace.model.enums.PaymentStatus;
import com.example.marketPlace.repository.OrderRepository;
import com.example.marketPlace.repository.PaymentRepository;
import com.example.marketPlace.service.messaging.PaymentProducer;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentProducer paymentProducer;

    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO request) {
        return createPaymentIntegration(request, request.paymentMethodId());
    }

    @Transactional
    public PaymentResponseDTO processPixPayment(PaymentRequestDTO request) {
        return createPaymentIntegration(request, "pix");
    }

    private PaymentResponseDTO createPaymentIntegration(PaymentRequestDTO request, String methodId) {

        if (request.idempotencyKey() == null) {
            throw new PaymentException("Chave de idempotência é obrigatória");
        }

        if (paymentRepository.existsByIdempotencyKey(request.idempotencyKey().toString())) {
            throw new PaymentException("Transação já processada (Idempotência).");
        }

        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new PaymentException("Pedido não encontrado com ID: " + request.orderId()));

        if (order.getTotal() == null || order.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PaymentException("Valor do pedido inválido");
        }

        try {
            PaymentClient client = new PaymentClient();

            PaymentCreateRequest.PaymentCreateRequestBuilder builder = PaymentCreateRequest.builder()
                    .transactionAmount(order.getTotal())
                    .description("Pagamento Pedido #" + order.getOrderId())
                    .paymentMethodId(methodId)
                    .externalReference(order.getOrderId().toString())
                    .payer(PaymentPayerRequest.builder().email(request.email()).build());

            if (!"pix".equals(methodId) && !"bolbradesco".equals(methodId)) {
                if (request.token() == null || request.token().isBlank()) {
                    throw new PaymentException("Token do cartão é obrigatório");
                }
                if (request.installments() == null || request.installments() < 1) {
                    throw new PaymentException("Número de parcelas inválido");
                }
                builder.token(request.token()).installments(request.installments());
            }

            MPRequestOptions options = MPRequestOptions.builder()
                    .customHeaders(Map.of("X-Idempotency-Key", request.idempotencyKey().toString()))
                    .build();

            com.mercadopago.resources.payment.Payment mpPayment = client.create(builder.build(), options);
            return saveAndMapPayment(mpPayment, order, request.idempotencyKey().toString());

        } catch (PaymentException e) {
            throw e;
        } catch (MPApiException e) {
            log.error("Erro Mercado Pago API: Status={}, Message={}", e.getStatusCode(), e.getMessage(), e);
            throw new PaymentException("Erro ao processar pagamento no Mercado Pago: " + e.getMessage());
        } catch (MPException e) {
            log.error("Erro Mercado Pago: ", e);
            throw new PaymentException("Erro ao comunicar com Mercado Pago: " + e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao processar pagamento: ", e);
            throw new PaymentException("Erro inesperado ao processar pagamento");
        }
    }

    @Transactional
    public void processWebhook(String topic, String id) {
        if (!"payment".equals(topic)) return;

        try {
            PaymentClient client = new PaymentClient();
            com.mercadopago.resources.payment.Payment mpPayment = client.get(Long.parseLong(id));

            // Busca o pagamento no nosso banco
            Payment localPayment = paymentRepository.findByTransactionId(id).orElse(null);

            if (localPayment != null) {
                updateLocalPaymentStatus(localPayment, mpPayment.getStatus());
            }
        } catch (MPException | MPApiException e) {
            log.error("Erro webhook: ", e);
        }
    }

    @Transactional
    public void reconcilePendingPayments() {
        LocalDateTime cutOffTime = LocalDateTime.now().minusMinutes(5);
        List<Payment> pendingPayments = paymentRepository.findByStatusAndPaymentDateBefore(PaymentStatus.PENDING, cutOffTime);

        if (pendingPayments.isEmpty()) return;

        log.info("Reconciliador: Verificando {} pagamentos pendentes...", pendingPayments.size());
        PaymentClient client = new PaymentClient();

        for (Payment payment : pendingPayments) {
            try {
                com.mercadopago.resources.payment.Payment mpPayment = client.get(Long.parseLong(payment.getTransactionId()));

                boolean changed = updateLocalPaymentStatus(payment, mpPayment.getStatus());
                if (changed) {
                    log.info("Reconciliador: Pagamento {} recuperado! Novo status: {}", payment.getTransactionId(), mpPayment.getStatus());
                }
            } catch (Exception e) {
                log.error("Falha ao reconciliar pagamento " + payment.getTransactionId(), e);
            }
        }
    }

    private boolean updateLocalPaymentStatus(Payment payment, String mpStatusRaw) {
        PaymentStatus newStatus = mapMercadoPagoStatus(mpStatusRaw);

        if (payment.getStatus() != newStatus) {
            log.info("Atualizando status do pagamento {} de {} para {}", payment.getTransactionId(), payment.getStatus(), newStatus);
            payment.setStatus(newStatus);
            paymentRepository.save(payment);

            if (newStatus == PaymentStatus.COMPLETED) {

                String userEmail = payment.getOrder().getBuyer().getEmail();

                PaymentEventDTO event = new PaymentEventDTO(
                        payment.getOrder().getOrderId(),
                        userEmail,
                        payment.getAmount(),
                        newStatus.toString(),
                        payment.getTransactionId()
                );
                paymentProducer.sendPaymentSuccess(event);
            }
            return true;
        }
        return false;
    }

    public PaymentResponseDTO getPaymentStatus(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new PaymentException("Pagamento não encontrado"));
        return mapToResponse(payment, null, null);
    }

    private PaymentResponseDTO saveAndMapPayment(com.mercadopago.resources.payment.Payment mpPayment, Order order, String idempotencyKey) {
        Payment payment = new Payment();
        payment.setAmount(mpPayment.getTransactionAmount());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(mapPaymentMethod(mpPayment.getPaymentMethodId()));
        payment.setStatus(mapMercadoPagoStatus(mpPayment.getStatus()));
        payment.setTransactionId(mpPayment.getId().toString());
        payment.setIdempotencyKey(idempotencyKey);
        payment.setOrder(order);

        paymentRepository.save(payment);

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Pagamento aprovado imediatamente. Disparando evento de confirmação.");

            String userEmail = order.getBuyer().getEmail();

            PaymentEventDTO event = new PaymentEventDTO(
                    order.getOrderId(),
                    userEmail,
                    payment.getAmount(),
                    payment.getStatus().toString(),
                    payment.getTransactionId()
            );
            paymentProducer.sendPaymentSuccess(event);
        }

        String qrCode = null;
        String qrCodeBase64 = null;
        if (mpPayment.getPointOfInteraction() != null && mpPayment.getPointOfInteraction().getTransactionData() != null) {
            qrCode = mpPayment.getPointOfInteraction().getTransactionData().getQrCode();
            qrCodeBase64 = mpPayment.getPointOfInteraction().getTransactionData().getQrCodeBase64();
        }
        return mapToResponse(payment, qrCode, qrCodeBase64);
    }

    private PaymentResponseDTO mapToResponse(Payment payment, String qrCode, String qrCodeBase64) {
        return new PaymentResponseDTO(payment.getPaymentId(), payment.getTransactionId(), payment.getAmount(), payment.getStatus(), qrCode, qrCodeBase64, null);
    }

    private PaymentStatus mapMercadoPagoStatus(String status) {
        if (status == null) return PaymentStatus.PENDING;
        return switch (status) {
            case "approved" -> PaymentStatus.COMPLETED;
            case "pending", "in_process", "authorized" -> PaymentStatus.PENDING;
            case "refunded", "cancelled", "rejected" -> PaymentStatus.REFUNDED; // Adicionei rejected
            default -> PaymentStatus.FAILED;
        };
    }

    private PaymentMethod mapPaymentMethod(String methodId) {
        if (methodId == null) return PaymentMethod.CREDIT_CARD;
        return switch (methodId.toLowerCase()) {
            case "pix" -> PaymentMethod.PIX;
            case "bolbradesco" -> PaymentMethod.BANK_TRANSFER;
            case "debit_card" -> PaymentMethod.DEBIT_CARD;
            default -> PaymentMethod.CREDIT_CARD;
        };
    }
}
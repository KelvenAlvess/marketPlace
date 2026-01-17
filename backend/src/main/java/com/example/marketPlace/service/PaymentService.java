package com.example.marketPlace.service;

import com.example.marketPlace.dto.PaymentRequestDTO;
import com.example.marketPlace.dto.PaymentResponseDTO;
import com.example.marketPlace.exception.PaymentException;
import com.example.marketPlace.model.Order;
import com.example.marketPlace.model.Payment;
import com.example.marketPlace.model.enums.PaymentMethod;
import com.example.marketPlace.model.enums.PaymentStatus;
import com.example.marketPlace.repository.OrderRepository;
import com.example.marketPlace.repository.PaymentRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new PaymentException("Pedido não encontrado"));

        try {
            PaymentClient client = new PaymentClient();

            PaymentCreateRequest createRequest = PaymentCreateRequest.builder()
                    .transactionAmount(order.getTotal())
                    .token(request.token())
                    .description("Pedido #" + order.getOrderId())
                    .installments(request.installments() != null ? request.installments() : 1)
                    .paymentMethodId(request.paymentMethodId())
                    .payer(PaymentPayerRequest.builder()
                            .email(request.email())
                            .build())
                    .build();

            com.mercadopago.resources.payment.Payment mpPayment = client.create(createRequest);

            Payment payment = new Payment();
            payment.setAmount(order.getTotal());
            payment.setPaymentDate(LocalDateTime.now());
            payment.setPaymentMethod(mapPaymentMethod(request.paymentMethodId()));
            payment.setTransactionId(mpPayment.getId().toString());
            payment.setStatus(mapMercadoPagoStatus(mpPayment.getStatus()));
            payment.setOrder(order);

            Payment saved = paymentRepository.save(payment);

            return new PaymentResponseDTO(
                    saved.getPaymentId(),
                    saved.getTransactionId(),
                    saved.getAmount(),
                    saved.getStatus(),
                    null, null, null
            );

        } catch (MPApiException e) {
            log.error("Erro API MP: {}", e.getApiResponse().getContent());
            throw new PaymentException("Falha no pagamento: " + e.getMessage());
        } catch (MPException e) {
            log.error("Erro MP: {}", e.getMessage());
            throw new PaymentException("Erro ao processar pagamento");
        }
    }

    @Transactional
    public PaymentResponseDTO processPixPayment(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new PaymentException("Pedido não encontrado"));

        try {
            PaymentClient client = new PaymentClient();

            PaymentCreateRequest createRequest = PaymentCreateRequest.builder()
                    .transactionAmount(order.getTotal())
                    .description("Pedido #" + order.getOrderId())
                    .paymentMethodId("pix")
                    .payer(PaymentPayerRequest.builder()
                            .email(email)
                            .build())
                    .build();

            com.mercadopago.resources.payment.Payment mpPayment = client.create(createRequest);

            Payment payment = new Payment();
            payment.setAmount(order.getTotal());
            payment.setPaymentDate(LocalDateTime.now());
            payment.setPaymentMethod(PaymentMethod.PIX);
            payment.setTransactionId(mpPayment.getId().toString());
            payment.setStatus(mapMercadoPagoStatus(mpPayment.getStatus()));
            payment.setOrder(order);

            Payment saved = paymentRepository.save(payment);

            var pixInfo = mpPayment.getPointOfInteraction().getTransactionData();

            return new PaymentResponseDTO(
                    saved.getPaymentId(),
                    saved.getTransactionId(),
                    saved.getAmount(),
                    saved.getStatus(),
                    pixInfo.getQrCode(),
                    pixInfo.getQrCodeBase64(),
                    null
            );

        } catch (MPApiException | MPException e) {
            log.error("Erro PIX: {}", e.getMessage());
            throw new PaymentException("Erro ao gerar PIX");
        }
    }

    public PaymentResponseDTO getPaymentStatus(String transactionId) {
        try {
            PaymentClient client = new PaymentClient();
            com.mercadopago.resources.payment.Payment mpPayment = client.get(Long.parseLong(transactionId));

            Payment payment = paymentRepository.findByTransactionId(transactionId)
                    .orElseThrow(() -> new PaymentException("Pagamento não encontrado"));

            payment.setStatus(mapMercadoPagoStatus(mpPayment.getStatus()));
            paymentRepository.save(payment);

            return new PaymentResponseDTO(
                    payment.getPaymentId(),
                    payment.getTransactionId(),
                    payment.getAmount(),
                    payment.getStatus(),
                    null, null, null
            );

        } catch (MPException | MPApiException e) {
            throw new PaymentException("Erro ao consultar pagamento");
        }
    }

    private PaymentStatus mapMercadoPagoStatus(String status) {
        return switch (status) {
            case "approved" -> PaymentStatus.COMPLETED;
            case "pending", "in_process", "authorized" -> PaymentStatus.PENDING;
            case "refunded" -> PaymentStatus.REFUNDED;
            default -> PaymentStatus.FAILED;
        };
    }

    private PaymentMethod mapPaymentMethod(String methodId) {
        return switch (methodId.toLowerCase()) {
            case "pix" -> PaymentMethod.PIX;
            case "bolbradesco" -> PaymentMethod.BANK_TRANSFER;
            case "debit_card" -> PaymentMethod.DEBIT_CARD;
            default -> PaymentMethod.CREIDIT_CARD;
        };
    }
}

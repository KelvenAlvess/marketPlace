package com.example.marketPlace.service.messaging;

import com.example.marketPlace.configurations.RabbitMQConfig;
import com.example.marketPlace.dto.PaymentEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendPaymentSuccess(PaymentEventDTO event) {
        try {
            log.info("Enviando evento de pagamento aprovado para fila: {}", event.transactionId());
            rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_PAYMENT_SUCCESS, event);
        } catch (Exception e) {
            log.error("Erro ao enviar mensagem para RabbitMQ", e);
        }
    }
}
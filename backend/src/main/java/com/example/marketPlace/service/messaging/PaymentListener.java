package com.example.marketPlace.service.messaging;

import com.example.marketPlace.configurations.RabbitMQConfig;
import com.example.marketPlace.dto.PaymentEventDTO;
import com.example.marketPlace.model.Order;
import com.example.marketPlace.model.enums.OrderStatus;
import com.example.marketPlace.repository.OrderRepository;
import com.example.marketPlace.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentListener {

    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_PAYMENT_SUCCESS)
    @Transactional
    public void handlePaymentSuccess(PaymentEventDTO event) {
        log.info("Processando evento de pagamento para o Pedido #{}", event.orderId());

        try {

            Order order = orderRepository.findById(event.orderId())
                    .orElseThrow(() -> new RuntimeException("Pedido não encontrado na base de dados"));

            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);

            log.info("Status do pedido #{} atualizado para PAID no banco de dados.", event.orderId());

            emailService.sendPaymentConfirmation(event.email(), event.orderId(), event.amount());

        } catch (Exception e) {
            log.error("Erro crítico ao processar pós-venda do pedido #{}", event.orderId(), e);
            throw e;
        }
    }
}
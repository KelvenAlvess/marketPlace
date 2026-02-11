package com.example.marketPlace.configurations;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_PAYMENT_SUCCESS = "payment.success.queue";

    @Bean
    public Queue paymentSuccessQueue() {
        return QueueBuilder.durable(QUEUE_PAYMENT_SUCCESS)
                .withArgument("x-dead-letter-exchange", "") // Exchange padrão
                .withArgument("x-dead-letter-routing-key", "payment.success.dlq") // Vai pra fila DLQ
                .build();
    }

    @Bean
    public Queue paymentDlq() {
        return new Queue("payment.success.dlq", true); // Fila de erros
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
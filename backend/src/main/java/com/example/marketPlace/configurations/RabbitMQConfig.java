// src/main/java/com/example/marketPlace/configurations/RabbitMQConfig.java
package com.example.marketPlace.configurations;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_PAYMENT_SUCCESS = "payment.success.queue";

    @Bean
    public Queue paymentSuccessQueue() {
        // durable = true (a fila sobrevive se o RabbitMQ reiniciar)
        return new Queue(QUEUE_PAYMENT_SUCCESS, true);
    }

    // Configura o Spring para enviar JSON na mensagem (muito importante)
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
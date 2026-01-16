package com.example.marketPlace.exception;

public class OrderNotFoundException extends RuntimeException {

    public OrderNotFoundException(String message) {
        super(message);
    }

    public OrderNotFoundException(Long orderId) {
        super("Pedido não encontrado com ID: " + orderId);
    }
}

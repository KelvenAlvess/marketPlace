package com.example.marketPlace.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productName, Integer available, Integer requested) {
        super(String.format("Estoque insuficiente para o produto '%s'. Disponível: %d, Solicitado: %d",
            productName, available, requested));
    }
}


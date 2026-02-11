package com.example.marketPlace.exception;

public class EmptyCartException extends RuntimeException {
    public EmptyCartException(String message) {
        super(message);
    }

    public EmptyCartException(Long userId) {
        super("Carrinho vazio para o usuário com ID: " + userId);
    }
}


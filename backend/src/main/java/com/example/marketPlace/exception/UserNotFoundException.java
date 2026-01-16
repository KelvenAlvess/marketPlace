package com.example.marketPlace.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }

    public UserNotFoundException(Long userId) {
        super("Usuário não encontrado com ID: " + userId);
    }
}

package com.example.marketPlace.exception;

public class InvalidOrderStatusException extends RuntimeException {
    public InvalidOrderStatusException(String message) {
        super(message);
    }

    public InvalidOrderStatusException(String currentStatus, String requestedStatus) {
        super(String.format("Não é possível alterar status de '%s' para '%s'", currentStatus, requestedStatus));
    }
}


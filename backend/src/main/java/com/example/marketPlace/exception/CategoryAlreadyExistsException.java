package com.example.marketPlace.exception;

public class CategoryAlreadyExistsException extends RuntimeException {
    public CategoryAlreadyExistsException(String message) {
        super(message);
    }
}

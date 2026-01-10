package com.example.marketPlace.exception;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(String message) {
        super(message);
    }
}

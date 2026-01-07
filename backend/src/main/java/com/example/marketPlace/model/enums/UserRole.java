package com.example.marketPlace.model.enums;

public enum UserRole {
    BUYER("Buyer"),
    SELLER("Seller");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }
}

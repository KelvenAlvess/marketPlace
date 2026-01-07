package com.example.marketPlace.model.enums;

public enum PaymentMethod {
    CREIDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    PIX("Pix"),
    CASH("Cash"),
    BANK_TRANSFER("Bank Transfer");

    private String method;

        PaymentMethod(String method) {
            this.method = method;
        }
}

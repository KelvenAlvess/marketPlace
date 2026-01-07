package com.example.marketPlace.dto;

import com.example.marketPlace.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record UserResponseDTO(
        @JsonProperty("user_ID")
        Long userId,

        String userName,
        String email,
        String cpf,
        String phoneNumber,
        String address,
        LocalDateTime createdAt
) {
    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(
                user.getUser_ID(),
                user.getUserName(),
                user.getEmail(),
                user.getCpf(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getCreatedAt()
        );
    }
}

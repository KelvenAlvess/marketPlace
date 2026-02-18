package com.example.marketPlace.dto;

import com.example.marketPlace.model.User;
import com.example.marketPlace.model.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Set;

public record UserResponseDTO(
        @JsonProperty("user_ID")
        Long userId,

        String userName,
        String email,
        String cpf,
        String phoneNumber,
        String address,
        Set<UserRole> roles,
        LocalDateTime createdAt
) {
    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getCpf(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getRoles(),
                user.getCreatedAt()
        );
    }
}

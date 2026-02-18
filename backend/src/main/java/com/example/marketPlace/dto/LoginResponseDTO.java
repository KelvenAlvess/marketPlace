package com.example.marketPlace.dto;

import com.example.marketPlace.model.enums.UserRole;

import java.util.Set;

public record LoginResponseDTO(
        Long userId,
        String userName,
        String email,
        Set<UserRole> roles,
        String token
) {}

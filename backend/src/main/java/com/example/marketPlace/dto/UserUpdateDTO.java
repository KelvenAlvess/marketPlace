package com.example.marketPlace.dto;

import com.example.marketPlace.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record UserUpdateDTO(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String userName,

        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "CPF é obrigatório")
        @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
        String cpf,

        @Pattern(regexp = "\\d{10,11}", message = "Telefone deve conter 10 ou 11 dígitos")
        String phoneNumber,

        @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
        String password,

        @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
        String address,

        Set<UserRole> roles
) {}
package com.example.marketPlace.controller;

import com.example.marketPlace.configurations.JwtTokenUtil;
import com.example.marketPlace.dto.UserCreateDTO;
import com.example.marketPlace.dto.UserResponseDTO;
import com.example.marketPlace.dto.UserUpdateDTO; // Importante!
import com.example.marketPlace.model.enums.UserRole;
import com.example.marketPlace.service.CustomUserDetailsService;
import com.example.marketPlace.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false) // Desabilita segurança para facilitar teste unitário do controller
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserResponseDTO userResponseDTO;
    private UserCreateDTO userCreateDTO;

    @BeforeEach
    void setUp() {
        userResponseDTO = new UserResponseDTO(
                1L,
                "Test User",
                "test@example.com",
                "12345678901",
                "11999999999",
                "Test Address",
                Set.of(UserRole.BUYER),
                LocalDateTime.now()
        );

        userCreateDTO = new UserCreateDTO(
                "Test User",
                "test@example.com",
                "12345678901",
                "11999999999",
                "password123",
                "Test Address",
                Set.of(UserRole.BUYER)
        );
    }

    @Test
    void createUser_ShouldReturnCreatedUser() throws Exception {
        when(userService.createUser(any(UserCreateDTO.class))).thenReturn(userResponseDTO);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userCreateDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user_ID").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getAllUsers_ShouldReturnList() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(userResponseDTO));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].user_ID").value(1L));
    }

    @Test
    void getUserById_ShouldReturnUser() throws Exception {
        when(userService.getUserById(1L)).thenReturn(userResponseDTO);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_ID").value(1L));
    }

    @Test
    void updateUser_ShouldReturnUpdatedUser() throws Exception {
        // CORREÇÃO: Usamos UserUpdateDTO aqui, pois o Controller agora exige isso
        UserUpdateDTO updateDTO = new UserUpdateDTO(
                "Updated Name",
                "test@example.com",
                "12345678901",
                "11999999999",
                null, // Senha nula é permitida no update
                "Updated Address",
                Set.of(UserRole.BUYER)
        );

        UserResponseDTO updatedResponse = new UserResponseDTO(
                1L,
                "Updated Name",
                "test@example.com",
                "12345678901",
                "11999999999",
                "Updated Address",
                Set.of(UserRole.BUYER),
                LocalDateTime.now()
        );

        // Ajustamos o Mock para esperar UserUpdateDTO
        when(userService.updateUser(eq(1L), any(UserUpdateDTO.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("Updated Name"));
    }

    @Test
    void deleteUser_ShouldReturnNoContent() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }
}
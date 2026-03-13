package com.example.marketPlace.controller;

import com.example.marketPlace.configurations.JwtTokenUtil;
import com.example.marketPlace.dto.UserCreateDTO;
import com.example.marketPlace.dto.UserResponseDTO;
import com.example.marketPlace.dto.UserUpdateDTO;
import com.example.marketPlace.model.enums.UserRole;
import com.example.marketPlace.service.CustomUserDetailsService;
import com.example.marketPlace.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // Essa linha é quem cria o MockMvc!
@ActiveProfiles("test")
class UserControllerTest {

    private static final String BASE_URL = "/api/users";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtTokenUtil jwtTokenUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private UserResponseDTO defaultUserResponse;

    private UserCreateDTO defaultUserCreate;

    @BeforeEach
    void setUp() {
        defaultUserResponse = new UserResponseDTO(
                1L,
                "Test User",
                "test@example.com",
                "12345678901",
                "11999999999",
                "Test Address",
                Set.of(UserRole.BUYER),
                LocalDateTime.now()
        );

        defaultUserCreate = new UserCreateDTO(
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
    @DisplayName("POST /api/users - Deve criar um usuário e retornar 201 Created")
    void createUser_ShouldReturnCreatedUser() throws Exception {
        when(userService.createUser(any(UserCreateDTO.class))).thenReturn(defaultUserResponse);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(defaultUserCreate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user_ID").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("GET /api/users - Deve retornar lista de usuários e status 200 OK")
    void getAllUsers_ShouldReturnList() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(defaultUserResponse));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].user_ID").value(1L))
                .andExpect(jsonPath("$[0].userName").value("Test User"));
    }

    @Test
    @DisplayName("GET /api/users/{id} - Deve retornar um usuário específico e status 200 OK")
    void getUserById_ShouldReturnUser() throws Exception {
        when(userService.getUserById(1L)).thenReturn(defaultUserResponse);

        mockMvc.perform(get(BASE_URL + "/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_ID").value(1L));
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Deve atualizar um usuário e retornar status 200 OK")
    void updateUser_ShouldReturnUpdatedUser() throws Exception {
        var updateDTO = new UserUpdateDTO(
                "Updated Name",
                "test@example.com",
                "12345678901",
                "11999999999",
                null,
                "Updated Address",
                Set.of(UserRole.BUYER)
        );

        var updatedResponse = new UserResponseDTO(
                1L,
                "Updated Name",
                "test@example.com",
                "12345678901",
                "11999999999",
                "Updated Address",
                Set.of(UserRole.BUYER),
                LocalDateTime.now()
        );

        when(userService.updateUser(eq(1L), any(UserUpdateDTO.class))).thenReturn(updatedResponse);

        mockMvc.perform(put(BASE_URL + "/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("Updated Name"));
    }

    @Test
    @DisplayName("DELETE /api/users/{id} - Deve deletar um usuário e retornar 204 No Content")
    void deleteUser_ShouldReturnNoContent() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete(BASE_URL + "/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
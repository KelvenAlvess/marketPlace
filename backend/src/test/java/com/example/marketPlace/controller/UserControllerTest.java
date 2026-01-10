package com.example.marketPlace.controller;

import com.example.marketPlace.dto.UserCreateDTO;
import com.example.marketPlace.dto.UserResponseDTO;
import com.example.marketPlace.model.enums.UserRole;
import com.example.marketPlace.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    private UserCreateDTO userCreateDTO;
    private UserResponseDTO userResponseDTO;

    @BeforeEach
    void setUp() {
        userCreateDTO = new UserCreateDTO(
                "Test User",
                "test@example.com",
                "12345678901",
                "1234567890",
                "password123",
                "Test Address",
                Set.of(UserRole.BUYER)
        );

        userResponseDTO = new UserResponseDTO(
                1L,
                "Test User",
                "test@example.com",
                "12345678901",
                "1234567890",
                "Test Address",
                Set.of(UserRole.BUYER),
                LocalDateTime.now()
        );
    }

    @Test
    void testCreateUser() throws Exception {
        when(userService.createUser(any(UserCreateDTO.class))).thenReturn(userResponseDTO);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userCreateDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void testCreateUserInvalidData() throws Exception {
        UserCreateDTO invalidDTO = new UserCreateDTO(
                "",
                "invalid-email",
                "123",
                "abc",
                "123",
                "",
                Set.of(UserRole.BUYER)
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetUserById() throws Exception {
        when(userService.getUserById(1L)).thenReturn(userResponseDTO);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void testUpdateUser() throws Exception {
        UserCreateDTO updateDTO = new UserCreateDTO(
                "Updated User",
                "updated@example.com",
                "12345678901",
                "1234567890",
                "newpassword123",
                "Updated Address",
                Set.of(UserRole.SELLER)
        );

        UserResponseDTO updatedResponse = new UserResponseDTO(
                1L,
                "Updated User",
                "updated@example.com",
                "12345678901",
                "1234567890",
                "Updated Address",
                Set.of(UserRole.SELLER),
                LocalDateTime.now()
        );

        when(userService.updateUser(any(Long.class), any(UserCreateDTO.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    @Test
    void testDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }
}

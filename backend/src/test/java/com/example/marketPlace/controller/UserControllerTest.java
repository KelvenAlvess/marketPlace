package com.example.marketPlace.controller;

import com.example.marketPlace.MarketPlaceApplication;
import com.example.marketPlace.configurations .TestSecurityConfig;
import com.example.marketPlace.dto.UserCreateDTO;
import com.example.marketPlace.dto.UserResponseDTO;
import com.example.marketPlace.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@ContextConfiguration(classes = {MarketPlaceApplication.class})
@Import(TestSecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @Test
    void deveCriarUsuarioComSucesso() throws Exception {
        UserCreateDTO request = new UserCreateDTO(
                "João Silva",
                "joao@email.com",
                "12345678901",
                "11987654321",
                "senha123",
                "Rua das Flores, 123"
        );

        UserResponseDTO response = new UserResponseDTO(
                1L,
                "João Silva",
                "joao@email.com",
                "12345678901",
                "11987654321",
                "Rua das Flores, 123",
                LocalDateTime.now()
        );

        when(userService.createUser(any(UserCreateDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user_ID").value(1))
                .andExpect(jsonPath("$.userName").value("João Silva"));
    }

    @Test
    void deveRetornar400QuandoEmailInvalido() throws Exception {
        UserCreateDTO request = new UserCreateDTO(
                "Teste",
                "emailinvalido",
                "12345678901",
                "11987654321",
                "senha123",
                "Rua Teste, 123"
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar400QuandoCpfInvalido() throws Exception {
        UserCreateDTO request = new UserCreateDTO(
                "Teste",
                "teste@email.com",
                "123",
                "11987654321",
                "senha123",
                "Rua Teste, 123"
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar400QuandoSenhaCurta() throws Exception {
        UserCreateDTO request = new UserCreateDTO(
                "Teste",
                "teste@email.com",
                "12345678901",
                "11987654321",
                "123",
                "Rua Teste, 123"
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveListarTodosOsUsuarios() throws Exception {
        when(userService.getAllUsers()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void deveBuscarUsuarioPorId() throws Exception {
        UserResponseDTO response = new UserResponseDTO(
                1L,
                "João Silva",
                "joao@email.com",
                "12345678901",
                "11987654321",
                "Rua das Flores, 123",
                LocalDateTime.now()
        );

        when(userService.getUserById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_ID").value(1))
                .andExpect(jsonPath("$.userName").value("João Silva"));
    }
}

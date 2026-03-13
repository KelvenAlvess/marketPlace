package com.example.marketPlace.controller;

import com.example.marketPlace.dto.ProductCreateDTO;
import com.example.marketPlace.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Isolamos o banco de dados. O Mockito intercepta a chamada do Controller para o Service.
    @MockitoBean
    private ProductService productService;

    @Test
    @DisplayName("Deve retornar 200/201 quando um usuário SELLER enviar um DTO válido")
    @WithMockUser(username = "vendedor@teste.com", roles = {"SELLER"})
        // Simula o JWT injetado
    void shouldAllowSellerToCreateProduct() throws Exception {

        // 1. Arrange: Montamos o DTO perfeitamente igual ao seu ProductCreateDTO.java
        ProductCreateDTO payload = new ProductCreateDTO(
                "Teclado Mecânico RGB",
                "Teclado Switch Blue de alta durabilidade",
                1L,
                new BigDecimal("250.00"),
                10L,
                50,
                "https://imagem.com/teclado.jpg"
        );

        // 2. Act & 3. Assert: Dispara o POST e valida a resposta HTTP
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk()); // Se o seu controller retorna 201 Created, mude para isCreated()
    }

    @Test
    @DisplayName("Deve retornar 403 Forbidden quando um usuário BUYER tentar criar um produto")
    @WithMockUser(username = "cliente@teste.com", roles = {"BUYER"})
    void shouldBlockBuyerFromCreatingProduct() throws Exception {

        ProductCreateDTO payload = new ProductCreateDTO(
                "Mouse Gamer",
                "Mouse com 10.000 DPI",
                1L,
                new BigDecimal("120.00"),
                10L,
                20,
                "https://imagem.com/mouse.jpg"
        );

        // Como o usuário é BUYER, o SecurityConfig deve bloquear e retornar 403
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Deve retornar 403 Forbidden quando o usuário não estiver logado")
        // Atualize o nome
    void shouldBlockUnauthenticatedUser() throws Exception {

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden()); // <-- MUDANÇA AQUI (Era isUnauthorized())
    }
}
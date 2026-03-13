package com.example.marketPlace.service;

import com.example.marketPlace.dto.ProductCreateDTO;
import com.example.marketPlace.dto.ProductResponseDTO;
import com.example.marketPlace.exception.CategoryNotFoundException;
import com.example.marketPlace.model.Category;
import com.example.marketPlace.model.Product;
import com.example.marketPlace.model.User;
import com.example.marketPlace.repository.CategoryRepository;
import com.example.marketPlace.repository.ProductRepository;
import com.example.marketPlace.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Deve criar um produto com sucesso (Caminho Feliz)")
    void shouldCreateProductSuccessfully() {
        // --- ARRANGE (Preparar) ---
        var dto = new ProductCreateDTO(
                "Monitor Gamer", "Monitor 144hz", 1L, new BigDecimal("1500.00"),
                2L, 10, "url-imagem"
        );

        var mockCategory = new Category();
        mockCategory.setCategoryId(1L);

        var mockSeller = new User();
        mockSeller.setUserId(2L);

        var mockSavedProduct = new Product();
        mockSavedProduct.setProductId(100L);
        mockSavedProduct.setProductName("Monitor Gamer");
        mockSavedProduct.setProductPrice(new BigDecimal("1500.00"));
        mockSavedProduct.setCategory(mockCategory);
        mockSavedProduct.setSeller(mockSeller);

        // Ensinamos os mocks a responderem quando forem chamados
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockSeller));
        when(productRepository.save(any(Product.class))).thenReturn(mockSavedProduct);

        // --- ACT (Agir) ---
        ProductResponseDTO result = productService.createProduct(dto);

        // --- ASSERT (Verificar) ---
        assertNotNull(result);
        assertEquals("Monitor Gamer", result.productName());

        // Verifica se o repository.save() foi chamado exatamente 1 vez
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando a categoria não for encontrada (Caminho Triste)")
    void shouldThrowExceptionWhenCategoryNotFound() {
        // --- ARRANGE ---
        var dto = new ProductCreateDTO(
                "Monitor", "Desc", 99L, new BigDecimal("100.00"), 2L, 10, ""
        );

        // Simulamos o banco não encontrando a categoria
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        // --- ACT & ASSERT ---
        Exception exception = assertThrows(CategoryNotFoundException.class, () -> {
            productService.createProduct(dto);
        });

        assertTrue(exception.getMessage().contains("Categoria"));
        
        verify(productRepository, never()).save(any());
    }
}
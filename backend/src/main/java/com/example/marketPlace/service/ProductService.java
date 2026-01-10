package com.example.marketPlace.service;

import com.example.marketPlace.dto.ProductCreateDTO;
import com.example.marketPlace.dto.ProductResponseDTO;
import com.example.marketPlace.exception.ProductNotFoundException;
import com.example.marketPlace.model.Category;
import com.example.marketPlace.model.Product;
import com.example.marketPlace.model.User;
import com.example.marketPlace.repository.CategoryRepository;
import com.example.marketPlace.repository.ProductRepository;
import com.example.marketPlace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProductResponseDTO createProduct(ProductCreateDTO dto) {
        log.info("Criando produto: {}", dto.productName());

        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada com ID: " + dto.categoryId()));

        User seller = userRepository.findById(dto.sellerId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado com ID: " + dto.sellerId()));

        Product product = dto.toEntity(category, seller);
        Product savedProduct = productRepository.save(product);

        log.info("Produto criado com sucesso. ID: {}", savedProduct.getProduct_ID());
        return ProductResponseDTO.from(savedProduct);
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        log.info("Buscando produto por ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Produto não encontrado. ID: {}", id);
                    return new ProductNotFoundException("Produto não encontrado com ID: " + id);
                });

        return ProductResponseDTO.from(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        log.info("Listando todos os produtos");

        return productRepository.findAll().stream()
                .map(ProductResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByCategory(Long categoryId) {
        log.info("Buscando produtos da categoria: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada com ID: " + categoryId));

        return productRepository.findByCategory(category).stream()
                .map(ProductResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsBySeller(Long sellerId) {
        log.info("Buscando produtos do vendedor: {}", sellerId);

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado com ID: " + sellerId));

        return productRepository.findBySeller(seller).stream()
                .map(ProductResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductCreateDTO dto) {
        log.info("Atualizando produto. ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Produto não encontrado com ID: " + id));

        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada com ID: " + dto.categoryId()));

        User seller = userRepository.findById(dto.sellerId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado com ID: " + dto.sellerId()));

        product.setProductName(dto.productName());
        product.setDescription(dto.description());
        product.setCategory(category);
        product.setProductPrice(dto.price());
        product.setSeller(seller);
        product.setStockQuantity(dto.stockQuantity());

        Product updatedProduct = productRepository.save(product);
        log.info("Produto atualizado com sucesso. ID: {}", updatedProduct.getProduct_ID());

        return ProductResponseDTO.from(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deletando produto. ID: {}", id);

        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Produto não encontrado com ID: " + id);
        }

        productRepository.deleteById(id);
        log.info("Produto deletado com sucesso. ID: {}", id);
    }

    @Transactional
    public ProductResponseDTO updateStock(Long id, Integer quantity) {
        log.info("Atualizando estoque do produto. ID: {}, Quantidade: {}", id, quantity);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Produto não encontrado com ID: " + id));

        product.setStockQuantity(quantity);
        Product updatedProduct = productRepository.save(product);

        log.info("Estoque atualizado com sucesso. ID: {}, Novo estoque: {}", id, quantity);
        return ProductResponseDTO.from(updatedProduct);
    }
}

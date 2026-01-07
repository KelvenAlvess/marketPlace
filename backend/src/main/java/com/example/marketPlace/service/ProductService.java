package com.example.marketPlace.service;

import com.example.marketPlace.dto.ProductCreateDTO;
import com.example.marketPlace.dto.ProductResponseDTO;
import com.example.marketPlace.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponseDTO createProduct(ProductCreateDTO dto) {
        var product = productRepository.save(dto.toEntity());
        return ProductResponseDTO.from(product);
    }

    public ProductResponseDTO getProductById(Long id) {
        var product = productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + id));
        return ProductResponseDTO.from(product);
    }

    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream().
                map(ProductResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductCreateDTO dto) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + id));

        validateProductData(dto);

        product.setProductName(dto.productName());
        product.setDescription(dto.description());
        product.setProductPrice(dto.price());
        product.setCategory(dto.category());
        product.setSeller(dto.seller());
        product.setStockQuantity(dto.stockQuantity());

        var updatedProduct = productRepository.save(product);
        return ProductResponseDTO.from(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if(!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Produto não encontrado com ID: " + id);
        }
        productRepository.deleteById(id);
    }

    public List<ProductResponseDTO> getProductBySeller(Long sellerId) {
        return productRepository.findAll()
                .stream()
                .filter(product -> product.getSeller().getUser_ID().equals(sellerId))
                .map(ProductResponseDTO::from)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getProductByCategory(Long categoryId) {
        return productRepository.findAll()
                .stream()
                .filter(product -> product.getCategory().getCategory_ID().equals(categoryId))
                .map(ProductResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDTO updateProductStockQuantity(Long id, Integer stockQuantity) {
        var product = productRepository.findById(id)
                .orElseThrow(()-> new EntityNotFoundException("Produto não encontrado com ID: " + id));

        if(stockQuantity < 0) {
            throw new IllegalArgumentException("A quantidade em estoque não pode ser negativa.");
        }

        product.setStockQuantity(stockQuantity);
        var updateProduct = productRepository.save(product);
        return ProductResponseDTO.from(updateProduct);
    }

    public void validateProductData(ProductCreateDTO dto) {
        if(dto.price().signum() <= 0) {
            throw new IllegalArgumentException("O preço do produto deve ser maior que zero.");
        }

        if(dto.stockQuantity() < 0){
            throw new IllegalArgumentException("A quantidade em estoque não pode ser negativa.");
        }
    }
}

package com.example.marketPlace.service;

import com.example.marketPlace.dto.CategoryCreateDTO;
import com.example.marketPlace.dto.CategoryResponseDTO;
import com.example.marketPlace.exception.CategoryAlreadyExistsException;
import com.example.marketPlace.exception.CategoryNotFoundException;
import com.example.marketPlace.model.Category;
import com.example.marketPlace.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponseDTO createCategory(CategoryCreateDTO dto) {
        log.info("Criando categoria: {}", dto.name());

        if (categoryRepository.existsByName(dto.name())) {
            throw new CategoryAlreadyExistsException("Categoria já existe: " + dto.name());
        }

        Category category = new Category();
        category.setName(dto.name());

        Category savedCategory = categoryRepository.save(category);
        log.info("Categoria criada com sucesso. ID: {}", savedCategory.getCategoryId());

        return CategoryResponseDTO.from(savedCategory);
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(Long id) {
        log.info("Buscando categoria por ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Categoria não encontrada. ID: {}", id);
                    return new CategoryNotFoundException("Categoria não encontrada com ID: " + id);
                });

        return CategoryResponseDTO.from(category);
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryByName(String name) {
        log.info("Buscando categoria por nome: {}", name);

        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> {
                    log.warn("Categoria não encontrada. Nome: {}", name);
                    return new CategoryNotFoundException("Categoria não encontrada: " + name);
                });

        return CategoryResponseDTO.from(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        log.info("Listando todas as categorias");

        return categoryRepository.findAll().stream()
                .map(CategoryResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryCreateDTO dto) {
        log.info("Atualizando categoria. ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Categoria não encontrada com ID: " + id));

        if (!category.getName().equals(dto.name()) && categoryRepository.existsByName(dto.name())) {
            throw new CategoryAlreadyExistsException("Categoria já existe: " + dto.name());
        }

        category.setName(dto.name());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Categoria atualizada com sucesso. ID: {}", updatedCategory.getCategoryId());

        return CategoryResponseDTO.from(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deletando categoria. ID: {}", id);

        if (!categoryRepository.existsById(id)) {
            throw new CategoryNotFoundException("Categoria não encontrada com ID: " + id);
        }

        categoryRepository.deleteById(id);
        log.info("Categoria deletada com sucesso. ID: {}", id);
    }

    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return categoryRepository.existsByName(name);
    }
}

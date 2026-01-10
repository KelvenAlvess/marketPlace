package com.example.marketPlace.controller;

import com.example.marketPlace.dto.CartItemCreateDTO;
import com.example.marketPlace.dto.CartItemResponseDTO;
import com.example.marketPlace.dto.UpdateQuantityDTO;
import com.example.marketPlace.service.CartItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
@RequiredArgsConstructor
@Tag(name = "Cart Item Controller", description = "APIs para gerenciamento dos itens do carrinho de compras")
public class CartItemController {

    private final CartItemService cartItemService;

    @PostMapping
    @Operation(summary = "Adiciona um item ao carrinho de compras", description = "Adiciona um novo item ao carrinho de compras do usuário")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Item adicionado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuário ou produto não encontrado")
    })
    public ResponseEntity<CartItemResponseDTO> addItem(@RequestBody @Valid CartItemCreateDTO dto) {
        CartItemResponseDTO response = cartItemService.saveCartItem(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um item do carrinho de compras", description = "Atualiza a quantidade de um item no carrinho de compras do usuário")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Item não encontrado")
    })
    public ResponseEntity<CartItemResponseDTO> updateItem(
            @PathVariable Long id,
            @RequestBody @Valid UpdateQuantityDTO dto) {
        CartItemResponseDTO response = cartItemService.updateCartItemQuantity(id, dto.quantity());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um item do carrinho de compras", description = "Remove um item do carrinho de compras do usuário")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Item removido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Item não encontrado")
    })
    public ResponseEntity<Void> removeItem(@PathVariable Long id) {
        cartItemService.deleteCartItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lista os itens do carrinho de compras", description = "Retorna a lista de itens no carrinho de compras do usuário")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<List<CartItemResponseDTO>> getCartItems(@PathVariable Long userId) {
        List<CartItemResponseDTO> response = cartItemService.getCartItemsByUser(userId);
        return ResponseEntity.ok(response);
    }
}

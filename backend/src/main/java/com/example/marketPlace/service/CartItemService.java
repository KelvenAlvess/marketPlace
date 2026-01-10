package com.example.marketPlace.service;

import com.example.marketPlace.dto.CartItemCreateDTO;
import com.example.marketPlace.dto.CartItemResponseDTO;
import com.example.marketPlace.model.CartItem;
import com.example.marketPlace.model.Product;
import com.example.marketPlace.model.User;
import com.example.marketPlace.repository.CartItemRepository;
import com.example.marketPlace.repository.ProductRepository;
import com.example.marketPlace.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartItemResponseDTO saveCartItem(CartItemCreateDTO dto){
        log.info("Adicionando item ao carrinho: {}", dto.productId());

        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + dto.userId()));

        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        CartItem cartItem = new CartItem();
        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(dto.quantity());
        cartItem.setPrice(product.getProductPrice().doubleValue());

        CartItem savedCartItem = cartItemRepository.save(cartItem);

        return CartItemResponseDTO.from(savedCartItem);
    }

    @Transactional
    public void deleteCartItem(Long cartItemId){
        log.info("Removendo item do carrinho: {}", cartItemId);
        cartItemRepository.deleteById(cartItemId);
    }

    public List<CartItemResponseDTO> getCartItemsByUser(Long userId){
        log.info("Buscando itens do carrinho do usuário: {}", userId);
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        return cartItems.stream()
                .map(CartItemResponseDTO::from)
                .toList();
    }

    @Transactional
    public CartItemResponseDTO updateCartItemQuantity(Long cartItemId, Integer quantity){
        log.info("Atualizando quantidade do item do carrinho: {}", cartItemId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item do carrinho não encontrado com ID: " + cartItemId));
        cartItem.setQuantity(quantity);
        CartItem updatedCartItem = cartItemRepository.save(cartItem);
        return CartItemResponseDTO.from(updatedCartItem);
    }
}

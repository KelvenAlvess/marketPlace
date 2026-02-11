package com.example.marketPlace.service;

import com.example.marketPlace.dto.*;
import com.example.marketPlace.exception.*;
import com.example.marketPlace.model.*;
import com.example.marketPlace.model.enums.OrderStatus;
import com.example.marketPlace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponseDTO createOrderFromCart(OrderCreateDTO dto) {
        log.info("Criando pedido para o usuário ID: {}", dto.userId());

        // 1. Buscar Usuário
        User buyer = userRepository.findById(dto.userId())
                .orElseThrow(() -> new UserNotFoundException(dto.userId()));

        // 2. Buscar Itens do Carrinho
        List<CartItem> cartItems = cartItemRepository.findByUser(buyer);

        if (cartItems.isEmpty()) {
            throw new EmptyCartException(dto.userId());
        }

        // 3. Validar Estoque (Lança exceção se falhar)
        validateStock(cartItems);

        // 4. Criar o Pedido (Cabeçalho)
        Order order = new Order();
        order.setBuyer(buyer);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        // 5. Converter CartItems em OrderItems e Calcular Totais
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order); // Vínculo Bidirecional Importante
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());

            // Conversão segura de Double (Cart) para BigDecimal (Order)
            BigDecimal unitPrice = BigDecimal.valueOf(cartItem.getPrice());
            orderItem.setUnitPrice(unitPrice);

            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            orderItem.setSubtotal(subtotal);

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(subtotal);

            // Baixa no Estoque
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setItems(orderItems);
        order.setTotal(totalAmount);

        // 6. Salvar Pedido (Cascade salvará os itens)
        Order savedOrder = orderRepository.save(order);
        log.info("Pedido criado com sucesso: ID {}", savedOrder.getOrderId());

        // 7. Limpar Carrinho
        cartItemRepository.deleteAll(cartItems);

        // 8. Retornar DTO
        // Precisamos converter os OrderItems salvos para DTOs para a resposta
        List<OrderItemResponseDTO> itemDTOs = savedOrder.getItems().stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(savedOrder, itemDTOs);
    }

    private void validateStock(List<CartItem> cartItems) {
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(
                        product.getProductName(),
                        product.getStockQuantity(),
                        item.getQuantity()
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        List<OrderItemResponseDTO> itemDTOs = order.getItems().stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(order, itemDTOs);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(Long userId) {
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        return orderRepository.findByBuyerOrderByOrderDateDesc(buyer).stream()
                .map(order -> {
                    List<OrderItemResponseDTO> itemDTOs = order.getItems().stream()
                            .map(OrderItemResponseDTO::from)
                            .collect(Collectors.toList());
                    return OrderResponseDTO.from(order, itemDTOs);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> {
                    List<OrderItemResponseDTO> itemDTOs = order.getItems().stream()
                            .map(OrderItemResponseDTO::from)
                            .collect(Collectors.toList());
                    return OrderResponseDTO.from(order, itemDTOs);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatusUpdateDTO dto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        validateStatusTransition(order.getStatus(), dto.status());

        order.setStatus(dto.status());
        Order updatedOrder = orderRepository.save(order);

        List<OrderItemResponseDTO> itemDTOs = updatedOrder.getItems().stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(updatedOrder, itemDTOs);
    }

    @Transactional
    public OrderResponseDTO cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Verifica se o usuário é dono do pedido ou ADMIN (simplificado aqui só checando ID)
        if (!order.getBuyer().getUserId().equals(userId)) {

            throw new RuntimeException("Usuário não tem permissão para cancelar este pedido");
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED) {
            throw new InvalidOrderStatusException("Não é possível cancelar pedido já enviado ou entregue");
        }

        order.setStatus(OrderStatus.CANCELED);
        Order canceledOrder = orderRepository.save(order);

        // Devolve o estoque
        returnStockFromOrder(canceledOrder);

        List<OrderItemResponseDTO> itemDTOs = canceledOrder.getItems().stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(canceledOrder, itemDTOs);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.CANCELED) {
            throw new RuntimeException("Apenas pedidos cancelados podem ser deletados");
        }

        orderRepository.delete(order);
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELED) {
            throw new InvalidOrderStatusException(
                    "Não é possível alterar status de um pedido " + currentStatus);
        }
    }

    private void returnStockFromOrder(Order order) {
        for (OrderItem orderItem : order.getItems()) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);

            log.info("Estoque devolvido: {} +{} unidades",
                    product.getProductName(),
                    orderItem.getQuantity());
        }
    }
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByOrderDateDesc(status).stream()
                .map(order -> {
                    // Mapeia os itens do pedido
                    List<OrderItemResponseDTO> itemDTOs = order.getItems().stream()
                            .map(OrderItemResponseDTO::from)
                            .collect(Collectors.toList());
                    // Retorna o DTO completo
                    return OrderResponseDTO.from(order, itemDTOs);
                })
                .collect(Collectors.toList());
    }
    @Transactional
    public OrderResponseDTO updateShippingCost(Long orderId, BigDecimal shippingCost) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Não é possível alterar frete de pedido finalizado");
        }

        BigDecimal itemsTotal = order.getItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setShippingCost(shippingCost);
        order.setTotal(itemsTotal.add(shippingCost));

        Order savedOrder = orderRepository.save(order);
        return toDTO(savedOrder);
    }

    @Transactional
    public void decrementStock(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int newQty = product.getStockQuantity() - item.getQuantity();
            if (newQty < 0) {
                throw new RuntimeException("Estoque insuficiente para: " + product.getProductName());
            }
            product.setStockQuantity(newQty);
            productRepository.save(product);
        }
    }

    // === CONVERSOR ===
    private OrderResponseDTO toDTO(Order order) {
        // Converte os itens primeiro
        List<OrderItemResponseDTO> itemsDTO = order.getItems().stream()
                .map(item -> new OrderItemResponseDTO(
                        item.getOrderItemId(),
                        item.getProduct().getProductId(),
                        item.getProduct().getProductName(),
                        item.getProduct().getImage(), // A imagem que o front precisa
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        return OrderResponseDTO.from(order, itemsDTO);
    }

    @Transactional
    public void approveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        decrementStock(orderId);
    }
}

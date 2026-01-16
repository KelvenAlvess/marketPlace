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

        User buyer = userRepository.findById(dto.userId())
                .orElseThrow(() -> new UserNotFoundException(dto.userId()));

        List<CartItem> cartItems = cartItemRepository.findByUser(buyer);

        if (cartItems.isEmpty()) {
            throw new EmptyCartException(dto.userId());
        }

        validateStock(cartItems);

        Order order = new Order();
        order.setBuyer(buyer);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);
        log.info("Pedido criado com ID: {}", savedOrder.getOrderId());

        List<OrderItem> orderItems = createOrderItemsFromCart(savedOrder, cartItems);
        orderItemRepository.saveAll(orderItems);

        cartItemRepository.deleteAll(cartItems);
        log.info("Carrinho limpo para o usuário ID: {}", dto.userId());

        List<OrderItemResponseDTO> itemsDTO = orderItems.stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(savedOrder, itemsDTO);
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long orderId) {
        log.info("Buscando pedido ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        List<OrderItemResponseDTO> items = orderItemRepository.findByOrder(order)
                .stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(order, items);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(Long userId) {
        log.info("Buscando pedidos do usuário ID: {}", userId);

        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        List<Order> orders = orderRepository.findByBuyerOrderByOrderDateDesc(buyer);

        return orders.stream()
                .map(order -> {
                    List<OrderItemResponseDTO> items = orderItemRepository.findByOrder(order)
                            .stream()
                            .map(OrderItemResponseDTO::from)
                            .collect(Collectors.toList());
                    return OrderResponseDTO.from(order, items);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        log.info("Buscando todos os pedidos");

        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .map(order -> {
                    List<OrderItemResponseDTO> items = orderItemRepository.findByOrder(order)
                            .stream()
                            .map(OrderItemResponseDTO::from)
                            .collect(Collectors.toList());
                    return OrderResponseDTO.from(order, items);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        log.info("Buscando pedidos com status: {}", status);

        List<Order> orders = orderRepository.findByStatusOrderByOrderDateDesc(status);

        return orders.stream()
                .map(order -> {
                    List<OrderItemResponseDTO> items = orderItemRepository.findByOrder(order)
                            .stream()
                            .map(OrderItemResponseDTO::from)
                            .collect(Collectors.toList());
                    return OrderResponseDTO.from(order, items);
                })
                .collect(Collectors.toList());
    }


    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatusUpdateDTO dto) {
        log.info("Atualizando status do pedido ID: {} para {}", orderId, dto.status());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        validateStatusTransition(order.getStatus(), dto.status());

        if (dto.status() == OrderStatus.CANCELED) {
            returnStockFromOrder(order);
        }

        order.setStatus(dto.status());
        Order updatedOrder = orderRepository.save(order);

        log.info("Status do pedido ID: {} atualizado para {}", orderId, dto.status());

        List<OrderItemResponseDTO> items = orderItemRepository.findByOrder(updatedOrder)
                .stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(updatedOrder, items);
    }

    @Transactional
    public OrderResponseDTO cancelOrder(Long orderId, Long userId) {
        log.info("Cancelando pedido ID: {} pelo usuário ID: {}", orderId, userId);

        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Order order = orderRepository.findByOrderIdAndBuyer(orderId, buyer)
                .orElseThrow(() -> new OrderNotFoundException("Pedido não encontrado ou não pertence ao usuário"));

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELED) {
            throw new InvalidOrderStatusException(
                    "Não é possível cancelar um pedido com status: " + order.getStatus());
        }

        returnStockFromOrder(order);

        order.setStatus(OrderStatus.CANCELED);
        Order canceledOrder = orderRepository.save(order);

        log.info("Pedido ID: {} cancelado com sucesso", orderId);

        List<OrderItemResponseDTO> items = orderItemRepository.findByOrder(canceledOrder)
                .stream()
                .map(OrderItemResponseDTO::from)
                .collect(Collectors.toList());

        return OrderResponseDTO.from(canceledOrder, items);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        log.info("Deletando pedido ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.CANCELED) {
            throw new InvalidOrderStatusException(
                    "Apenas pedidos cancelados podem ser deletados. Status atual: " + order.getStatus());
        }

        orderItemRepository.deleteByOrder(order);
        orderRepository.delete(order);

        log.info("Pedido ID: {} deletado com sucesso", orderId);
    }


    @Transactional(readOnly = true)
    public List<OrderSummaryDTO> getUserOrdersSummary(Long userId) {
        log.info("Buscando resumo dos pedidos do usuário ID: {}", userId);

        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        List<Order> orders = orderRepository.findByBuyerOrderByOrderDateDesc(buyer);

        return orders.stream()
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrder(order);
                    BigDecimal total = items.stream()
                            .map(item -> item.getPriceAtTheTime()
                                    .multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    Integer totalItems = items.stream()
                            .map(OrderItem::getQuantity)
                            .reduce(0, Integer::sum);

                    return new OrderSummaryDTO(
                            order.getOrderId(),
                            order.getOrderDate(),
                            order.getStatus().name(),
                            totalItems,
                            total
                    );
                })
                .collect(Collectors.toList());
    }

    private void validateStock(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        product.getProductName(),
                        product.getStockQuantity(),
                        cartItem.getQuantity()
                );
            }
        }
    }


    private List<OrderItem> createOrderItemsFromCart(Order order, List<CartItem> cartItems) {
        return cartItems.stream()
                .map(cartItem -> {
                    Product product = cartItem.getProduct();

                    product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
                    productRepository.save(product);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(product);
                    orderItem.setQuantity(cartItem.getQuantity());
                    orderItem.setPriceAtTheTime(product.getProductPrice());

                    log.debug("Item criado: {} x {} - R$ {}",
                            product.getProductName(),
                            cartItem.getQuantity(),
                            product.getProductPrice());

                    return orderItem;
                })
                .collect(Collectors.toList());
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {

        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELED) {
            throw new InvalidOrderStatusException(
                    "Não é possível alterar status de um pedido " + currentStatus);
        }

        if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.DELIVERED) {
            throw new InvalidOrderStatusException(currentStatus.name(), newStatus.name());
        }

        if (currentStatus == OrderStatus.SHIPPED && newStatus == OrderStatus.PROCESSING) {
            throw new InvalidOrderStatusException(currentStatus.name(), newStatus.name());
        }
    }

    private void returnStockFromOrder(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

        for (OrderItem orderItem : orderItems) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);

            log.debug("Estoque devolvido: {} +{} unidades",
                    product.getProductName(),
                    orderItem.getQuantity());
        }

        log.info("Estoque devolvido para {} produtos do pedido ID: {}",
                orderItems.size(), order.getOrderId());
    }
}


package com.example.marketPlace.controller;

import com.example.marketPlace.dto.*;
import com.example.marketPlace.model.enums.OrderStatus;
import com.example.marketPlace.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "API de gerenciamento de pedidos")
public class OrderController {

    private final OrderService orderService;

    @Operation(
            summary = "Criar pedido a partir do carrinho",
            description = "Cria um novo pedido utilizando os itens do carrinho do usuário. " +
                    "Valida estoque, atualiza quantidades e limpa o carrinho após a criação."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pedido criado com sucesso",
                    content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Carrinho vazio ou estoque insuficiente",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(
            @Valid @RequestBody OrderCreateDTO orderCreateDTO) {
        log.info("POST /api/orders - Criando pedido para usuário ID: {}", orderCreateDTO.userId());

        OrderResponseDTO order = orderService.createOrderFromCart(orderCreateDTO);

        log.info("Pedido criado com sucesso. ID: {}", order.orderId());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @Operation(
            summary = "Buscar pedido por ID",
            description = "Retorna os detalhes completos de um pedido específico, incluindo todos os itens."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido encontrado",
                    content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado",
                    content = @Content)
    })
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @Parameter(description = "ID do pedido", required = true)
            @PathVariable Long orderId) {
        log.info("GET /api/orders/{} - Buscando pedido", orderId);

        OrderResponseDTO order = orderService.getOrderById(orderId);

        return ResponseEntity.ok(order);
    }

    @Operation(
            summary = "Listar pedidos do usuário",
            description = "Retorna todos os pedidos de um usuário específico, ordenados por data (mais recentes primeiro)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pedidos retornada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content)
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(
            @Parameter(description = "ID do usuário", required = true)
            @PathVariable Long userId) {
        log.info("GET /api/orders/user/{} - Buscando pedidos do usuário", userId);

        List<OrderResponseDTO> orders = orderService.getUserOrders(userId);

        log.info("Encontrados {} pedidos para o usuário ID: {}", orders.size(), userId);
        return ResponseEntity.ok(orders);
    }


    @Operation(
            summary = "Listar todos os pedidos",
            description = "Retorna todos os pedidos do sistema. Endpoint para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de todos os pedidos")
    })
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        log.info("GET /api/orders - Buscando todos os pedidos");

        List<OrderResponseDTO> orders = orderService.getAllOrders();

        log.info("Total de {} pedidos encontrados", orders.size());
        return ResponseEntity.ok(orders);
    }

    @Operation(
            summary = "Listar pedidos por status",
            description = "Retorna pedidos filtrados por status específico."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedidos filtrados por status")
    })
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStatus(
            @Parameter(
                    description = "Status do pedido (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELED)",
                    required = true
            )
            @PathVariable OrderStatus status) {
        log.info("GET /api/orders/status/{} - Buscando pedidos com status", status);

        List<OrderResponseDTO> orders = orderService.getOrdersByStatus(status);

        log.info("Encontrados {} pedidos com status {}", orders.size(), status);
        return ResponseEntity.ok(orders);
    }

    @Operation(
            summary = "Atualizar status do pedido",
            description = "Atualiza o status de um pedido. Valida transições permitidas e devolve estoque se cancelado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status atualizado com sucesso",
                    content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Transição de status inválida",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado",
                    content = @Content)
    })
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @Parameter(description = "ID do pedido", required = true)
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateDTO statusUpdateDTO) {
        log.info("PATCH /api/orders/{}/status - Atualizando status para {}",
                orderId, statusUpdateDTO.status());

        OrderResponseDTO order = orderService.updateOrderStatus(orderId, statusUpdateDTO);

        log.info("Status do pedido ID: {} atualizado para {}", orderId, statusUpdateDTO.status());
        return ResponseEntity.ok(order);
    }

    @Operation(
            summary = "Cancelar pedido",
            description = "Cancela um pedido específico do usuário. Devolve o estoque dos produtos."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido cancelado com sucesso",
                    content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Pedido não pode ser cancelado (já entregue ou cancelado)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado ou não pertence ao usuário",
                    content = @Content)
    })
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDTO> cancelOrder(
            @Parameter(description = "ID do pedido", required = true)
            @PathVariable Long orderId,
            @Parameter(description = "ID do usuário", required = true)
            @RequestParam Long userId) {
        log.info("POST /api/orders/{}/cancel - Cancelando pedido pelo usuário ID: {}",
                orderId, userId);

        OrderResponseDTO order = orderService.cancelOrder(orderId, userId);

        log.info("Pedido ID: {} cancelado com sucesso", orderId);
        return ResponseEntity.ok(order);
    }

    @Operation(
            summary = "Deletar pedido",
            description = "Remove um pedido do sistema. Apenas pedidos cancelados podem ser deletados."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Pedido deletado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Apenas pedidos cancelados podem ser deletados",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado",
                    content = @Content)
    })
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(
            @Parameter(description = "ID do pedido", required = true)
            @PathVariable Long orderId) {
        log.info("DELETE /api/orders/{} - Deletando pedido", orderId);

        orderService.deleteOrder(orderId);

        log.info("Pedido ID: {} deletado com sucesso", orderId);
        return ResponseEntity.noContent().build();
    }
}


package com.example.marketPlace.model;

import com.example.marketPlace.model.enums.PaymentMethod;
import com.example.marketPlace.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(unique = true) // Garante unicidade no nível do banco
    private String transactionId;

    @Column(unique = true, updatable = false) // Segurança contra dupla cobrança
    private String idempotencyKey;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    // Removido Invoice para simplificar este exemplo,
    // ou mantenha se sua lógica de negócio exigir
    @OneToOne
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;
}
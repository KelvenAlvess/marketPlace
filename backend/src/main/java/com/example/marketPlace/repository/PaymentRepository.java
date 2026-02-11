package com.example.marketPlace.repository;

import com.example.marketPlace.model.Payment;
import com.example.marketPlace.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderOrderId(Long orderId);
    Optional<Payment> findByTransactionId(String transactionId);
    boolean existsByIdempotencyKey(String idempotencyKey); // Novo
    List<Payment> findByStatusAndPaymentDateBefore(PaymentStatus status, LocalDateTime date);
}
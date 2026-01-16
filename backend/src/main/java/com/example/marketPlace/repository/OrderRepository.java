package com.example.marketPlace.repository;

import com.example.marketPlace.model.Order;
import com.example.marketPlace.model.User;
import com.example.marketPlace.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerOrderByOrderDateDesc(User buyer);

    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    List<Order> findByBuyerAndStatusOrderByOrderDateDesc(User buyer, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate ORDER BY o.orderDate DESC")
    List<Order> findOrdersBetweenDates(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
    @Query("SELECT o FROM Order o WHERE o.buyer = :buyer AND o.orderDate BETWEEN :startDate AND :endDate ORDER BY o.orderDate DESC")
    List<Order> findUserOrdersBetweenDates(@Param("buyer") User buyer,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    Long countByStatus(OrderStatus status);

    Long countByBuyer(User buyer);

    boolean existsByOrderIdAndBuyer(Long orderId, User buyer);

    Optional<Order> findByOrderIdAndBuyer(Long orderId, User buyer);
}


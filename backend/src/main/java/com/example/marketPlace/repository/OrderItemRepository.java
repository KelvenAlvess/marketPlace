package com.example.marketPlace.repository;

import com.example.marketPlace.model.Order;
import com.example.marketPlace.model.OrderItem;
import com.example.marketPlace.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {


    List<OrderItem> findByOrder(Order order);

    List<OrderItem> findByOrderOrderByOrderItemId(Order order);

    List<OrderItem> findByProduct(Product product);

    @Query("SELECT SUM(oi.priceAtTheTime * oi.quantity) FROM OrderItem oi WHERE oi.order = :order")
    BigDecimal calculateOrderTotal(@Param("order") Order order);

    Long countByOrder(Order order);

    void deleteByOrder(Order order);

    @Query("SELECT oi.product.productId, SUM(oi.quantity) as total FROM OrderItem oi " +
           "GROUP BY oi.product.productId ORDER BY total DESC")
    List<Object[]> findTopSellingProducts();
}


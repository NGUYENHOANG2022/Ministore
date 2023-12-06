package com.team3.ministore.repository;

import com.team3.ministore.dto.SellingProduct;
import com.team3.ministore.model.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    @Query("SELECT o FROM OrderItem o WHERE o.order.orderId = :orderId")
    List<OrderItem> getOrderItemsByOrderId(@Param("orderId") Integer id);

    @Query("SELECT new com.team3.ministore.dto.SellingProduct(p.name, SUM(oi.quantity), p.price) " +
            "FROM OrderItem oi " +
            "JOIN oi.product p " +
            "JOIN oi.order o " +
            "WHERE o.paymentStatus = 1 " +
            "AND MONTH(o.orderDate) = MONTH(CURRENT_DATE) " +
            "AND YEAR (o.orderDate) = YEAR(CURRENT_DATE) " +
            "GROUP BY p.productId, p.name, p.price " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<SellingProduct> getTopSellingProduct();
}

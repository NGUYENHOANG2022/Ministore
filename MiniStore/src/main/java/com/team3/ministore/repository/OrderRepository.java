package com.team3.ministore.repository;

import com.team3.ministore.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    @Query("SELECT o FROM Order o " +
            "WHERE (:from is null OR o.orderDate >= :from) " +
            "AND (:to is null OR o.orderDate <= :to) " +
            "AND (:grandTotal is null OR o.grandTotal >= :grandTotal ) " +
            "AND (:grandTotal2 is null OR o.grandTotal <= :grandTotal2 ) " +
            "ORDER BY o.orderDate DESC")
    Page<Order> findAllByFilters(LocalDateTime from, LocalDateTime to, Float grandTotal, Float grandTotal2, Pageable pageable);
}

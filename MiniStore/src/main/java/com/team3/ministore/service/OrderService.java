package com.team3.ministore.service;

import com.team3.ministore.dto.OrderDto;
import com.team3.ministore.model.Order;
import com.team3.ministore.utils.PaymentStatus;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    Page<Order> getAllOrders(
            Optional<String> ago,
            Optional<String> fromDate,
            Optional<String> toDate,
            Optional<Float> fromAmount,
            Optional<Float> toAmount,
            int page,
            int pageSize
    );

    Order createOrders(OrderDto dto) throws Exception;

    Optional<Order> getOrdersById(Integer id);

    Optional<Order> updateOrderStatus(Integer id, PaymentStatus status);

    void deleteOrders(Integer id);

    List<Order> getListOrders();
}

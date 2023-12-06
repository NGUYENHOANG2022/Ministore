package com.team3.ministore.service.impl;

import com.team3.ministore.dto.SellingProduct;
import com.team3.ministore.model.OrderItem;
import com.team3.ministore.repository.OrderItemRepository;
import com.team3.ministore.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemServiceImpl implements OrderItemService {
    
    @Autowired
    private OrderItemRepository orderItemRepository;

    @Override
    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    @Override
    public OrderItem createOrderItems(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    @Override
    public OrderItem getOrderItemsById(Integer id) {
        return orderItemRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid Order ID: " + id));
    }

    @Override
    public OrderItem updateOrderItems(Integer id, OrderItem orderItem) {
        OrderItem existingOrderItem = getOrderItemsById(id);

        existingOrderItem.setOrder(orderItem.getOrder());
        existingOrderItem.setProduct(orderItem.getProduct());
        existingOrderItem.setQuantity(orderItem.getQuantity());

        return orderItemRepository.save(existingOrderItem);
    }

    @Override
    public void deleteOrderItems(Integer id) {
        orderItemRepository.deleteById(id);
    }

    @Override
    public List<OrderItem> getOrderItemsByOrderId(Integer id) {
        return orderItemRepository.getOrderItemsByOrderId(id);
    }

    @Override
    public List<SellingProduct> getTopSellingProduct() {
        List<SellingProduct> topSellingProduct = orderItemRepository.getTopSellingProduct();
        return topSellingProduct.subList(0, Math.min(5, topSellingProduct.size()));
    }
}

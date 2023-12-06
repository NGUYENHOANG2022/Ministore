package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.model.OrderItem;
import com.team3.ministore.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order-items")
public class OrderItemsController {
    
    @Autowired
    private OrderItemService orderItemService;

    @PostMapping("/add")
    public ResponseEntity<OrderItem> createOrderItems(@RequestBody OrderItem orderItem) {
        OrderItem createdOrderItem = orderItemService.createOrderItems(orderItem);
        return new ResponseEntity<>(createdOrderItem, HttpStatus.CREATED);
    }

    @GetMapping("/list")
    public ResponseEntity<List<OrderItem>> getAllOrderItems() {
        List<OrderItem> orderItemList = orderItemService.getAllOrderItems();
        return new ResponseEntity<>(orderItemList, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<OrderItem>> getOrderItemsByOrderId(@PathVariable("id") Integer id) {
        List<OrderItem> orderItemList = orderItemService.getOrderItemsByOrderId(id);
        return new ResponseEntity<>(orderItemList, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<OrderItem> updateOrderItems(@PathVariable("id") Integer id, @RequestBody OrderItem orderItem) {
        OrderItem updatedOrderItem = orderItemService.updateOrderItems(id, orderItem);
        return new ResponseEntity<>(updatedOrderItem, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteOrderItems(@PathVariable("id") Integer id) {
        orderItemService.deleteOrderItems(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/selling-product")
    public ResponseEntity<Object> getTopSellingProducts() {
        return ResponseHandler.getResponse(orderItemService.getTopSellingProduct(), HttpStatus.OK);
    }
}

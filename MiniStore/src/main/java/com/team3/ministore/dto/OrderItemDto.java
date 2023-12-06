package com.team3.ministore.dto;

import com.team3.ministore.model.Order;
import com.team3.ministore.model.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {

    private int orderItemId;

    private int orderId;

    @NotNull(message = "Product ID must not be null")
    private int productId;

    @NotNull(message = "Quantity must not be null")
    private int quantity;

    private ProductDto product;

    public OrderItemDto(OrderItem orderItem){
        this.orderItemId = orderItem.getOrderItemId();
        this.orderId = orderItem.getOrder().getOrderId();
        this.productId = orderItem.getProduct().getProductId();
        this.quantity = orderItem.getQuantity();
        this.product = new ProductDto(orderItem.getProduct());
    }
}

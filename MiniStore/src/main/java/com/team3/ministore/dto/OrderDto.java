package com.team3.ministore.dto;

import com.team3.ministore.model.Order;
import com.team3.ministore.utils.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {

    private int orderId;

    @NotNull(message = "Staff ID must not be null")
    private int staffId;

    @NotNull(message = "Order date must not be null")
    private LocalDateTime orderDate;

    @NotNull(message = "Grand total must not be null")
    private Float grandTotal;

    private PaymentStatus paymentStatus;

    @NotNull(message = "Order items must not be null")
    private List<OrderItemDto> orderItems;

    private StaffDto staff;

    public OrderDto(Order order) {
        this.orderId = order.getOrderId();
        this.staffId = order.getStaff().getStaffId();
        this.orderDate = order.getOrderDate();
        this.grandTotal = order.getGrandTotal();
        this.paymentStatus = order.getPaymentStatus();
        if (order.getOrderItems() != null)
            this.orderItems = order.getOrderItems()
                    .stream().map(OrderItemDto::new).collect(Collectors.toList());
    }

    public OrderDto(Order order, boolean withStaff) {
        this.orderId = order.getOrderId();
        this.staffId = order.getStaff().getStaffId();
        this.orderDate = order.getOrderDate();
        this.grandTotal = order.getGrandTotal();
        this.paymentStatus = order.getPaymentStatus();
        if (order.getOrderItems() != null)
            this.orderItems = order.getOrderItems()
                    .stream().map(OrderItemDto::new).collect(Collectors.toList());
        if (withStaff)
            this.staff = new StaffDto(order.getStaff());
    }
}

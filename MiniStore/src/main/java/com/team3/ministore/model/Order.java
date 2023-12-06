package com.team3.ministore.model;

import com.team3.ministore.utils.PaymentStatus;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private int orderId;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "grand_total")
    private Float grandTotal;

    @Column(name = "payment_status")
    @Enumerated(EnumType.ORDINAL)
    private PaymentStatus paymentStatus;

    @OneToMany(mappedBy = "order")
    private List<OrderItem> orderItems;

    @OneToOne
    @JoinColumn(name = "staff_id")
    private Staff staff;
}

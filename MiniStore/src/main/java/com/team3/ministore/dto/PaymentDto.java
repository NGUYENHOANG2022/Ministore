package com.team3.ministore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDto {
    @NotNull(message = "Grand total is required")
    private long grandTotal;

    @NotNull(message = "Order ID is required")
    private int orderId;
}

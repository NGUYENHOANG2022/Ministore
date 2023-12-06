package com.team3.ministore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellingProduct {
    private String productName;
    private long totalQuantity;
    private float price;
}

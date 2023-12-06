package com.team3.ministore.dto;

import com.team3.ministore.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    private int productId;

    private String barCode;

    @NotBlank(message = "Product name must not be blank")
    private String name;

    private String description;

    @NotNull(message = "Product price must not be null")
    private Float price;

    @NotNull(message = "Product inventory must not be null")
    private int inventory;

    private int categoryId;

    private CategoryDto category;

    public ProductDto(Product product) {
        this.productId = product.getProductId();
        this.barCode = product.getBarCode();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.inventory = product.getInventory();

        if (product.getCategory() != null) {
            this.categoryId = product.getCategory().getCategoryId();
            this.category = new CategoryDto(product.getCategory());
        } else {
            this.categoryId = 0;
            this.category = null;
        }
    }
}

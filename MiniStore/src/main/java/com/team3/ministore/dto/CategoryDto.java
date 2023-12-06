package com.team3.ministore.dto;

import com.team3.ministore.model.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {

    private int categoryId;

    @NotBlank(message = "Category name must not be blank")
    private String name;

    private String description;

    private int numberOfProducts = 0;

    public CategoryDto(Category category) {
        this.categoryId = category.getCategoryId();
        this.name = category.getName();
        this.description = category.getDescription();
        if (category.getProducts() != null)
            this.numberOfProducts = category.getProducts().size();
    }
}

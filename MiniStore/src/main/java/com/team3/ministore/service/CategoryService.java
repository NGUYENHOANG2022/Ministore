package com.team3.ministore.service;

import com.team3.ministore.dto.CategoryDto;
import com.team3.ministore.model.Category;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    List<Category> getMetaCategories();

    Category createCategory(CategoryDto category);

    Optional<Category> getCategoryById(Integer id);

    Optional<Category> updateCategory(Integer id, CategoryDto category);

    void deleteCategory(Integer id);

    Page<CategoryDto> getAllCategories(String search, Integer page, Integer pageSize);
}

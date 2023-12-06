package com.team3.ministore.service.impl;

import com.team3.ministore.dto.CategoryDto;
import com.team3.ministore.model.Category;
import com.team3.ministore.repository.CategoryRepository;
import com.team3.ministore.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getMetaCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category createCategory(CategoryDto dto) {
        Category category = new Category();

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        return categoryRepository.save(category);
    }

    @Override
    public Optional<Category> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }

    @Override
    public Optional<Category> updateCategory(Integer id, CategoryDto dto) {
        Optional<Category> existingCategory = getCategoryById(id);

        if (existingCategory.isEmpty()) return Optional.empty();

        existingCategory.map(category -> {
            category.setName(dto.getName());
            category.setDescription(dto.getDescription());
            return category;
        });

        return Optional.of(categoryRepository.save(existingCategory.get()));
    }

    @Override
    public void deleteCategory(Integer id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public Page<CategoryDto> getAllCategories(String search, Integer page, Integer pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return categoryRepository.findAllByNameContainingIgnoreCase(search, pageable).map(CategoryDto::new);
    }
}

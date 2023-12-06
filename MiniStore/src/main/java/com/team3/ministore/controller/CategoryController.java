package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.CategoryDto;
import com.team3.ministore.model.Category;
import com.team3.ministore.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;


    @GetMapping("/all")
    public ResponseEntity<Object> getListCategories() {
        List<CategoryDto> categories = categoryService.getMetaCategories()
                .stream().map(CategoryDto::new).collect(Collectors.toList());
        return ResponseHandler.getResponse(categories, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Object> createCategory(@Valid @RequestBody CategoryDto category, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Category createdCategory = categoryService.createCategory(category);
        return ResponseHandler.getResponse(new CategoryDto(createdCategory), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateCategory(@Valid @PathVariable("id") Integer id, @RequestBody CategoryDto category, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<Category> updatedCategory = categoryService.updateCategory(id, category);
        return updatedCategory.map(value -> ResponseHandler.getResponse(new CategoryDto(value), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Category not found"), HttpStatus.NOT_FOUND));

    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteCategory(@PathVariable("id") Integer id) {
        categoryService.deleteCategory(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }

    @GetMapping()
    public ResponseEntity<Object> getCategories(@RequestParam("search") Optional<String> search,
                                                @RequestParam("curPage") Integer curPage,
                                                @RequestParam("perPage") Integer perPage) {
        return ResponseHandler.getResponse(categoryService.getAllCategories(
                search.orElseGet(() -> null),
                curPage,
                perPage
        ), HttpStatus.OK);
    }
}

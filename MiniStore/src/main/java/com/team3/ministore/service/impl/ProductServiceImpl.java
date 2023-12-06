package com.team3.ministore.service.impl;

import com.team3.ministore.dto.ProductDto;
import com.team3.ministore.model.Category;
import com.team3.ministore.model.Product;
import com.team3.ministore.repository.CategoryRepository;
import com.team3.ministore.repository.ProductRepository;
import com.team3.ministore.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Page<ProductDto> getAllProducts(String search, Integer page, Integer pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return productRepository
                .findAllByNameContainingIgnoreCaseOrBarCodeContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(search, search, search, pageable)
                .map(ProductDto::new);
    }

    @Override
    public Page<ProductDto> getAllProducts(Integer page, Integer pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return productRepository.findAll(pageable).map(ProductDto::new);
    }

    @Override
    public Optional<Product> createProduct(ProductDto dto) {
        Optional<Category> category = categoryRepository.findById(dto.getCategoryId());
        if (dto.getCategoryId() != 0 && category.isEmpty()) return Optional.empty();

        Product product = new Product();

        product.setBarCode(dto.getBarCode());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        category.ifPresent(product::setCategory);
        product.setPrice(dto.getPrice());
        product.setInventory(dto.getInventory());

        return Optional.of(productRepository.save(product));
    }

    @Override
    public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id);
    }

    @Override
    public Optional<Product> getProductByBarcode(String barcode) {
        return productRepository.findFirstByBarCode(barcode);
    }

    @Override
    public Optional<Product> updateProduct(Integer id, ProductDto dto) {
        Optional<Category> category = categoryRepository.findById(dto.getCategoryId());
        if (dto.getCategoryId() != 0 && category.isEmpty()) return Optional.empty();

        Optional<Product> existingProduct = getProductById(id);
        if (existingProduct.isEmpty()) return Optional.empty();

        existingProduct.map(value -> {
            value.setBarCode(dto.getBarCode());
            value.setName(dto.getName());
            value.setDescription(dto.getDescription());
            value.setCategory(category.orElseGet(() -> null));
            value.setPrice(dto.getPrice());
            value.setInventory(dto.getInventory());
            return value;
        });

        return Optional.of(productRepository.save(existingProduct.get()));
    }

    @Override
    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    @Override
    public List<Product> getListProducts() {
        return productRepository.findAll();
    }
}

package com.team3.ministore.service;

import com.team3.ministore.dto.ProductDto;
import com.team3.ministore.dto.SellingProduct;
import com.team3.ministore.model.Product;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    Page<ProductDto> getAllProducts(String search, Integer page, Integer pageSize);

    Page<ProductDto> getAllProducts(Integer page, Integer pageSize);

    Optional<Product> createProduct(ProductDto dto);

    Optional<Product> getProductById(Integer id);

    Optional<Product> getProductByBarcode(String barcode);

    Optional<Product> updateProduct(Integer id, ProductDto product);

    void deleteProduct(Integer id);

    List<Product> getListProducts();

}

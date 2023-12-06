package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.ProductDto;
import com.team3.ministore.model.Product;
import com.team3.ministore.service.ProductService;
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
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/all")
    public ResponseEntity<Object> getListProducts() {
        List<Product> productsList = productService.getListProducts();

        if (productsList != null) {
            List<ProductDto> productDto = productsList.stream()
                    .map(ProductDto::new)
                    .collect(Collectors.toList());

            return ResponseHandler.getResponse(productDto, HttpStatus.OK);
        }
        else {
            return ResponseHandler.getResponse(new Exception("No orders found."), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Object> createProduct(@Valid @RequestBody ProductDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        // Check if barcode is already existed
        if (dto.getBarCode() != null && !dto.getBarCode().isEmpty()) {
            Optional<Product> sameBarcode = productService.getProductByBarcode(dto.getBarCode());
            if (sameBarcode.isPresent())
                return ResponseHandler.getResponse(new Exception("Barcode is already existed."), HttpStatus.BAD_REQUEST);
        }

        Optional<Product> createdProduct = productService.createProduct(dto);
        return createdProduct.map(value -> ResponseHandler.getResponse(new ProductDto(value), HttpStatus.CREATED))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Category not found."), HttpStatus.NOT_FOUND));

    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateProduct(@Valid @PathVariable("id") Integer id, @RequestBody ProductDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        // Check if barcode is already existed
        if (dto.getBarCode() != null && !dto.getBarCode().isEmpty()) {
            Optional<Product> sameBarcode = productService.getProductByBarcode(dto.getBarCode());
            if (sameBarcode.isPresent() && sameBarcode.get().getProductId() != id)
                return ResponseHandler.getResponse(new Exception("Barcode is already existed."), HttpStatus.BAD_REQUEST);
        }

        Optional<Product> updatedProduct = productService.updateProduct(id, dto);

        return updatedProduct.map(value -> ResponseHandler.getResponse(new ProductDto(value), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Product or category not found."), HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteProduct(@PathVariable("id") Integer id) {
        productService.deleteProduct(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getProductById(@PathVariable("id") Integer id) {
        Optional<Product> product = productService.getProductById(id);

        return product.map(value -> ResponseHandler.getResponse(new ProductDto(value), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Product not found"), HttpStatus.NOT_FOUND));
    }

    @GetMapping()
    public ResponseEntity<Object> getProducts(@RequestParam("search") Optional<String> search,
                                              @RequestParam("curPage") Integer curPage,
                                              @RequestParam("perPage") Integer perPage) {
        return search.map(s -> ResponseHandler.getResponse(productService.getAllProducts(s, curPage, perPage), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(productService.getAllProducts(curPage, perPage), HttpStatus.OK));
    }
}
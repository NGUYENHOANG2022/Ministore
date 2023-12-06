package com.team3.ministore.repository;

import com.team3.ministore.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    Page<Product> findAll(Pageable pageable);

    Page<Product> findAllByNameContainingIgnoreCaseOrBarCodeContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(String name, String barcode, String categoryName, Pageable pageable);

    Optional<Product> findFirstByBarCode(String barCode);
}

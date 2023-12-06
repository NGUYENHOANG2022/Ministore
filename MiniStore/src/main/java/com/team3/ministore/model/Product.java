package com.team3.ministore.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Data
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private int productId;

    @Column(name = "barcode", length = 20)
    private String barCode;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "description", length = 400)
    private String description;

    @Column(name = "price")
    private Float price;

    @Column(name = "inventory")
    private int inventory;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}

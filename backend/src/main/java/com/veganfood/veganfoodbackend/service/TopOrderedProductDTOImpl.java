package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.dto.TopOrderedProductDTO;

public class TopOrderedProductDTOImpl implements TopOrderedProductDTO {
    private final Integer productId;
    private final String name;
    private final String imageUrl;
    private final String category;
    private final String description;
    private final Double price;
    private final Long totalOrdered;

    public TopOrderedProductDTOImpl(
            Integer productId,
            String name,
            String imageUrl,
            String category,
            String description,
            Double price,
            Long totalOrdered
    ) {
        this.productId = productId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.category = category;
        this.description = description;
        this.price = price;
        this.totalOrdered = totalOrdered;
    }

    @Override public Integer getProductId() { return productId; }
    @Override public String getName() { return name; }
    @Override public String getImageUrl() { return imageUrl; }
    @Override public String getCategory() { return category; }
    @Override public String getDescription() { return description; }
    @Override public Double getPrice() { return price; }
    @Override public Long getTotalOrdered() { return totalOrdered; }
}

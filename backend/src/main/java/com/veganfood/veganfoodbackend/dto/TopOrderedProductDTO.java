package com.veganfood.veganfoodbackend.dto;

public interface TopOrderedProductDTO {
    Integer getProductId();
    String getName();
    String getImageUrl();
    String getCategory();
    String getDescription();   // mới thêm
    Double getPrice();         // mới thêm
    Long getTotalOrdered();    // từ SUM(...)
}

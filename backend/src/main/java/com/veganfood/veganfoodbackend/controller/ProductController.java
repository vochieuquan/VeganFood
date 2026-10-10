package com.veganfood.veganfoodbackend.controller;

import com.veganfood.veganfoodbackend.dto.ProductDTO;
import com.veganfood.veganfoodbackend.model.Product;
import com.veganfood.veganfoodbackend.service.ProductService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ✅ Lấy danh sách tất cả sản phẩm
    @GetMapping
    public List<ProductDTO> getAllProducts() {
        return productService.getAllProducts();
    }

    // ✅ Lấy sản phẩm theo category
    @GetMapping("/category/{category}")
    public List<ProductDTO> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }

    // ✅ Lấy 1 sản phẩm theo ID
    @GetMapping("/{id:\\d+}") // chỉ nhận số (ID)
    public ProductDTO getProductById(@PathVariable Integer id) {
        return productService.getProductById(id);
    }

    // ✅ Thêm mới sản phẩm
    @PostMapping
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    // ✅ Cập nhật sản phẩm theo ID
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public Product updateProduct(@PathVariable Integer id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    // ✅ Xóa sản phẩm theo ID
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('owner', 'manager')")
    public void deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
    }
}

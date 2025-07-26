package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Product {
    private int id;
    private String title;
    private String author;
    private String isbn;
    private int categoryId;
    private String categoryName; // For display purposes
    private String description;
    private BigDecimal price;
    private BigDecimal offerPrice;
    private int stockQuantity;
    private String imagePath;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    
    // Constructors
    public Product() {}
    
    public Product(String title, String author, String isbn, int categoryId, 
                   String description, BigDecimal price, int stockQuantity) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.categoryId = categoryId;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.status = STATUS_ACTIVE;
    }
    
    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public BigDecimal getOfferPrice() { return offerPrice; }
    public void setOfferPrice(BigDecimal offerPrice) { this.offerPrice = offerPrice; }
    
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    
    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return STATUS_ACTIVE.equals(this.status); }
    public boolean hasOffer() { return offerPrice != null && offerPrice.compareTo(BigDecimal.ZERO) > 0; }
    public BigDecimal getEffectivePrice() { return hasOffer() ? offerPrice : price; }
}

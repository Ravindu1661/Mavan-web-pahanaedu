package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

public class PromoCode {
    private int id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private int usedCount;
    private Date startDate;
    private Date endDate;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Constants
    public static final String DISCOUNT_PERCENTAGE = "percentage";
    public static final String DISCOUNT_FIXED = "fixed";
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    
    // Constructors
    public PromoCode() {}
    
    public PromoCode(String code, String description, String discountType, 
                     BigDecimal discountValue, Date startDate, Date endDate) {
        this.code = code;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.usedCount = 0;
        this.status = STATUS_ACTIVE;
    }
    
    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
    
    public int getUsedCount() { return usedCount; }
    public void setUsedCount(int usedCount) { this.usedCount = usedCount; }
    
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    
    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return STATUS_ACTIVE.equals(this.status); }
    public boolean isPercentage() { return DISCOUNT_PERCENTAGE.equals(this.discountType); }
    public boolean isFixed() { return DISCOUNT_FIXED.equals(this.discountType); }
}

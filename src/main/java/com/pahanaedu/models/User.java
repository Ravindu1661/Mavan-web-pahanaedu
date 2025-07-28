package com.pahanaedu.models;

import java.sql.Timestamp;

/**
 * User model class for Pahana Edu system
 * Supports ADMIN, CUSTOMER, and STAFF roles
 */
public class User {
    // User properties
    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Role constants - Admin, Customer, and Staff
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_CUSTOMER = "CUSTOMER";
    public static final String ROLE_STAFF = "STAFF";
    
    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    
    // Default constructor
    public User() {
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }
    
    // Constructor for customer registration
    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }
    
    // Constructor with phone
    public User(String firstName, String lastName, String email, String password, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }
    
    // Constructor with role (for admin/staff creation)
    public User(String firstName, String lastName, String email, String password, String phone, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.status = STATUS_ACTIVE;
    }
    
    // Full constructor
    public User(int id, String firstName, String lastName, String email, String password, 
                String phone, String role, String status) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.status = status;
    }
    
    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
    
    // Role checking methods
    public boolean isAdmin() {
        return ROLE_ADMIN.equals(this.role);
    }
    
    public boolean isCustomer() {
        return ROLE_CUSTOMER.equals(this.role);
    }
    
    public boolean isStaff() {
        return ROLE_STAFF.equals(this.role);
    }
    
    // Status checking methods
    public boolean isActive() {
        return STATUS_ACTIVE.equals(this.status);
    }
    
    public boolean isInactive() {
        return STATUS_INACTIVE.equals(this.status);
    }
    
    // Utility methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean hasValidPhone() {
        return phone != null && !phone.trim().isEmpty() && phone.length() >= 10;
    }
    
    public boolean canLogin() {
        return isActive();
    }
    
    public String getDisplayName() {
        return getFullName() + " (" + role + ")";
    }
    
    public boolean hasValidEmail() {
        return email != null && email.contains("@") && email.contains(".");
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", role='" + role + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        User user = (User) obj;
        return id == user.id && 
               (email != null ? email.equals(user.email) : user.email == null);
    }
    
    @Override
    public int hashCode() {
        int result = id;
        result = 31 * result + (email != null ? email.hashCode() : 0);
        return result;
    }
}
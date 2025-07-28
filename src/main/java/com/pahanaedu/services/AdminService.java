// AdminService.java - වැඩිදියුණු කළ JSON serialization සහ image upload support සහිත
package com.pahanaedu.services;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import com.pahanaedu.dao.*;
import com.pahanaedu.models.*;

public class AdminService {
    private static AdminService instance = null;
    
    private UserDAO userDAO; 
    private CategoryDAO categoryDAO;
    private ProductDAO productDAO;
    private PromoCodeDAO promoCodeDAO;
    private OrderDAO orderDAO;
    
    private AdminService() {
        userDAO = UserDAO.getInstance();
        categoryDAO = CategoryDAO.getInstance();
        productDAO = ProductDAO.getInstance();
        promoCodeDAO = PromoCodeDAO.getInstance();
        orderDAO = OrderDAO.getInstance();
    }
    
    public static synchronized AdminService getInstance() {
        if (instance == null) {
            instance = new AdminService();
        }
        return instance;
    }
    
    // Dashboard Statistics
    public void handleDashboardStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            List<User> allUsers = userDAO.getAllUsers();
            List<Product> allProducts = productDAO.getAllProducts();
            List<Order> allOrders = orderDAO.getAllOrders();
            List<Category> allCategories = categoryDAO.getAllCategories();
            List<PromoCode> allPromoCodes = promoCodeDAO.getAllPromoCodes();
            
            // Calculate statistics
            int totalUsers = allUsers.size();
            long totalCustomers = allUsers.stream()
                .filter(user -> User.ROLE_CUSTOMER.equals(user.getRole()))
                .count();
            long totalStaff = allUsers.stream()
                .filter(user -> "STAFF".equals(user.getRole()))
                .count();
            long totalAdmins = allUsers.stream()
                .filter(user -> User.ROLE_ADMIN.equals(user.getRole()))
                .count();
            int totalProducts = allProducts.size();
            long activeProducts = allProducts.stream()
                .filter(product -> product.isActive())
                .count();
            int totalOrders = allOrders.size();
            long pendingOrders = allOrders.stream()
                .filter(order -> Order.STATUS_PENDING.equals(order.getStatus()))
                .count();
            int totalCategories = allCategories.size();
            int totalPromoCodes = allPromoCodes.size();
            
            // Calculate today's orders
            LocalDate today = LocalDate.now();
            long todayOrders = allOrders.stream()
                .filter(order -> {
                    if (order.getCreatedAt() != null) {
                        LocalDate orderDate = order.getCreatedAt().toLocalDateTime().toLocalDate();
                        return orderDate.equals(today);
                    }
                    return false;
                })
                .count();
            
            // Calculate monthly revenue
            LocalDate startOfMonth = today.withDayOfMonth(1);
            BigDecimal monthlyRevenue = allOrders.stream()
                .filter(order -> {
                    if (order.getCreatedAt() != null && 
                        (Order.STATUS_DELIVERED.equals(order.getStatus()) || 
                         Order.STATUS_SHIPPED.equals(order.getStatus()))) {
                        LocalDate orderDate = order.getCreatedAt().toLocalDateTime().toLocalDate();
                        return !orderDate.isBefore(startOfMonth);
                    }
                    return false;
                })
                .map(order -> order.getFinalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Create stats JSON - Updated to include staff count
            StringBuilder stats = new StringBuilder();
            stats.append("{");
            stats.append("\"totalUsers\": ").append(totalUsers).append(",");
            stats.append("\"totalCustomers\": ").append(totalCustomers).append(",");
            stats.append("\"totalStaff\": ").append(totalStaff).append(",");
            stats.append("\"totalAdmins\": ").append(totalAdmins).append(",");
            stats.append("\"totalProducts\": ").append(totalProducts).append(",");
            stats.append("\"activeProducts\": ").append(activeProducts).append(",");
            stats.append("\"totalOrders\": ").append(totalOrders).append(",");
            stats.append("\"pendingOrders\": ").append(pendingOrders).append(",");
            stats.append("\"todayOrders\": ").append(todayOrders).append(",");
            stats.append("\"totalCategories\": ").append(totalCategories).append(",");
            stats.append("\"totalPromoCodes\": ").append(totalPromoCodes).append(",");
            stats.append("\"monthlyRevenue\": ").append(monthlyRevenue);
            stats.append("}");
            
            sendJsonResponse(response, stats.toString());
            
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error loading dashboard statistics");
        }
    }
    
    // User Management
    public void handleUserManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListUsers(request, response);
                    break;
                case "create":
                    handleCreateUser(request, response);
                    break;
                case "update":
                    handleUpdateUser(request, response);
                    break;
                case "delete":
                    handleDeleteUser(request, response);
                    break;
                case "toggle-status":
                    handleToggleUserStatus(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("Error in user management: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "User management error");
        }
    }
    
    private void handleListUsers(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<User> users = userDAO.getAllUsers();
        sendJsonResponse(response, serializeUsers(users));
    }
    
    private String serializeUsers(List<User> users) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        
        for (int i = 0; i < users.size(); i++) {
            if (i > 0) json.append(",");
            User user = users.get(i);
            json.append("{");
            json.append("\"id\": ").append(user.getId()).append(",");
            json.append("\"firstName\": \"").append(escapeJsonString(user.getFirstName())).append("\",");
            json.append("\"lastName\": \"").append(escapeJsonString(user.getLastName())).append("\",");
            json.append("\"email\": \"").append(escapeJsonString(user.getEmail())).append("\",");
            json.append("\"phone\": \"").append(escapeJsonString(user.getPhone())).append("\",");
            json.append("\"role\": \"").append(escapeJsonString(user.getRole())).append("\",");
            json.append("\"status\": \"").append(escapeJsonString(user.getStatus())).append("\",");
            json.append("\"createdAt\": \"").append(user.getCreatedAt()).append("\"");
            json.append("}");
        }
        
        json.append("]");
        return json.toString();
    }
    
    // Category Management
    public void handleCategoryManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListCategories(request, response);
                    break;
                case "create":
                    handleCreateCategory(request, response);
                    break;
                case "update":
                    handleUpdateCategory(request, response);
                    break;
                case "delete":
                    handleDeleteCategory(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("Error in category management: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Category management error");
        }
    }
    
    private void handleListCategories(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<Category> categories = categoryDAO.getAllCategories();
        sendJsonResponse(response, serializeCategories(categories));
    }
    
    private String serializeCategories(List<Category> categories) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        
        for (int i = 0; i < categories.size(); i++) {
            if (i > 0) json.append(",");
            Category category = categories.get(i);
            
            // Count products in this category
            List<Product> allProducts = productDAO.getAllProducts();
            long productCount = allProducts.stream()
                .filter(product -> product.getCategoryId() == category.getId())
                .count();
            
            json.append("{");
            json.append("\"id\": ").append(category.getId()).append(",");
            json.append("\"name\": \"").append(escapeJsonString(category.getName())).append("\",");
            json.append("\"description\": \"").append(escapeJsonString(category.getDescription())).append("\",");
            json.append("\"status\": \"").append(escapeJsonString(category.getStatus())).append("\",");
            json.append("\"productCount\": ").append(productCount).append(",");
            json.append("\"createdAt\": \"").append(category.getCreatedAt()).append("\"");
            json.append("}");
        }
        
        json.append("]");
        return json.toString();
    }
    
    // Product Management - සම්පූර්ණයෙන්ම අලුතින් ලියන ලද image upload support සහිත
    public void handleProductManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListProducts(request, response);
                    break;
                case "search":
                    handleSearchProducts(request, response);
                    break;
                case "create":
                    handleCreateProduct(request, response);
                    break;
                case "update":
                    handleUpdateProduct(request, response);
                    break;
                case "delete":
                    handleDeleteProduct(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("Error in product management: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Product management error");
        }
    }
    
    private void handleListProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<Product> products = productDAO.getAllProducts();
        sendJsonResponse(response, serializeProducts(products));
    }
    
    private String serializeProducts(List<Product> products) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        
        for (int i = 0; i < products.size(); i++) {
            if (i > 0) json.append(",");
            Product product = products.get(i);
            json.append("{");
            json.append("\"id\": ").append(product.getId()).append(",");
            json.append("\"title\": \"").append(escapeJsonString(product.getTitle())).append("\",");
            json.append("\"author\": \"").append(escapeJsonString(product.getAuthor())).append("\",");
            json.append("\"isbn\": \"").append(escapeJsonString(product.getIsbn())).append("\",");
            json.append("\"categoryId\": ").append(product.getCategoryId()).append(",");
            json.append("\"categoryName\": \"").append(escapeJsonString(product.getCategoryName())).append("\",");
            json.append("\"description\": \"").append(escapeJsonString(product.getDescription())).append("\",");
            json.append("\"price\": ").append(product.getPrice()).append(",");
            json.append("\"offerPrice\": ").append(product.getOfferPrice() != null ? product.getOfferPrice() : "null").append(",");
            json.append("\"stockQuantity\": ").append(product.getStockQuantity()).append(",");
            json.append("\"imagePath\": \"").append(escapeJsonString(product.getImagePath())).append("\",");
            json.append("\"status\": \"").append(escapeJsonString(product.getStatus())).append("\",");
            json.append("\"createdAt\": \"").append(product.getCreatedAt()).append("\"");
            json.append("}");
        }
        
        json.append("]");
        return json.toString();
    }
    
    // නව Product Create - Image Upload Support සමඟ
    private void handleCreateProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            // Extract form data
            String title = getParameterValue(request, "title");
            String author = getParameterValue(request, "author");
            String isbn = getParameterValue(request, "isbn");
            int categoryId = Integer.parseInt(getParameterValue(request, "categoryId"));
            String description = getParameterValue(request, "description");
            BigDecimal price = new BigDecimal(getParameterValue(request, "price"));
            String offerPriceStr = getParameterValue(request, "offerPrice");
            BigDecimal offerPrice = (offerPriceStr != null && !offerPriceStr.trim().isEmpty()) 
                ? new BigDecimal(offerPriceStr) : null;
            int stockQuantity = Integer.parseInt(getParameterValue(request, "stockQuantity"));
            String status = getParameterValue(request, "status");
            if (status == null || status.trim().isEmpty()) {
                status = "active"; // Default status for new products
            }
            
            // Handle image upload
            String imagePath = null;
            String uploadedImagePath = (String) request.getAttribute("uploadedImagePath");
            if (uploadedImagePath != null && !uploadedImagePath.trim().isEmpty()) {
                imagePath = uploadedImagePath;
                System.out.println("AdminService: Using uploaded image path - " + imagePath);
            }
            
            // Create product object
            Product product = new Product(title, author, isbn, categoryId, description, price, stockQuantity);
            product.setOfferPrice(offerPrice);
            product.setImagePath(imagePath);
            product.setStatus(status);
            
            // Save to database
            boolean success = productDAO.createProduct(product);
            
            if (success) {
                System.out.println("AdminService: Product created successfully with image: " + imagePath);
                sendBooleanResponse(response, true, "Product created successfully");
            } else {
                System.err.println("AdminService: Failed to create product in database");
                sendBooleanResponse(response, false, "Failed to create product");
            }
            
        } catch (NumberFormatException e) {
            System.err.println("AdminService: Invalid number format in product data - " + e.getMessage());
            sendErrorResponse(response, "Invalid number format in product data");
        } catch (Exception e) {
            System.err.println("AdminService: Error creating product - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error creating product: " + e.getMessage());
        }
    }
    
    // නව Product Update - Image Upload Support සමඟ
    private void handleUpdateProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(getParameterValue(request, "id"));
            Product existingProduct = productDAO.getProductById(id);
            
            if (existingProduct == null) {
                sendErrorResponse(response, "Product not found");
                return;
            }
            
            // Store old image path for potential deletion
            String oldImagePath = existingProduct.getImagePath();
            
            // Extract form data
            String title = getParameterValue(request, "title");
            String author = getParameterValue(request, "author");
            String isbn = getParameterValue(request, "isbn");
            int categoryId = Integer.parseInt(getParameterValue(request, "categoryId"));
            String description = getParameterValue(request, "description");
            BigDecimal price = new BigDecimal(getParameterValue(request, "price"));
            String offerPriceStr = getParameterValue(request, "offerPrice");
            BigDecimal offerPrice = (offerPriceStr != null && !offerPriceStr.trim().isEmpty()) 
                ? new BigDecimal(offerPriceStr) : null;
            int stockQuantity = Integer.parseInt(getParameterValue(request, "stockQuantity"));
            String status = getParameterValue(request, "status");
            
            // Handle image update
            String imagePath = oldImagePath; // Keep existing image by default
            String uploadedImagePath = (String) request.getAttribute("uploadedImagePath");
            
            if (uploadedImagePath != null && !uploadedImagePath.trim().isEmpty()) {
                // New image uploaded
                imagePath = uploadedImagePath;
                System.out.println("AdminService: Using new uploaded image - " + imagePath);
                
                // Delete old image if it exists and is different from new one
                if (oldImagePath != null && !oldImagePath.equals(imagePath)) {
                    try {
                        String webAppPath = request.getServletContext().getRealPath("");
                        deleteProductImage(oldImagePath, webAppPath);
                        System.out.println("AdminService: Deleted old image - " + oldImagePath);
                    } catch (Exception e) {
                        System.err.println("AdminService: Warning - Could not delete old image: " + e.getMessage());
                    }
                }
            } else {
                // No new image uploaded, check if existing path is provided
                String existingImagePath = getParameterValue(request, "imagePath");
                if (existingImagePath != null && !existingImagePath.trim().isEmpty()) {
                    imagePath = existingImagePath;
                }
            }
            
            // Update product object
            existingProduct.setTitle(title);
            existingProduct.setAuthor(author);
            existingProduct.setIsbn(isbn);
            existingProduct.setCategoryId(categoryId);
            existingProduct.setDescription(description);
            existingProduct.setPrice(price);
            existingProduct.setOfferPrice(offerPrice);
            existingProduct.setStockQuantity(stockQuantity);
            existingProduct.setImagePath(imagePath);
            existingProduct.setStatus(status);
            
            // Update in database
            boolean success = productDAO.updateProduct(existingProduct);
            
            if (success) {
                System.out.println("AdminService: Product updated successfully with image: " + imagePath);
                sendBooleanResponse(response, true, "Product updated successfully");
            } else {
                System.err.println("AdminService: Failed to update product in database");
                sendBooleanResponse(response, false, "Failed to update product");
            }
            
        } catch (NumberFormatException e) {
            System.err.println("AdminService: Invalid number format in product data - " + e.getMessage());
            sendErrorResponse(response, "Invalid number format in product data");
        } catch (Exception e) {
            System.err.println("AdminService: Error updating product - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error updating product: " + e.getMessage());
        }
    }
    
    // නව Product Delete - Image Delete Support සමඟ
    private void handleDeleteProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(getParameterValue(request, "id"));
            Product product = productDAO.getProductById(id);
            
            if (product == null) {
                sendErrorResponse(response, "Product not found");
                return;
            }
            
            // Store image path for deletion
            String imagePath = product.getImagePath();
            
            // Delete from database first
            boolean success = productDAO.deleteProduct(id);
            
            if (success) {
                // Delete associated image file if exists
                if (imagePath != null && !imagePath.trim().isEmpty()) {
                    try {
                        String webAppPath = request.getServletContext().getRealPath("");
                        boolean imageDeleted = deleteProductImage(imagePath, webAppPath);
                        if (imageDeleted) {
                            System.out.println("AdminService: Product and image deleted successfully - " + imagePath);
                        } else {
                            System.out.println("AdminService: Product deleted but image deletion failed - " + imagePath);
                        }
                    } catch (Exception e) {
                        System.err.println("AdminService: Warning - Product deleted but could not delete image: " + e.getMessage());
                    }
                }
                
                sendBooleanResponse(response, true, "Product deleted successfully");
            } else {
                sendBooleanResponse(response, false, "Failed to delete product");
            }
            
        } catch (NumberFormatException e) {
            System.err.println("AdminService: Invalid product ID - " + e.getMessage());
            sendErrorResponse(response, "Invalid product ID");
        } catch (Exception e) {
            System.err.println("AdminService: Error deleting product - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error deleting product: " + e.getMessage());
        }
    }
    
    // Image deletion utility method
    private boolean deleteProductImage(String imagePath, String webAppPath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return true; // Nothing to delete
        }
        
        try {
            java.io.File imageFile = new java.io.File(webAppPath, imagePath);
            if (imageFile.exists()) {
                boolean deleted = imageFile.delete();
                if (deleted) {
                    System.out.println("AdminService: Image file deleted successfully - " + imagePath);
                } else {
                    System.err.println("AdminService: Failed to delete image file - " + imagePath);
                }
                return deleted;
            } else {
                System.out.println("AdminService: Image file does not exist - " + imagePath);
                return true; // File doesn't exist, consider as successfully deleted
            }
        } catch (Exception e) {
            System.err.println("AdminService: Error deleting image file - " + e.getMessage());
            return false;
        }
    }
    
    // Parameter extraction utility for multipart requests
    private String getParameterValue(HttpServletRequest request, String paramName) {
        String value = request.getParameter(paramName);
        if (value != null) {
            return value.trim();
        }
        
        // Try to get from multipart if not found in regular parameters
        try {
            Part part = request.getPart(paramName);
            if (part != null) {
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(part.getInputStream(), "UTF-8"));
                StringBuilder valueBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    valueBuilder.append(line);
                }
                reader.close();
                return valueBuilder.toString().trim();
            }
        } catch (Exception e) {
            // Ignore and continue
        }
        
        return null;
    }
    
    private void handleSearchProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String keyword = request.getParameter("keyword");
        List<Product> products = productDAO.searchProducts(keyword);
        sendJsonResponse(response, serializeProducts(products));
    }
    
    // Promo Code Management
    public void handlePromoCodeManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListPromoCodes(request, response);
                    break;
                case "create":
                    handleCreatePromoCode(request, response);
                    break;
                case "update":
                    handleUpdatePromoCode(request, response);
                    break;
                case "delete":
                    handleDeletePromoCode(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("Error in promo code management: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Promo code management error");
        }
    }
    
    private void handleListPromoCodes(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<PromoCode> promoCodes = promoCodeDAO.getAllPromoCodes();
        sendJsonResponse(response, serializePromoCodes(promoCodes));
    }
    
    private String serializePromoCodes(List<PromoCode> promoCodes) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        
        for (int i = 0; i < promoCodes.size(); i++) {
            if (i > 0) json.append(",");
            PromoCode promo = promoCodes.get(i);
            json.append("{");
            json.append("\"id\": ").append(promo.getId()).append(",");
            json.append("\"code\": \"").append(escapeJsonString(promo.getCode())).append("\",");
            json.append("\"description\": \"").append(escapeJsonString(promo.getDescription())).append("\",");
            json.append("\"discountType\": \"").append(escapeJsonString(promo.getDiscountType())).append("\",");
            json.append("\"discountValue\": ").append(promo.getDiscountValue()).append(",");
            json.append("\"usedCount\": ").append(promo.getUsedCount()).append(",");
            json.append("\"startDate\": \"").append(promo.getStartDate()).append("\",");
            json.append("\"endDate\": \"").append(promo.getEndDate()).append("\",");
            json.append("\"status\": \"").append(escapeJsonString(promo.getStatus())).append("\",");
            json.append("\"createdAt\": \"").append(promo.getCreatedAt()).append("\"");
            json.append("}");
        }
        
        json.append("]");
        return json.toString();
    }
    
    // Order Management
    public void handleOrderManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListOrders(request, response);
                    break;
                case "search":
                    handleSearchOrders(request, response);
                    break;
                case "view":
                    handleViewOrder(request, response);
                    break;
                case "update-status":
                    handleUpdateOrderStatus(request, response);
                    break;
                case "print-bill":
                    handlePrintBill(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("Error in order management: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Order management error");
        }
    }
    
    private void handleListOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<Order> orders = orderDAO.getAllOrders();
        sendJsonResponse(response, serializeOrders(orders));
    }
    
    private String serializeOrders(List<Order> orders) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        
        for (int i = 0; i < orders.size(); i++) {
            if (i > 0) json.append(",");
            Order order = orders.get(i);
            
            // Count items in order
            List<OrderItem> items = orderDAO.getOrderItems(order.getId());
            int itemCount = items.size();
            
            json.append("{");
            json.append("\"id\": ").append(order.getId()).append(",");
            json.append("\"orderNumber\": \"").append(escapeJsonString(order.getOrderNumber())).append("\",");
            json.append("\"customerName\": \"").append(escapeJsonString(order.getCustomerName())).append("\",");
            json.append("\"customerEmail\": \"").append(escapeJsonString(order.getCustomerEmail())).append("\",");
            json.append("\"customerPhone\": \"").append(escapeJsonString(order.getCustomerPhone())).append("\",");
            json.append("\"userName\": \"").append(escapeJsonString(order.getUserName())).append("\",");
            json.append("\"totalAmount\": ").append(order.getTotalAmount()).append(",");
            json.append("\"discountAmount\": ").append(order.getDiscountAmount() != null ? order.getDiscountAmount() : "null").append(",");
            json.append("\"finalAmount\": ").append(order.getFinalAmount()).append(",");
            json.append("\"status\": \"").append(escapeJsonString(order.getStatus())).append("\",");
            json.append("\"itemCount\": ").append(itemCount).append(",");
            json.append("\"promoCode\": \"").append(escapeJsonString(order.getPromoCode())).append("\",");
            json.append("\"shippingAddress\": \"").append(escapeJsonString(order.getShippingAddress())).append("\",");
            json.append("\"createdAt\": \"").append(order.getCreatedAt()).append("\"");
            json.append("}");
        }
        
        json.append("]");
        return json.toString();
    }
    
    private void handleViewOrder(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            Order order = orderDAO.getOrderById(id);
            
            if (order != null) {
                sendJsonResponse(response, serializeOrderWithItems(order));
            } else {
                sendErrorResponse(response, "Order not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid order ID");
        }
    }
    
    private String serializeOrderWithItems(Order order) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"id\": ").append(order.getId()).append(",");
        json.append("\"orderNumber\": \"").append(escapeJsonString(order.getOrderNumber())).append("\",");
        json.append("\"customerName\": \"").append(escapeJsonString(order.getCustomerName())).append("\",");
        json.append("\"customerEmail\": \"").append(escapeJsonString(order.getCustomerEmail())).append("\",");
        json.append("\"customerPhone\": \"").append(escapeJsonString(order.getCustomerPhone())).append("\",");
        json.append("\"userName\": \"").append(escapeJsonString(order.getUserName())).append("\",");
        json.append("\"totalAmount\": ").append(order.getTotalAmount()).append(",");
        json.append("\"discountAmount\": ").append(order.getDiscountAmount() != null ? order.getDiscountAmount() : "null").append(",");
        json.append("\"finalAmount\": ").append(order.getFinalAmount()).append(",");
        json.append("\"status\": \"").append(escapeJsonString(order.getStatus())).append("\",");
        json.append("\"promoCode\": \"").append(escapeJsonString(order.getPromoCode())).append("\",");
        json.append("\"shippingAddress\": \"").append(escapeJsonString(order.getShippingAddress())).append("\",");
        json.append("\"createdAt\": \"").append(order.getCreatedAt()).append("\",");
        
        // Serialize order items
        json.append("\"orderItems\": [");
        List<OrderItem> items = order.getOrderItems();
        if (items != null) {
            for (int i = 0; i < items.size(); i++) {
                if (i > 0) json.append(",");
                OrderItem item = items.get(i);
                json.append("{");
                json.append("\"id\": ").append(item.getId()).append(",");
                json.append("\"productId\": ").append(item.getProductId()).append(",");
                json.append("\"productTitle\": \"").append(escapeJsonString(item.getProductTitle())).append("\",");
                json.append("\"productAuthor\": \"").append(escapeJsonString(item.getProductAuthor())).append("\",");
                json.append("\"quantity\": ").append(item.getQuantity()).append(",");
                json.append("\"unitPrice\": ").append(item.getUnitPrice()).append(",");
                json.append("\"totalPrice\": ").append(item.getTotalPrice());
                json.append("}");
            }
        }
        json.append("]");
        json.append("}");
        
        return json.toString();
    }
    
    // CRUD Operations Implementation
    /**
     * Fixed handleCreateUser method in AdminService.java
     * Replace your existing handleCreateUser method with this updated version
     */
    private void handleCreateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String role = request.getParameter("role");
        String password = request.getParameter("password"); // Get password from request
        
        // Validate password
        if (password == null || password.trim().isEmpty()) {
            sendErrorResponse(response, "Password is required");
            return;
        }
        if (password.length() < 6) {
            sendErrorResponse(response, "Password must be at least 6 characters long");
            return;
        }
        
        User user = new User(firstName, lastName, email, password, phone, role);
        
        boolean success = userDAO.createUser(user);
        sendBooleanResponse(response, success, 
            success ? "User created successfully" : "Failed to create user");
    }

    /**
     * Validate if the provided role is valid
     */
    private boolean isValidRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        
        String trimmedRole = role.trim();
        return "ADMIN".equals(trimmedRole) || 
               "STAFF".equals(trimmedRole) || 
               "CUSTOMER".equals(trimmedRole);
    }
    
    private void handleUpdateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String status = request.getParameter("status");
            
            User user = userDAO.getUserById(id);
            if (user != null) {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setEmail(email);
                user.setPhone(phone);
                user.setStatus(status);
                
                boolean success = userDAO.updateUser(user);
                sendBooleanResponse(response, success, 
                    success ? "User updated successfully" : "Failed to update user");
            } else {
                sendErrorResponse(response, "User not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    private void handleDeleteUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            boolean success = userDAO.deleteUser(id);
            sendBooleanResponse(response, success, 
                success ? "User deleted successfully" : "Failed to delete user");
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    private void handleToggleUserStatus(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            User user = userDAO.getUserById(id);
            
            if (user != null) {
                String newStatus = user.isActive() ? User.STATUS_INACTIVE : User.STATUS_ACTIVE;
                user.setStatus(newStatus);
                
                boolean success = userDAO.updateUser(user);
                sendBooleanResponse(response, success, 
                    success ? "User status updated successfully" : "Failed to update user status");
            } else {
                sendErrorResponse(response, "User not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    private void handleCreateCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String name = request.getParameter("name");
        String description = request.getParameter("description");
        
        Category category = new Category(name, description);
        boolean success = categoryDAO.createCategory(category);
        
        sendBooleanResponse(response, success, 
            success ? "Category created successfully" : "Failed to create category");
    }
    
    private void handleUpdateCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            String name = request.getParameter("name");
            String description = request.getParameter("description");
            String status = request.getParameter("status");
            
            Category category = categoryDAO.getCategoryById(id);
            if (category != null) {
                category.setName(name);
                category.setDescription(description);
                category.setStatus(status);
                
                boolean success = categoryDAO.updateCategory(category);
                sendBooleanResponse(response, success, 
                    success ? "Category updated successfully" : "Failed to update category");
            } else {
                sendErrorResponse(response, "Category not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid category ID");
        }
    }
    
    private void handleDeleteCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            boolean success = categoryDAO.deleteCategory(id);
            sendBooleanResponse(response, success, 
                success ? "Category deleted successfully" : "Failed to delete category");
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid category ID");
        }
    }
    
    private void handleCreatePromoCode(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String code = request.getParameter("code");
            String description = request.getParameter("description");
            String discountType = request.getParameter("discountType");
            BigDecimal discountValue = new BigDecimal(request.getParameter("discountValue"));
            Date startDate = Date.valueOf(request.getParameter("startDate"));
            Date endDate = Date.valueOf(request.getParameter("endDate"));
            
            PromoCode promoCode = new PromoCode(code, description, discountType, discountValue, startDate, endDate);
            boolean success = promoCodeDAO.createPromoCode(promoCode);
            
            sendBooleanResponse(response, success, 
                success ? "Promo code created successfully" : "Failed to create promo code");
        } catch (Exception e) {
            sendErrorResponse(response, "Invalid data format in promo code");
        }
    }
    
    private void handleUpdatePromoCode(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            PromoCode promoCode = promoCodeDAO.getPromoCodeById(id);
            
            if (promoCode != null) {
                promoCode.setCode(request.getParameter("code"));
                promoCode.setDescription(request.getParameter("description"));
                promoCode.setDiscountType(request.getParameter("discountType"));
                promoCode.setDiscountValue(new BigDecimal(request.getParameter("discountValue")));
                promoCode.setStartDate(Date.valueOf(request.getParameter("startDate")));
                promoCode.setEndDate(Date.valueOf(request.getParameter("endDate")));
                promoCode.setStatus(request.getParameter("status"));
                
                boolean success = promoCodeDAO.updatePromoCode(promoCode);
                sendBooleanResponse(response, success, 
                    success ? "Promo code updated successfully" : "Failed to update promo code");
            } else {
                sendErrorResponse(response, "Promo code not found");
            }
        } catch (Exception e) {
            sendErrorResponse(response, "Invalid data format in promo code");
        }
    }
    
    private void handleDeletePromoCode(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            boolean success = promoCodeDAO.deletePromoCode(id);
            sendBooleanResponse(response, success, 
                success ? "Promo code deleted successfully" : "Failed to delete promo code");
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid promo code ID");
        }
    }
    
    private void handleSearchOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String keyword = request.getParameter("keyword");
        List<Order> orders = orderDAO.searchOrders(keyword);
        sendJsonResponse(response, serializeOrders(orders));
    }
    
    private void handleUpdateOrderStatus(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            String status = request.getParameter("status");
            
            boolean success = orderDAO.updateOrderStatus(id, status);
            sendBooleanResponse(response, success, 
                success ? "Order status updated successfully" : "Failed to update order status");
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid order ID");
        }
    }
    
    private void handlePrintBill(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            Order order = orderDAO.getOrderById(id);
            
            if (order != null) {
                String billContent = generateBillContent(order);
                
                response.setContentType("text/html");
                response.setCharacterEncoding("UTF-8");
                
                PrintWriter out = response.getWriter();
                out.print(billContent);
                out.flush();
            } else {
                sendErrorResponse(response, "Order not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid order ID");
        }
    }
    
    private String generateBillContent(Order order) {
        StringBuilder bill = new StringBuilder();
        bill.append("<!DOCTYPE html><html><head>");
        bill.append("<title>Invoice - Order #").append(order.getOrderNumber()).append("</title>");
        bill.append("<meta charset='UTF-8'>");
        bill.append("<style>");
        bill.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f8f9fa; }");
        bill.append(".invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }");
        bill.append(".header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }");
        bill.append(".header h1 { color: #007bff; margin: 0; font-size: 2.5em; }");
        bill.append(".header p { color: #6c757d; margin: 5px 0; }");
        bill.append(".invoice-title { text-align: center; font-size: 1.8em; color: #343a40; margin: 20px 0; }");
        bill.append(".order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }");
        bill.append(".info-section { flex: 1; }");
        bill.append(".info-section h3 { color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 5px; }");
        bill.append("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        bill.append("th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; }");
        bill.append("th { background: linear-gradient(135deg, #007bff, #0056b3); color: white; font-weight: bold; }");
        bill.append("tbody tr:nth-child(even) { background: #f8f9fa; }");
        bill.append("tbody tr:hover { background: #e3f2fd; }");
        bill.append(".total-section { margin-top: 30px; }");
        bill.append(".total-row { font-weight: bold; background: #fff3cd !important; }");
        bill.append(".final-total { background: #28a745 !important; color: white; font-size: 1.2em; }");
        bill.append(".discount-row { background: #d1ecf1 !important; color: #0c5460; }");
        bill.append(".footer { margin-top: 40px; text-align: center; color: #6c757d; border-top: 1px solid #e9ecef; padding-top: 20px; }");
        bill.append(".no-print { margin-top: 30px; text-align: center; }");
        bill.append(".no-print button { margin: 0 10px; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; }");
        bill.append(".btn-print { background: #28a745; color: white; }");
        bill.append(".btn-close { background: #6c757d; color: white; }");
        bill.append("@media print { .no-print { display: none; } body { background: white; } .invoice-container { box-shadow: none; } }");
        bill.append("</style></head><body>");
        
        bill.append("<div class='invoice-container'>");
        
        bill.append("<div class='header'>");
        bill.append("<h1>📚 Pahana Edu</h1>");
        bill.append("<p>Leading Educational Bookshop in Colombo</p>");
        bill.append("<p>📍 Main Street, Colombo | 📞 +94 11 123 4567 | ✉️ info@pahanaedu.com</p>");
        bill.append("</div>");
        
        bill.append("<h2 class='invoice-title'>🧾 INVOICE</h2>");
        
        bill.append("<div class='order-info'>");
        bill.append("<div class='info-section'>");
        bill.append("<h3>📋 Order Details</h3>");
        bill.append("<p><strong>Order Number:</strong> ").append(order.getOrderNumber()).append("</p>");
        bill.append("<p><strong>Date:</strong> ").append(order.getCreatedAt()).append("</p>");
        bill.append("<p><strong>Status:</strong> <span style='color: #28a745; font-weight: bold;'>").append(order.getStatus().toUpperCase()).append("</span></p>");
        if (order.getPromoCode() != null && !order.getPromoCode().isEmpty()) {
            bill.append("<p><strong>Promo Code:</strong> <span style='color: #dc3545; font-weight: bold;'>").append(order.getPromoCode()).append("</span></p>");
        }
        bill.append("</div>");
        
        bill.append("<div class='info-section'>");
        bill.append("<h3>👤 Customer Information</h3>");
        bill.append("<p><strong>Name:</strong> ").append(order.getCustomerName()).append("</p>");
        bill.append("<p><strong>Email:</strong> ").append(order.getCustomerEmail()).append("</p>");
        bill.append("<p><strong>Phone:</strong> ").append(order.getCustomerPhone()).append("</p>");
        if (order.getUserName() != null && !order.getUserName().isEmpty()) {
            bill.append("<p><strong>Account:</strong> ").append(order.getUserName()).append("</p>");
        }
        bill.append("</div>");
        bill.append("</div>");
        
        if (order.getShippingAddress() != null && !order.getShippingAddress().trim().isEmpty()) {
            bill.append("<div style='margin-bottom: 30px;'>");
            bill.append("<h3>🚚 Shipping Address</h3>");
            bill.append("<p style='background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;'>").append(order.getShippingAddress()).append("</p>");
            bill.append("</div>");
        }
        
        bill.append("<table>");
        bill.append("<thead>");
        bill.append("<tr><th>📖 Book Title</th><th>✍️ Author</th><th>🔢 Qty</th><th>💰 Unit Price</th><th>💳 Total</th></tr>");
        bill.append("</thead>");
        bill.append("<tbody>");
        
        for (OrderItem item : order.getOrderItems()) {
            bill.append("<tr>");
            bill.append("<td><strong>").append(escapeHtml(item.getProductTitle())).append("</strong></td>");
            bill.append("<td>").append(escapeHtml(item.getProductAuthor())).append("</td>");
            bill.append("<td style='text-align: center;'>").append(item.getQuantity()).append("</td>");
            bill.append("<td style='text-align: right;'>Rs. ").append(formatCurrency(item.getUnitPrice())).append("</td>");
            bill.append("<td style='text-align: right;'><strong>Rs. ").append(formatCurrency(item.getTotalPrice())).append("</strong></td>");
            bill.append("</tr>");
        }
        bill.append("</tbody>");
        bill.append("</table>");
        
        bill.append("<div class='total-section'>");
        bill.append("<table style='width: 50%; margin-left: auto;'>");
        
        bill.append("<tr class='total-row'>");
        bill.append("<td><strong>💰 Subtotal</strong></td>");
        bill.append("<td style='text-align: right;'><strong>Rs. ").append(formatCurrency(order.getTotalAmount())).append("</strong></td>");
        bill.append("</tr>");
        
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            bill.append("<tr class='discount-row'>");
            bill.append("<td><strong>🎉 Discount Applied</strong></td>");
            bill.append("<td style='text-align: right;'><strong>- Rs. ").append(formatCurrency(order.getDiscountAmount())).append("</strong></td>");
            bill.append("</tr>");
        }
        
        bill.append("<tr class='final-total'>");
        bill.append("<td><strong>🏆 FINAL TOTAL</strong></td>");
        bill.append("<td style='text-align: right;'><strong>Rs. ").append(formatCurrency(order.getFinalAmount())).append("</strong></td>");
        bill.append("</tr>");
        
        bill.append("</table>");
        bill.append("</div>");
        
        bill.append("<div class='footer'>");
        bill.append("<p><strong>Thank you for your business! 🙏</strong></p>");
        bill.append("<p>📚 Happy Reading! | 🌟 Visit us again for more amazing books</p>");
        bill.append("<p style='font-size: 0.9em; margin-top: 15px;'>This is a computer-generated invoice. No signature required.</p>");
        bill.append("</div>");
        
        bill.append("<div class='no-print'>");
        bill.append("<button class='btn-print' onclick='window.print()'>🖨️ Print Invoice</button>");
        bill.append("<button class='btn-close' onclick='window.close()'>❌ Close</button>");
        bill.append("</div>");
        
        bill.append("</div>");
        bill.append("</body></html>");
        
        return bill.toString();
    }
    
    // Utility methods
    private void sendJsonResponse(HttpServletResponse response, String jsonData) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache");
        
        PrintWriter out = response.getWriter();
        out.print(jsonData);
        out.flush();
    }
    
    private void sendBooleanResponse(HttpServletResponse response, boolean success, String message) 
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"success\": ").append(success).append(",");
        json.append("\"message\": \"").append(escapeJsonString(message)).append("\"");
        json.append("}");
        
        PrintWriter out = response.getWriter();
        out.print(json.toString());
        out.flush();
    }
    
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"success\": false,");
        json.append("\"error\": true,");
        json.append("\"message\": \"").append(escapeJsonString(message)).append("\"");
        json.append("}");
        
        PrintWriter out = response.getWriter();
        out.print(json.toString());
        out.flush();
    }
    
    private String escapeJsonString(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t")
                 .replace("\b", "\\b")
                 .replace("\f", "\\f");
    }
    
    private String escapeHtml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;")
                 .replace("<", "&lt;")
                 .replace(">", "&gt;")
                 .replace("\"", "&quot;")
                 .replace("'", "&#x27;");
    }
    
    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }
}
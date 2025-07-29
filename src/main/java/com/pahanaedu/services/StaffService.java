package com.pahanaedu.services;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import com.pahanaedu.dao.*;
import com.pahanaedu.models.*;
import com.pahanaedu.utils.FileUploadHandler;

public class StaffService {
    private static StaffService instance = null;
    
    private UserDAO userDAO;
    private CategoryDAO categoryDAO;
    private ProductDAO productDAO;
    private OrderDAO orderDAO;
    
    private StaffService() {
        userDAO = UserDAO.getInstance();
        categoryDAO = CategoryDAO.getInstance();
        productDAO = ProductDAO.getInstance();
        orderDAO = OrderDAO.getInstance();
    }
    
    public static synchronized StaffService getInstance() {
        if (instance == null) {
            instance = new StaffService();
        }
        return instance;
    }
    
    // Dashboard Stats
    public void handleDashboardStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            List<Product> allProducts = productDAO.getAllProducts();
            List<Order> allOrders = orderDAO.getAllOrders();
            List<User> allCustomers = userDAO.getUsersByRole("CUSTOMER");
            
            int totalProducts = allProducts.size();
            long activeProducts = allProducts.stream().filter(p -> "active".equals(p.getStatus())).count();
            int totalOrders = allOrders.size();
            long pendingOrders = allOrders.stream().filter(o -> "pending".equals(o.getStatus())).count();
            int totalCustomers = allCustomers.size();
            
            // Today's orders
            long todayOrders = allOrders.stream()
                .filter(order -> {
                    if (order.getCreatedAt() != null) {
                        return order.getCreatedAt().toLocalDateTime().toLocalDate()
                            .equals(java.time.LocalDate.now());
                    }
                    return false;
                }).count();
            
            // Calculate today's revenue
            BigDecimal todayRevenue = allOrders.stream()
                .filter(order -> {
                    if (order.getCreatedAt() != null) {
                        return order.getCreatedAt().toLocalDateTime().toLocalDate()
                            .equals(java.time.LocalDate.now());
                    }
                    return false;
                })
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            StringBuilder stats = new StringBuilder();
            stats.append("{");
            stats.append("\"totalProducts\": ").append(totalProducts).append(",");
            stats.append("\"activeProducts\": ").append(activeProducts).append(",");
            stats.append("\"totalOrders\": ").append(totalOrders).append(",");
            stats.append("\"pendingOrders\": ").append(pendingOrders).append(",");
            stats.append("\"todayOrders\": ").append(todayOrders).append(",");
            stats.append("\"totalCustomers\": ").append(totalCustomers).append(",");
            stats.append("\"todayRevenue\": ").append(todayRevenue.setScale(2, RoundingMode.HALF_UP));
            stats.append("}");
            
            sendJsonResponse(response, stats.toString());
            
        } catch (Exception e) {
            System.err.println("StaffService: Dashboard stats error - " + e.getMessage());
            sendErrorResponse(response, "Error loading dashboard statistics");
        }
    }
    
    // Product Management
    public void handleProductManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListProducts(request, response);
                    break;
                case "search-pos":
                    handleSearchProductsForPOS(request, response);
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
                case "search":
                    handleSearchProducts(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("StaffService: Product management error - " + e.getMessage());
            sendErrorResponse(response, "Product management error");
        }
    }
    
    // Product with File Upload
    public void handleProductWithFileUpload(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String imagePath = null;
            
            for (Part part : request.getParts()) {
                if ("productImage".equals(part.getName()) && part.getSize() > 0) {
                    imagePath = FileUploadHandler.uploadProductImage(part, 
                        request.getServletContext().getRealPath(""));
                    break;
                }
            }
            
            if (imagePath != null) {
                request.setAttribute("uploadedImagePath", imagePath);
            }
            
            handleProductManagement(request, response);
            
        } catch (Exception e) {
            System.err.println("StaffService: File upload error - " + e.getMessage());
            sendErrorResponse(response, "File upload error: " + e.getMessage());
        }
    }
    
    // Customer Management
    public void handleCustomerManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListCustomers(request, response);
                    break;
                case "search-pos":
                    handleSearchCustomersForPOS(request, response);
                    break;
                case "create":
                    handleCreateCustomer(request, response);
                    break;
                case "create-guest":
                    handleCreateGuestCustomer(request, response);
                    break;
                case "search":
                    handleSearchCustomers(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("StaffService: Customer management error - " + e.getMessage());
            sendErrorResponse(response, "Customer management error");
        }
    }
    
    // Order Management - Enhanced for POS
    public void handleOrderManagement(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleListOrders(request, response);
                    break;
                case "create-pos":
                    handleCreatePOSOrder(request, response);
                    break;
                case "search-order":
                    handleSearchOrder(request, response);
                    break;
                case "update-status":
                    handleUpdateOrderStatus(request, response);
                    break;
                case "view":
                    handleViewOrder(request, response);
                    break;
                case "print-bill":
                    handlePrintBill(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid action");
            }
        } catch (Exception e) {
            System.err.println("StaffService: Order management error - " + e.getMessage());
            sendErrorResponse(response, "Order management error");
        }
    }
    
    // POS Specific Methods
    private void handleSearchProductsForPOS(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String keyword = request.getParameter("keyword");
        List<Product> products;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            products = productDAO.searchProducts(keyword);
        } else {
            products = productDAO.getAllProducts();
        }
        
        // Filter only active products with stock
        products = products.stream()
            .filter(p -> "active".equals(p.getStatus()) && p.getStockQuantity() > 0)
            .collect(java.util.stream.Collectors.toList());
        
        sendJsonResponse(response, serializePOSProducts(products));
    }
    
    private void handleSearchCustomersForPOS(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String keyword = request.getParameter("keyword");
        List<User> customers = userDAO.getUsersByRole("CUSTOMER");
        
        // Filter active customers
        customers = customers.stream()
            .filter(c -> "active".equals(c.getStatus()))
            .collect(java.util.stream.Collectors.toList());
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            customers = customers.stream()
                .filter(c -> c.getFirstName().toLowerCase().contains(keyword.toLowerCase()) ||
                           c.getLastName().toLowerCase().contains(keyword.toLowerCase()) ||
                           c.getEmail().toLowerCase().contains(keyword.toLowerCase()) ||
                           (c.getPhone() != null && c.getPhone().contains(keyword.toLowerCase())))
                .collect(java.util.stream.Collectors.toList());
        }
        
        sendJsonResponse(response, serializePOSCustomers(customers));
    }
    
    private void handleCreateGuestCustomer(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String phone = request.getParameter("phone");
            
            // Generate unique email for guest
            String guestEmail = "guest_" + System.currentTimeMillis() + "@pahana.local";
            String defaultPassword = "guest123";
            
            User guestCustomer = new User();
            guestCustomer.setFirstName(firstName);
            guestCustomer.setLastName(lastName);
            guestCustomer.setEmail(guestEmail);
            guestCustomer.setPassword(defaultPassword);
            guestCustomer.setPhone(phone);
            guestCustomer.setRole("CUSTOMER");
            guestCustomer.setStatus("active");
            
            boolean success = userDAO.createUser(guestCustomer);
            
            if (success) {
                // Get the created customer with ID
                User createdCustomer = userDAO.getUserByEmail(guestEmail);
                sendJsonResponse(response, serializeSingleCustomer(createdCustomer));
            } else {
                sendErrorResponse(response, "Failed to create guest customer");
            }
            
        } catch (Exception e) {
            sendErrorResponse(response, "Error creating guest customer: " + e.getMessage());
        }
    }
    
    private void handleCreatePOSOrder(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int customerId = Integer.parseInt(request.getParameter("customerId"));
            String orderItemsJson = request.getParameter("orderItems");
            String discountStr = request.getParameter("discount");
            String paymentMethod = request.getParameter("paymentMethod");
            String notes = request.getParameter("notes");
            
            BigDecimal discount = (discountStr != null && !discountStr.trim().isEmpty()) 
                ? new BigDecimal(discountStr) : BigDecimal.ZERO;
            
            // Parse order items from JSON
            List<OrderItem> orderItems = parseOrderItemsFromJson(orderItemsJson);
            
            if (orderItems.isEmpty()) {
                sendErrorResponse(response, "No items in the order");
                return;
            }
            
            // Calculate totals
            BigDecimal subtotal = orderItems.stream()
                .map(item -> item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal finalAmount = subtotal.subtract(discount);
            
            // Generate order number
            String orderNumber = generateOrderNumber();
            
            // Get customer details
            User customer = userDAO.getUserById(customerId);
            if (customer == null) {
                sendErrorResponse(response, "Customer not found");
                return;
            }
            
            // Create order
            Order order = new Order();
            order.setOrderNumber(orderNumber);
            order.setUserId(customerId);
            order.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
            order.setCustomerEmail(customer.getEmail());
            order.setTotalAmount(subtotal);
            order.setDiscountAmount(discount);
            order.setFinalAmount(finalAmount);
            order.setStatus("completed"); // POS orders are immediately completed
            order.setOrderItems(orderItems);
            
            // Store payment method and notes in shipping address field temporarily
            String orderNotes = "Payment: " + (paymentMethod != null ? paymentMethod : "Cash");
            if (notes != null && !notes.trim().isEmpty()) {
                orderNotes += " | Notes: " + notes;
            }
            order.setShippingAddress(orderNotes);
            
            boolean success = createOrderWithItems(order);
            
            if (success) {
                // Update product stock
                for (OrderItem item : orderItems) {
                    updateProductStock(item.getProductId(), -item.getQuantity());
                }
                
                // Get complete order details for response
                Order createdOrder = getOrderByNumber(orderNumber);
                sendJsonResponse(response, serializeOrderWithItems(createdOrder));
            } else {
                sendErrorResponse(response, "Failed to create order");
            }
            
        } catch (Exception e) {
            System.err.println("Error creating POS order: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error creating order: " + e.getMessage());
        }
    }
    
    private void handleSearchOrder(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String orderNumber = request.getParameter("orderNumber");
            String orderId = request.getParameter("orderId");
            
            Order order = null;
            
            if (orderNumber != null && !orderNumber.trim().isEmpty()) {
                order = getOrderByNumber(orderNumber);
            } else if (orderId != null && !orderId.trim().isEmpty()) {
                order = orderDAO.getOrderById(Integer.parseInt(orderId));
            }
            
            if (order != null) {
                sendJsonResponse(response, serializeOrderWithItems(order));
            } else {
                sendErrorResponse(response, "Order not found");
            }
            
        } catch (Exception e) {
            sendErrorResponse(response, "Error searching order: " + e.getMessage());
        }
    }
    
    private void handlePrintBill(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int orderId = Integer.parseInt(request.getParameter("orderId"));
            Order order = orderDAO.getOrderById(orderId);
            
            if (order != null) {
                String billHtml = generateBillHTML(order);
                response.setContentType("text/html");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(billHtml);
            } else {
                sendErrorResponse(response, "Order not found");
            }
            
        } catch (Exception e) {
            sendErrorResponse(response, "Error generating bill: " + e.getMessage());
        }
    }
    
    // Helper Methods for Order Processing
    private boolean createOrderWithItems(Order order) {
        try (java.sql.Connection connection = com.pahanaedu.utils.DatabaseConnection.getConnection()) {
            connection.setAutoCommit(false);
            
            try {
                // Insert order
                String insertOrderSQL = "INSERT INTO orders (user_id, order_number, total_amount, discount_amount, final_amount, status, customer_name, customer_email, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                java.sql.PreparedStatement orderStmt = connection.prepareStatement(insertOrderSQL, java.sql.Statement.RETURN_GENERATED_KEYS);
                orderStmt.setInt(1, order.getUserId());
                orderStmt.setString(2, order.getOrderNumber());
                orderStmt.setBigDecimal(3, order.getTotalAmount());
                orderStmt.setBigDecimal(4, order.getDiscountAmount());
                orderStmt.setBigDecimal(5, order.getFinalAmount());
                orderStmt.setString(6, order.getStatus());
                orderStmt.setString(7, order.getCustomerName());
                orderStmt.setString(8, order.getCustomerEmail());
                orderStmt.setString(9, order.getShippingAddress());
                
                int rowsAffected = orderStmt.executeUpdate();
                
                if (rowsAffected > 0) {
                    java.sql.ResultSet generatedKeys = orderStmt.getGeneratedKeys();
                    if (generatedKeys.next()) {
                        int orderId = generatedKeys.getInt(1);
                        
                        // Insert order items
                        String insertItemSQL = "INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)";
                        java.sql.PreparedStatement itemStmt = connection.prepareStatement(insertItemSQL);
                        
                        for (OrderItem item : order.getOrderItems()) {
                            itemStmt.setInt(1, orderId);
                            itemStmt.setInt(2, item.getProductId());
                            itemStmt.setInt(3, item.getQuantity());
                            itemStmt.setBigDecimal(4, item.getUnitPrice());
                            itemStmt.setBigDecimal(5, item.getTotalPrice());
                            itemStmt.addBatch();
                        }
                        
                        itemStmt.executeBatch();
                        connection.commit();
                        return true;
                    }
                }
                
                connection.rollback();
                return false;
                
            } catch (Exception e) {
                connection.rollback();
                throw e;
            }
            
        } catch (Exception e) {
            System.err.println("Error creating order with items: " + e.getMessage());
            return false;
        }
    }
    
    private boolean updateProductStock(int productId, int quantityChange) {
        try (java.sql.Connection connection = com.pahanaedu.utils.DatabaseConnection.getConnection()) {
            String updateSQL = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";
            java.sql.PreparedStatement stmt = connection.prepareStatement(updateSQL);
            stmt.setInt(1, quantityChange);
            stmt.setInt(2, productId);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error updating product stock: " + e.getMessage());
            return false;
        }
    }
    
    private Order getOrderByNumber(String orderNumber) {
        try (java.sql.Connection connection = com.pahanaedu.utils.DatabaseConnection.getConnection()) {
            String selectSQL = "SELECT o.*, u.first_name, u.last_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.order_number = ?";
            java.sql.PreparedStatement stmt = connection.prepareStatement(selectSQL);
            stmt.setString(1, orderNumber);
            java.sql.ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Order order = new Order();
                order.setId(rs.getInt("id"));
                order.setUserId(rs.getInt("user_id"));
                order.setOrderNumber(rs.getString("order_number"));
                order.setTotalAmount(rs.getBigDecimal("total_amount"));
                order.setDiscountAmount(rs.getBigDecimal("discount_amount"));
                order.setFinalAmount(rs.getBigDecimal("final_amount"));
                order.setStatus(rs.getString("status"));
                order.setCustomerName(rs.getString("customer_name"));
                order.setCustomerEmail(rs.getString("customer_email"));
                order.setShippingAddress(rs.getString("shipping_address"));
                order.setCreatedAt(rs.getTimestamp("created_at"));
                
                // Get order items
                order.setOrderItems(orderDAO.getOrderItems(order.getId()));
                
                return order;
            }
        } catch (Exception e) {
            System.err.println("Error getting order by number: " + e.getMessage());
        }
        return null;
    }
    
    // Helper Methods
    private List<OrderItem> parseOrderItemsFromJson(String orderItemsJson) {
        // Simple JSON parsing for order items
        List<OrderItem> items = new java.util.ArrayList<>();
        
        try {
            // Remove brackets and split by },{ pattern
            orderItemsJson = orderItemsJson.trim();
            if (orderItemsJson.startsWith("[")) orderItemsJson = orderItemsJson.substring(1);
            if (orderItemsJson.endsWith("]")) orderItemsJson = orderItemsJson.substring(0, orderItemsJson.length() - 1);
            
            String[] itemStrings = orderItemsJson.split("\\},\\{");
            
            for (String itemString : itemStrings) {
                itemString = itemString.replace("{", "").replace("}", "");
                String[] pairs = itemString.split(",");
                
                OrderItem item = new OrderItem();
                for (String pair : pairs) {
                    String[] keyValue = pair.split(":");
                    if (keyValue.length == 2) {
                        String key = keyValue[0].trim().replace("\"", "");
                        String value = keyValue[1].trim().replace("\"", "");
                        
                        switch (key) {
                            case "productId":
                                item.setProductId(Integer.parseInt(value));
                                break;
                            case "productTitle":
                                item.setProductTitle(value);
                                break;
                            case "quantity":
                                item.setQuantity(Integer.parseInt(value));
                                break;
                            case "unitPrice":
                                item.setUnitPrice(new BigDecimal(value));
                                break;
                        }
                    }
                }
                
                if (item.getProductId() > 0 && item.getQuantity() > 0) {
                    item.setTotalPrice(item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())));
                    items.add(item);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error parsing order items JSON: " + e.getMessage());
        }
        
        return items;
    }
    
    private String generateOrderNumber() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = LocalDateTime.now().format(formatter);
        long timestamp = System.currentTimeMillis() % 10000;
        return "ORD" + dateStr + timestamp;
    }
    
    private String generateBillHTML(Order order) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<title>Bill - ").append(escapeJson(order.getOrderNumber())).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }");
        html.append(".bill-header { text-align: center; margin-bottom: 20px; }");
        html.append(".bill-details { margin-bottom: 20px; }");
        html.append(".items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }");
        html.append(".items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        html.append(".items-table th { background-color: #f2f2f2; }");
        html.append(".total-section { margin-top: 20px; text-align: right; }");
        html.append(".footer { margin-top: 30px; text-align: center; font-size: 10px; }");
        html.append("@media print { body { margin: 0; } }");
        html.append("</style>");
        html.append("</head><body>");
        
        // Header
        html.append("<div class='bill-header'>");
        html.append("<h2>Pahana Educational Services</h2>");
        html.append("<p>123 Education Street, Kurunegala<br>Tel: +94 77 123 4567</p>");
        html.append("<hr>");
        html.append("</div>");
        
        // Bill details
        html.append("<div class='bill-details'>");
        html.append("<table style='width: 100%;'>");
        html.append("<tr><td><strong>Bill No:</strong> ").append(escapeJson(order.getOrderNumber())).append("</td>");
        html.append("<td style='text-align: right;'><strong>Date:</strong> ").append(formatDate(order.getCreatedAt())).append("</td></tr>");
        html.append("<tr><td><strong>Customer:</strong> ").append(escapeJson(order.getCustomerName())).append("</td>");
        
        // Extract payment method from shipping address
        String paymentMethod = "Cash";
        if (order.getShippingAddress() != null && order.getShippingAddress().contains("Payment:")) {
            String[] parts = order.getShippingAddress().split("\\|");
            if (parts.length > 0 && parts[0].contains("Payment:")) {
                paymentMethod = parts[0].replace("Payment:", "").trim();
            }
        }
        
        html.append("<td style='text-align: right;'><strong>Payment:</strong> ").append(escapeJson(paymentMethod)).append("</td></tr>");
        html.append("</table>");
        html.append("</div>");
        
        // Items
        html.append("<table class='items-table'>");
        html.append("<thead>");
        html.append("<tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                html.append("<tr>");
                html.append("<td>").append(escapeJson(item.getProductTitle())).append("</td>");
                html.append("<td>").append(item.getQuantity()).append("</td>");
                html.append("<td>Rs. ").append(formatCurrency(item.getUnitPrice())).append("</td>");
                html.append("<td>Rs. ").append(formatCurrency(item.getTotalPrice())).append("</td>");
                html.append("</tr>");
            }
        }
        
        html.append("</tbody>");
        html.append("</table>");
        
        // Totals
        html.append("<div class='total-section'>");
        html.append("<table style='margin-left: auto;'>");
        html.append("<tr><td><strong>Subtotal:</strong></td><td>Rs. ").append(formatCurrency(order.getTotalAmount())).append("</td></tr>");
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            html.append("<tr><td><strong>Discount:</strong></td><td>Rs. ").append(formatCurrency(order.getDiscountAmount())).append("</td></tr>");
        }
        html.append("<tr style='border-top: 2px solid #000;'><td><strong>Total:</strong></td><td><strong>Rs. ").append(formatCurrency(order.getFinalAmount())).append("</strong></td></tr>");
        html.append("</table>");
        html.append("</div>");
        
        // Footer
        html.append("<div class='footer'>");
        html.append("<p>Thank you for your business!<br>");
        html.append("Visit us again for more educational resources.</p>");
        html.append("</div>");
        
        html.append("<script>");
        html.append("window.onload = function() { window.print(); };");
        html.append("</script>");
        
        html.append("</body></html>");
        
        return html.toString();
    }
    
    // Existing implementation methods (keeping them as they were)
    private void handleListProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<Product> products = productDAO.getAllProducts();
        sendJsonResponse(response, serializeProducts(products));
    }
    
    private void handleCreateProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
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
            
            String imagePath = (String) request.getAttribute("uploadedImagePath");
            
            Product product = new Product();
            product.setTitle(title);
            product.setAuthor(author);
            product.setIsbn(isbn);
            product.setCategoryId(categoryId);
            product.setDescription(description);
            product.setPrice(price);
            product.setOfferPrice(offerPrice);
            product.setStockQuantity(stockQuantity);
            product.setImagePath(imagePath);
            product.setStatus(status != null ? status : "active");
            
            boolean success = productDAO.createProduct(product);
            sendBooleanResponse(response, success, 
                success ? "Product created successfully" : "Failed to create product");
            
        } catch (Exception e) {
            sendErrorResponse(response, "Error creating product: " + e.getMessage());
        }
    }
    
 // StaffService.java එකේ handleUpdateProduct method එක මේකෙන් replace කරන්න

    private void handleUpdateProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(getParameterValue(request, "id"));
            Product product = productDAO.getProductById(id);
            
            if (product == null) {
                sendErrorResponse(response, "Product not found");
                return;
            }
            
            // Store old image path for potential deletion
            String oldImagePath = product.getImagePath();
            
            // Update product fields
            product.setTitle(getParameterValue(request, "title"));
            product.setAuthor(getParameterValue(request, "author"));
            product.setIsbn(getParameterValue(request, "isbn"));
            product.setCategoryId(Integer.parseInt(getParameterValue(request, "categoryId")));
            product.setDescription(getParameterValue(request, "description"));
            product.setPrice(new BigDecimal(getParameterValue(request, "price")));
            
            String offerPriceStr = getParameterValue(request, "offerPrice");
            product.setOfferPrice((offerPriceStr != null && !offerPriceStr.trim().isEmpty()) 
                ? new BigDecimal(offerPriceStr) : null);
            
            product.setStockQuantity(Integer.parseInt(getParameterValue(request, "stockQuantity")));
            product.setStatus(getParameterValue(request, "status"));
            
            // Handle image update
            String newImagePath = (String) request.getAttribute("uploadedImagePath");
            if (newImagePath != null) {
                // New image uploaded
                product.setImagePath(newImagePath);
                System.out.println("StaffService: Using new uploaded image via FileUploadHandler - " + newImagePath);
                
                // Delete old image if it exists and is different from new one
                if (oldImagePath != null && !oldImagePath.equals(newImagePath)) {
                    try {
                        String webAppPath = request.getServletContext().getRealPath("");
                        boolean deleted = FileUploadHandler.deleteProductImage(oldImagePath, webAppPath);
                        if (deleted) {
                            System.out.println("StaffService: Deleted old image via FileUploadHandler - " + oldImagePath);
                        }
                    } catch (Exception e) {
                        System.err.println("StaffService: Warning - Could not delete old image: " + e.getMessage());
                    }
                }
            }
            
            boolean success = productDAO.updateProduct(product);
            sendBooleanResponse(response, success, 
                success ? "Product updated successfully" : "Failed to update product");
            
        } catch (Exception e) {
            System.err.println("StaffService: Error updating product - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error updating product: " + e.getMessage());
        }
    }
 // StaffService.java එකේ handleDeleteProduct method එක මේකෙන් replace කරන්න

    private void handleDeleteProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            
            // Get product details before deleting (to get image path)
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
                // Delete associated image file using FileUploadHandler if exists
                if (imagePath != null && !imagePath.trim().isEmpty()) {
                    try {
                        String webAppPath = request.getServletContext().getRealPath("");
                        boolean imageDeleted = FileUploadHandler.deleteProductImage(imagePath, webAppPath);
                        
                        if (imageDeleted) {
                            System.out.println("StaffService: Product and image deleted successfully via FileUploadHandler - " + imagePath);
                        } else {
                            System.out.println("StaffService: Product deleted but image deletion failed via FileUploadHandler - " + imagePath);
                        }
                    } catch (Exception e) {
                        System.err.println("StaffService: Warning - Product deleted but could not delete image: " + e.getMessage());
                    }
                }
                
                sendBooleanResponse(response, success, 
                    success ? "Product deleted successfully" : "Failed to delete product");
            } else {
                sendBooleanResponse(response, false, "Failed to delete product");
            }
            
        } catch (Exception e) {
            System.err.println("StaffService: Error deleting product - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error deleting product: " + e.getMessage());
        }
    }
    
    private void handleSearchProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String keyword = request.getParameter("keyword");
        List<Product> products = productDAO.searchProducts(keyword);
        sendJsonResponse(response, serializeProducts(products));
    }
    
    private void handleListCustomers(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<User> customers = userDAO.getUsersByRole("CUSTOMER");
        sendJsonResponse(response, serializeUsers(customers));
    }
    
    private void handleCreateCustomer(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String password = request.getParameter("password");
            
            User customer = new User();
            customer.setFirstName(firstName);
            customer.setLastName(lastName);
            customer.setEmail(email);
            customer.setPassword(password);
            customer.setPhone(phone);
            customer.setRole("CUSTOMER");
            customer.setStatus("active");
            
            boolean success = userDAO.createUser(customer);
            sendBooleanResponse(response, success, 
                success ? "Customer created successfully" : "Failed to create customer");
            
        } catch (Exception e) {
            sendErrorResponse(response, "Error creating customer: " + e.getMessage());
        }
    }
    
    private void handleSearchCustomers(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String keyword = request.getParameter("keyword");
        List<User> customers = userDAO.getUsersByRole("CUSTOMER");
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            customers = customers.stream()
                .filter(c -> c.getFirstName().toLowerCase().contains(keyword.toLowerCase()) ||
                           c.getLastName().toLowerCase().contains(keyword.toLowerCase()) ||
                           c.getEmail().toLowerCase().contains(keyword.toLowerCase()))
                .collect(java.util.stream.Collectors.toList());
        }
        
        sendJsonResponse(response, serializeUsers(customers));
    }
    
    private void handleListOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        List<Order> orders = orderDAO.getAllOrders();
        sendJsonResponse(response, serializeOrders(orders));
    }
    
    private void handleUpdateOrderStatus(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            String status = request.getParameter("status");
            
            boolean success = orderDAO.updateOrderStatus(id, status);
            sendBooleanResponse(response, success, 
                success ? "Order status updated" : "Failed to update order status");
        } catch (Exception e) {
            sendErrorResponse(response, "Error updating order status: " + e.getMessage());
        }
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
        } catch (Exception e) {
            sendErrorResponse(response, "Error viewing order: " + e.getMessage());
        }
    }
    
    // Utility methods
    private String getParameterValue(HttpServletRequest request, String paramName) {
        String value = request.getParameter(paramName);
        if (value != null) return value.trim();
        
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
            // Ignore
        }
        return null;
    }
    
    private String serializeProducts(List<Product> products) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < products.size(); i++) {
            if (i > 0) json.append(",");
            Product p = products.get(i);
            json.append("{")
                .append("\"id\":").append(p.getId()).append(",")
                .append("\"title\":\"").append(escapeJson(p.getTitle())).append("\",")
                .append("\"author\":\"").append(escapeJson(p.getAuthor())).append("\",")
                .append("\"isbn\":\"").append(escapeJson(p.getIsbn())).append("\",")
                .append("\"categoryId\":").append(p.getCategoryId()).append(",")
                .append("\"categoryName\":\"").append(escapeJson(p.getCategoryName() != null ? p.getCategoryName() : "")).append("\",")
                .append("\"description\":\"").append(escapeJson(p.getDescription())).append("\",")
                .append("\"price\":").append(p.getPrice()).append(",")
                .append("\"offerPrice\":").append(p.getOfferPrice() != null ? p.getOfferPrice() : "null").append(",")
                .append("\"stockQuantity\":").append(p.getStockQuantity()).append(",")
                .append("\"imagePath\":\"").append(escapeJson(p.getImagePath())).append("\",")
                .append("\"status\":\"").append(escapeJson(p.getStatus())).append("\",")
                .append("\"createdAt\":\"").append(p.getCreatedAt()).append("\"")
                .append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializePOSProducts(List<Product> products) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < products.size(); i++) {
            if (i > 0) json.append(",");
            Product p = products.get(i);
            BigDecimal actualPrice = p.getOfferPrice() != null ? p.getOfferPrice() : p.getPrice();
            json.append("{")
                .append("\"id\":").append(p.getId()).append(",")
                .append("\"title\":\"").append(escapeJson(p.getTitle())).append("\",")
                .append("\"author\":\"").append(escapeJson(p.getAuthor())).append("\",")
                .append("\"isbn\":\"").append(escapeJson(p.getIsbn())).append("\",")
                .append("\"price\":").append(actualPrice).append(",")
                .append("\"stockQuantity\":").append(p.getStockQuantity()).append(",")
                .append("\"imagePath\":\"").append(escapeJson(p.getImagePath())).append("\"")
                .append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializeUsers(List<User> users) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < users.size(); i++) {
            if (i > 0) json.append(",");
            User u = users.get(i);
            json.append("{")
                .append("\"id\":").append(u.getId()).append(",")
                .append("\"firstName\":\"").append(escapeJson(u.getFirstName())).append("\",")
                .append("\"lastName\":\"").append(escapeJson(u.getLastName())).append("\",")
                .append("\"email\":\"").append(escapeJson(u.getEmail())).append("\",")
                .append("\"phone\":\"").append(escapeJson(u.getPhone())).append("\",")
                .append("\"role\":\"").append(escapeJson(u.getRole())).append("\",")
                .append("\"status\":\"").append(escapeJson(u.getStatus())).append("\",")
                .append("\"isGuest\":").append(u.getEmail().contains("@pahana.local")).append(",")
                .append("\"createdAt\":\"").append(u.getCreatedAt()).append("\"")
                .append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializePOSCustomers(List<User> customers) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < customers.size(); i++) {
            if (i > 0) json.append(",");
            User c = customers.get(i);
            json.append("{")
                .append("\"id\":").append(c.getId()).append(",")
                .append("\"name\":\"").append(escapeJson(c.getFirstName() + " " + c.getLastName())).append("\",")
                .append("\"email\":\"").append(escapeJson(c.getEmail())).append("\",")
                .append("\"phone\":\"").append(escapeJson(c.getPhone())).append("\"")
                .append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializeSingleCustomer(User customer) {
        return "{" +
            "\"id\":" + customer.getId() + "," +
            "\"name\":\"" + escapeJson(customer.getFirstName() + " " + customer.getLastName()) + "\"," +
            "\"email\":\"" + escapeJson(customer.getEmail()) + "\"," +
            "\"phone\":\"" + escapeJson(customer.getPhone()) + "\"" +
            "}";
    }
    
    private String serializeOrders(List<Order> orders) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < orders.size(); i++) {
            if (i > 0) json.append(",");
            Order o = orders.get(i);
            
            // Extract payment method from shipping address
            String paymentMethod = "Cash";
            if (o.getShippingAddress() != null && o.getShippingAddress().contains("Payment:")) {
                String[] parts = o.getShippingAddress().split("\\|");
                if (parts.length > 0 && parts[0].contains("Payment:")) {
                    paymentMethod = parts[0].replace("Payment:", "").trim();
                }
            }
            
            json.append("{")
                .append("\"id\":").append(o.getId()).append(",")
                .append("\"orderNumber\":\"").append(escapeJson(o.getOrderNumber())).append("\",")
                .append("\"customerName\":\"").append(escapeJson(o.getCustomerName())).append("\",")
                .append("\"customerEmail\":\"").append(escapeJson(o.getCustomerEmail())).append("\",")
                .append("\"finalAmount\":").append(o.getFinalAmount()).append(",")
                .append("\"status\":\"").append(escapeJson(o.getStatus())).append("\",")
                .append("\"paymentMethod\":\"").append(escapeJson(paymentMethod)).append("\",")
                .append("\"createdAt\":\"").append(o.getCreatedAt()).append("\"")
                .append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializeOrderWithItems(Order order) {
        // Extract payment method and notes from shipping address
        String paymentMethod = "Cash";
        String notes = "";
        if (order.getShippingAddress() != null) {
            String[] parts = order.getShippingAddress().split("\\|");
            for (String part : parts) {
                if (part.contains("Payment:")) {
                    paymentMethod = part.replace("Payment:", "").trim();
                } else if (part.contains("Notes:")) {
                    notes = part.replace("Notes:", "").trim();
                }
            }
        }
        
        StringBuilder json = new StringBuilder("{");
        json.append("\"id\":").append(order.getId()).append(",")
            .append("\"orderNumber\":\"").append(escapeJson(order.getOrderNumber())).append("\",")
            .append("\"customerName\":\"").append(escapeJson(order.getCustomerName())).append("\",")
            .append("\"customerEmail\":\"").append(escapeJson(order.getCustomerEmail())).append("\",")
            .append("\"subtotal\":").append(order.getTotalAmount() != null ? order.getTotalAmount() : "0").append(",")
            .append("\"discount\":").append(order.getDiscountAmount() != null ? order.getDiscountAmount() : "0").append(",")
            .append("\"finalAmount\":").append(order.getFinalAmount()).append(",")
            .append("\"status\":\"").append(escapeJson(order.getStatus())).append("\",")
            .append("\"paymentMethod\":\"").append(escapeJson(paymentMethod)).append("\",")
            .append("\"notes\":\"").append(escapeJson(notes)).append("\",")
            .append("\"createdAt\":\"").append(order.getCreatedAt()).append("\",")
            .append("\"orderItems\":[");
        
        List<OrderItem> items = order.getOrderItems();
        if (items != null) {
            for (int i = 0; i < items.size(); i++) {
                if (i > 0) json.append(",");
                OrderItem item = items.get(i);
                json.append("{")
                    .append("\"productId\":").append(item.getProductId()).append(",")
                    .append("\"productTitle\":\"").append(escapeJson(item.getProductTitle())).append("\",")
                    .append("\"quantity\":").append(item.getQuantity()).append(",")
                    .append("\"unitPrice\":").append(item.getUnitPrice()).append(",")
                    .append("\"totalPrice\":").append(item.getTotalPrice())
                    .append("}");
            }
        }
        json.append("]}");
        return json.toString();
    }
    
    private void sendJsonResponse(HttpServletResponse response, String jsonData) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(jsonData);
        out.flush();
    }
    
    private void sendBooleanResponse(HttpServletResponse response, boolean success, String message) 
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String json = "{\"success\":" + success + ",\"message\":\"" + escapeJson(message) + "\"}";
        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }
    
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String json = "{\"success\":false,\"error\":true,\"message\":\"" + escapeJson(message) + "\"}";
        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
    
    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0.00";
        return amount.setScale(2, RoundingMode.HALF_UP).toString();
    }
    
    private String formatDate(java.sql.Timestamp timestamp) {
        if (timestamp == null) return "";
        return timestamp.toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
}
package com.pahanaedu.services;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.dao.*;
import com.pahanaedu.models.*;

/**
 * Customer Service for Customer Portal Operations
 * Handles product browsing, cart management, order processing, and customer profile management
 * Enhanced with promo code support and comprehensive order management
 */
public class CustomerService {
    private static CustomerService instance = null;
    
    private ProductDAO productDAO;
    private CategoryDAO categoryDAO;
    private OrderDAO orderDAO;
    private UserDAO userDAO;
    private PromoCodeDAO promoCodeDAO;
    
    private CustomerService() {
        productDAO = ProductDAO.getInstance();
        categoryDAO = CategoryDAO.getInstance();
        orderDAO = OrderDAO.getInstance();
        userDAO = UserDAO.getInstance();
        promoCodeDAO = PromoCodeDAO.getInstance();
    }
    
    public static synchronized CustomerService getInstance() {
        if (instance == null) {
            instance = new CustomerService();
        }
        return instance;
    }
    
    // Dashboard Data Operations
    public void handleDashboardData(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "stats":
                    handleCustomerStats(request, response);
                    break;
                case "recent-products":
                    handleRecentProducts(request, response);
                    break;
                case "featured-products":
                    handleFeaturedProducts(request, response);
                    break;
                case "categories":
                    handleCategoriesList(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid dashboard action");
            }
        } catch (Exception e) {
            System.err.println("CustomerService: Dashboard data error - " + e.getMessage());
            sendErrorResponse(response, "Error loading dashboard data");
        }
    }
    
    private void handleCustomerStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            
            List<Product> allProducts = productDAO.getAllProducts();
            List<Category> allCategories = categoryDAO.getActiveCategories();
            
            // Active products count
            long activeProducts = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()) && p.getStockQuantity() > 0)
                .count();
            
            int totalCategories = allCategories.size();
            int totalOrders = 0;
            BigDecimal totalSpent = BigDecimal.ZERO;
            
            if (customerId != null) {
                List<Order> customerOrders = orderDAO.getOrdersByUserId(customerId);
                totalOrders = customerOrders.size();
                totalSpent = customerOrders.stream()
                    .map(Order::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            
            StringBuilder stats = new StringBuilder();
            stats.append("{");
            stats.append("\"activeProducts\": ").append(activeProducts).append(",");
            stats.append("\"totalCategories\": ").append(totalCategories).append(",");
            stats.append("\"totalOrders\": ").append(totalOrders).append(",");
            stats.append("\"totalSpent\": ").append(totalSpent.setScale(2, RoundingMode.HALF_UP));
            stats.append("}");
            
            sendJsonResponse(response, stats.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting customer stats - " + e.getMessage());
            sendErrorResponse(response, "Error loading customer statistics");
        }
    }
    
    private void handleRecentProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            List<Product> allProducts = productDAO.getAllProducts();
            
            // Get recent products (last 10 active products)
            List<Product> recentProducts = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()) && p.getStockQuantity() > 0)
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(10)
                .collect(java.util.stream.Collectors.toList());
            
            sendJsonResponse(response, serializeProducts(recentProducts));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting recent products - " + e.getMessage());
            sendErrorResponse(response, "Error loading recent products");
        }
    }
    
    private void handleFeaturedProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            List<Product> allProducts = productDAO.getAllProducts();
            
            // Get featured products (products with offer price)
            List<Product> featuredProducts = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()) && 
                           p.getStockQuantity() > 0 && 
                           p.getOfferPrice() != null && 
                           p.getOfferPrice().compareTo(BigDecimal.ZERO) > 0)
                .limit(8)
                .collect(java.util.stream.Collectors.toList());
            
            sendJsonResponse(response, serializeProducts(featuredProducts));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting featured products - " + e.getMessage());
            sendErrorResponse(response, "Error loading featured products");
        }
    }
    
    private void handleCategoriesList(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            List<Category> categories = categoryDAO.getActiveCategories();
            sendJsonResponse(response, serializeCategories(categories));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting categories - " + e.getMessage());
            sendErrorResponse(response, "Error loading categories");
        }
    }
    
    // Product Operations
    public void handleProductOperations(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleProductsList(request, response);
                    break;
                case "search":
                    handleProductsSearch(request, response);
                    break;
                case "filter":
                    handleProductsFilter(request, response);
                    break;
                case "by-category":
                    handleProductsByCategory(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid product action");
            }
        } catch (Exception e) {
            System.err.println("CustomerService: Product operations error - " + e.getMessage());
            sendErrorResponse(response, "Error processing product operation");
        }
    }
    
    private void handleProductsList(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            List<Product> allProducts = productDAO.getAllProducts();
            
            // Filter only active products with stock
            List<Product> activeProducts = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()) && p.getStockQuantity() > 0)
                .collect(java.util.stream.Collectors.toList());
            
            sendJsonResponse(response, serializeProducts(activeProducts));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting products list - " + e.getMessage());
            sendErrorResponse(response, "Error loading products");
        }
    }
    
    private void handleProductsSearch(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String keyword = request.getParameter("keyword");
            if (keyword == null || keyword.trim().isEmpty()) {
                handleProductsList(request, response);
                return;
            }
            
            List<Product> searchResults = productDAO.searchProducts(keyword);
            
            // Filter only active products with stock
            List<Product> activeResults = searchResults.stream()
                .filter(p -> "active".equals(p.getStatus()) && p.getStockQuantity() > 0)
                .collect(java.util.stream.Collectors.toList());
            
            sendJsonResponse(response, serializeProducts(activeResults));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error searching products - " + e.getMessage());
            sendErrorResponse(response, "Error searching products");
        }
    }
    
    private void handleProductsFilter(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String categoryId = request.getParameter("categoryId");
            String minPrice = request.getParameter("minPrice");
            String maxPrice = request.getParameter("maxPrice");
            String sortBy = request.getParameter("sortBy"); // price_asc, price_desc, name_asc, name_desc, newest
            
            List<Product> allProducts = productDAO.getAllProducts();
            
            // Filter active products with stock
            java.util.stream.Stream<Product> stream = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()) && p.getStockQuantity() > 0);
            
            // Apply category filter
            if (categoryId != null && !categoryId.trim().isEmpty()) {
                int catId = Integer.parseInt(categoryId);
                stream = stream.filter(p -> p.getCategoryId() == catId);
            }
            
            // Apply price range filter
            if (minPrice != null && !minPrice.trim().isEmpty()) {
                BigDecimal min = new BigDecimal(minPrice);
                stream = stream.filter(p -> {
                    BigDecimal price = p.getOfferPrice() != null && p.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                        ? p.getOfferPrice() : p.getPrice();
                    return price.compareTo(min) >= 0;
                });
            }
            
            if (maxPrice != null && !maxPrice.trim().isEmpty()) {
                BigDecimal max = new BigDecimal(maxPrice);
                stream = stream.filter(p -> {
                    BigDecimal price = p.getOfferPrice() != null && p.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                        ? p.getOfferPrice() : p.getPrice();
                    return price.compareTo(max) <= 0;
                });
            }
            
            // Apply sorting
            if (sortBy != null) {
                switch (sortBy) {
                    case "price_asc":
                        stream = stream.sorted((p1, p2) -> {
                            BigDecimal price1 = p1.getOfferPrice() != null && p1.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                                ? p1.getOfferPrice() : p1.getPrice();
                            BigDecimal price2 = p2.getOfferPrice() != null && p2.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                                ? p2.getOfferPrice() : p2.getPrice();
                            return price1.compareTo(price2);
                        });
                        break;
                    case "price_desc":
                        stream = stream.sorted((p1, p2) -> {
                            BigDecimal price1 = p1.getOfferPrice() != null && p1.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                                ? p1.getOfferPrice() : p1.getPrice();
                            BigDecimal price2 = p2.getOfferPrice() != null && p2.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                                ? p2.getOfferPrice() : p2.getPrice();
                            return price2.compareTo(price1);
                        });
                        break;
                    case "name_asc":
                        stream = stream.sorted((p1, p2) -> p1.getTitle().compareToIgnoreCase(p2.getTitle()));
                        break;
                    case "name_desc":
                        stream = stream.sorted((p1, p2) -> p2.getTitle().compareToIgnoreCase(p1.getTitle()));
                        break;
                    case "newest":
                        stream = stream.sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
                        break;
                }
            }
            
            List<Product> filteredProducts = stream.collect(java.util.stream.Collectors.toList());
            sendJsonResponse(response, serializeProducts(filteredProducts));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error filtering products - " + e.getMessage());
            sendErrorResponse(response, "Error filtering products");
        }
    }
    
    private void handleProductsByCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String categoryIdStr = request.getParameter("categoryId");
            if (categoryIdStr == null || categoryIdStr.trim().isEmpty()) {
                handleProductsList(request, response);
                return;
            }
            
            int categoryId = Integer.parseInt(categoryIdStr);
            List<Product> allProducts = productDAO.getAllProducts();
            
            List<Product> categoryProducts = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()) && 
                           p.getStockQuantity() > 0 && 
                           p.getCategoryId() == categoryId)
                .collect(java.util.stream.Collectors.toList());
            
            sendJsonResponse(response, serializeProducts(categoryProducts));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting products by category - " + e.getMessage());
            sendErrorResponse(response, "Error loading category products");
        }
    }
    
    // Product Details
    public void handleProductDetails(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String productIdStr = request.getParameter("id");
            if (productIdStr == null || productIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Product ID is required");
                return;
            }
            
            int productId = Integer.parseInt(productIdStr);
            Product product = productDAO.getProductById(productId);
            
            if (product == null || !"active".equals(product.getStatus())) {
                sendErrorResponse(response, "Product not found or not available");
                return;
            }
            
            // Get related products from the same category
            List<Product> allProducts = productDAO.getAllProducts();
            List<Product> relatedProducts = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()) && 
                           p.getStockQuantity() > 0 && 
                           p.getCategoryId() == product.getCategoryId() && 
                           p.getId() != product.getId())
                .limit(4)
                .collect(java.util.stream.Collectors.toList());
            
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"product\": ").append(serializeSingleProduct(product)).append(",");
            json.append("\"relatedProducts\": ").append(serializeProducts(relatedProducts));
            json.append("}");
            
            sendJsonResponse(response, json.toString());
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid product ID");
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting product details - " + e.getMessage());
            sendErrorResponse(response, "Error loading product details");
        }
    }
    
    // Cart Operations
    public void handleCartOperations(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "add":
                    handleAddToCart(request, response);
                    break;
                case "update":
                    handleUpdateCart(request, response);
                    break;
                case "remove":
                    handleRemoveFromCart(request, response);
                    break;
                case "get":
                    handleGetCart(request, response);
                    break;
                case "clear":
                    handleClearCart(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid cart action");
            }
        } catch (Exception e) {
            System.err.println("CustomerService: Cart operations error - " + e.getMessage());
            sendErrorResponse(response, "Error processing cart operation");
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handleAddToCart(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String productIdStr = request.getParameter("productId");
            String quantityStr = request.getParameter("quantity");
            
            if (productIdStr == null || quantityStr == null) {
                sendErrorResponse(response, "Product ID and quantity are required");
                return;
            }
            
            int productId = Integer.parseInt(productIdStr);
            int quantity = Integer.parseInt(quantityStr);
            
            if (quantity <= 0) {
                sendErrorResponse(response, "Quantity must be greater than 0");
                return;
            }
            
            Product product = productDAO.getProductById(productId);
            if (product == null || !"active".equals(product.getStatus())) {
                sendErrorResponse(response, "Product not found or not available");
                return;
            }
            
            if (product.getStockQuantity() < quantity) {
                sendErrorResponse(response, "Insufficient stock. Available: " + product.getStockQuantity());
                return;
            }
            
            HttpSession session = request.getSession(true);
            List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
            if (cart == null) {
                cart = new ArrayList<>();
                session.setAttribute("cart", cart);
            }
            
            // Check if product already in cart
            CartItem existingItem = cart.stream()
                .filter(item -> item.getProductId() == productId)
                .findFirst()
                .orElse(null);
            
            if (existingItem != null) {
                int newQuantity = existingItem.getQuantity() + quantity;
                if (newQuantity > product.getStockQuantity()) {
                    sendErrorResponse(response, "Total quantity exceeds available stock");
                    return;
                }
                existingItem.setQuantity(newQuantity);
                existingItem.updateTotalPrice();
            } else {
                CartItem newItem = new CartItem();
                newItem.setProductId(productId);
                newItem.setProductTitle(product.getTitle());
                newItem.setProductImage(product.getImagePath());
                newItem.setQuantity(quantity);
                
                // Use offer price if available
                BigDecimal unitPrice = product.getOfferPrice() != null && product.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                    ? product.getOfferPrice() : product.getPrice();
                newItem.setUnitPrice(unitPrice);
                newItem.updateTotalPrice();
                
                cart.add(newItem);
            }
            
            sendBooleanResponse(response, true, "Product added to cart successfully");
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid product ID or quantity");
        } catch (Exception e) {
            System.err.println("CustomerService: Error adding to cart - " + e.getMessage());
            sendErrorResponse(response, "Error adding product to cart");
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handleUpdateCart(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String productIdStr = request.getParameter("productId");
            String quantityStr = request.getParameter("quantity");
            
            if (productIdStr == null || quantityStr == null) {
                sendErrorResponse(response, "Product ID and quantity are required");
                return;
            }
            
            int productId = Integer.parseInt(productIdStr);
            int quantity = Integer.parseInt(quantityStr);
            
            if (quantity < 0) {
                sendErrorResponse(response, "Quantity cannot be negative");
                return;
            }
            
            HttpSession session = request.getSession(false);
            if (session == null) {
                sendErrorResponse(response, "No cart session found");
                return;
            }
            
            List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
            if (cart == null) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            CartItem cartItem = cart.stream()
                .filter(item -> item.getProductId() == productId)
                .findFirst()
                .orElse(null);
            
            if (cartItem == null) {
                sendErrorResponse(response, "Product not found in cart");
                return;
            }
            
            if (quantity == 0) {
                cart.removeIf(item -> item.getProductId() == productId);
                sendBooleanResponse(response, true, "Product removed from cart");
                return;
            }
            
            // Check stock availability
            Product product = productDAO.getProductById(productId);
            if (product == null || quantity > product.getStockQuantity()) {
                sendErrorResponse(response, "Insufficient stock. Available: " + 
                    (product != null ? product.getStockQuantity() : 0));
                return;
            }
            
            cartItem.setQuantity(quantity);
            cartItem.updateTotalPrice();
            
            sendBooleanResponse(response, true, "Cart updated successfully");
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid product ID or quantity");
        } catch (Exception e) {
            System.err.println("CustomerService: Error updating cart - " + e.getMessage());
            sendErrorResponse(response, "Error updating cart");
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handleRemoveFromCart(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String productIdStr = request.getParameter("productId");
            
            if (productIdStr == null) {
                sendErrorResponse(response, "Product ID is required");
                return;
            }
            
            int productId = Integer.parseInt(productIdStr);
            
            HttpSession session = request.getSession(false);
            if (session == null) {
                sendErrorResponse(response, "No cart session found");
                return;
            }
            
            List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
            if (cart == null) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            boolean removed = cart.removeIf(item -> item.getProductId() == productId);
            
            if (removed) {
                sendBooleanResponse(response, true, "Product removed from cart");
            } else {
                sendErrorResponse(response, "Product not found in cart");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid product ID");
        } catch (Exception e) {
            System.err.println("CustomerService: Error removing from cart - " + e.getMessage());
            sendErrorResponse(response, "Error removing product from cart");
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handleGetCart(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            HttpSession session = request.getSession(false);
            List<CartItem> cart = new ArrayList<>();
            
            if (session != null) {
                List<CartItem> sessionCart = (List<CartItem>) session.getAttribute("cart");
                if (sessionCart != null) {
                    cart = sessionCart;
                }
            }
            
            // Validate cart items against current product data
            List<CartItem> validCart = new ArrayList<>();
            for (CartItem item : cart) {
                Product product = productDAO.getProductById(item.getProductId());
                if (product != null && "active".equals(product.getStatus()) && product.getStockQuantity() > 0) {
                    // Update price if changed
                    BigDecimal currentPrice = product.getOfferPrice() != null && product.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 
                        ? product.getOfferPrice() : product.getPrice();
                    
                    if (!item.getUnitPrice().equals(currentPrice)) {
                        item.setUnitPrice(currentPrice);
                        item.updateTotalPrice();
                    }
                    
                    // Adjust quantity if exceeds stock
                    if (item.getQuantity() > product.getStockQuantity()) {
                        item.setQuantity(product.getStockQuantity());
                        item.updateTotalPrice();
                    }
                    
                    validCart.add(item);
                }
            }
            
            // Update session with valid cart
            if (session != null) {
                session.setAttribute("cart", validCart);
            }
            
            sendJsonResponse(response, serializeCart(validCart));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting cart - " + e.getMessage());
            sendErrorResponse(response, "Error loading cart");
        }
    }
    
    private void handleClearCart(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.removeAttribute("cart");
            }
            
            sendBooleanResponse(response, true, "Cart cleared successfully");
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error clearing cart - " + e.getMessage());
            sendErrorResponse(response, "Error clearing cart");
        }
    }
    
    // Checkout Operations
    public void handleCheckoutOperations(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "validate-cart":
                    handleValidateCart(request, response);
                    break;
                case "calculate-total":
                    handleCalculateTotal(request, response);
                    break;
                case "place-order":
                    handlePlaceOrder(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid checkout action");
            }
        } catch (Exception e) {
            System.err.println("CustomerService: Checkout operations error - " + e.getMessage());
            sendErrorResponse(response, "Error processing checkout operation");
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handleValidateCart(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            HttpSession session = request.getSession(false);
            if (session == null) {
                sendErrorResponse(response, "No cart session found");
                return;
            }
            
            List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
            if (cart == null || cart.isEmpty()) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            List<String> issues = new ArrayList<>();
            List<CartItem> validCart = new ArrayList<>();
            
            for (CartItem item : cart) {
                Product product = productDAO.getProductById(item.getProductId());
                
                if (product == null || !"active".equals(product.getStatus())) {
                    issues.add("Product '" + item.getProductTitle() + "' is no longer available");
                    continue;
                }
                
                if (product.getStockQuantity() <= 0) {
                    issues.add("Product '" + item.getProductTitle() + "' is out of stock");
                    continue;
                }
                
                if (item.getQuantity() > product.getStockQuantity()) {
                    issues.add("Only " + product.getStockQuantity() + " units available for '" + item.getProductTitle() + "'");
                    item.setQuantity(product.getStockQuantity());
                    item.updateTotalPrice();
                }
                
                validCart.add(item);
            }
            
            session.setAttribute("cart", validCart);
            
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"valid\": ").append(issues.isEmpty()).append(",");
            json.append("\"issues\": [");
            for (int i = 0; i < issues.size(); i++) {
                if (i > 0) json.append(",");
                json.append("\"").append(escapeJsonString(issues.get(i))).append("\"");
            }
            json.append("],");
            json.append("\"cartItems\": ").append(serializeCart(validCart));
            json.append("}");
            
            sendJsonResponse(response, json.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error validating cart - " + e.getMessage());
            sendErrorResponse(response, "Error validating cart");
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handleCalculateTotal(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            HttpSession session = request.getSession(false);
            if (session == null) {
                sendErrorResponse(response, "No cart session found");
                return;
            }
            
            List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
            if (cart == null || cart.isEmpty()) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            String promoCode = request.getParameter("promoCode");
            
            BigDecimal subtotal = cart.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal discountAmount = BigDecimal.ZERO;
            String promoMessage = "";
            
            if (promoCode != null && !promoCode.trim().isEmpty()) {
                PromoCode promo = promoCodeDAO.getPromoCodeByCode(promoCode.trim());
                
                if (promo != null && "active".equals(promo.getStatus())) {
                    LocalDate today = LocalDate.now();
                    LocalDate startDate = promo.getStartDate().toLocalDate();
                    LocalDate endDate = promo.getEndDate().toLocalDate();
                    
                    if (!today.isBefore(startDate) && !today.isAfter(endDate)) {
                        if ("percentage".equals(promo.getDiscountType())) {
                            discountAmount = subtotal.multiply(promo.getDiscountValue())
                                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                        } else if ("fixed".equals(promo.getDiscountType())) {
                            discountAmount = promo.getDiscountValue();
                            if (discountAmount.compareTo(subtotal) > 0) {
                                discountAmount = subtotal;
                            }
                        }
                        promoMessage = "Promo code applied successfully";
                    } else {
                        promoMessage = "Promo code has expired";
                    }
                } else {
                    promoMessage = "Invalid promo code";
                }
            }
            
            BigDecimal finalTotal = subtotal.subtract(discountAmount);
            if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
                finalTotal = BigDecimal.ZERO;
            }
            
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"subtotal\": ").append(subtotal.setScale(2, RoundingMode.HALF_UP)).append(",");
            json.append("\"discountAmount\": ").append(discountAmount.setScale(2, RoundingMode.HALF_UP)).append(",");
            json.append("\"finalTotal\": ").append(finalTotal.setScale(2, RoundingMode.HALF_UP)).append(",");
            json.append("\"promoMessage\": \"").append(escapeJsonString(promoMessage)).append("\"");
            json.append("}");
            
            sendJsonResponse(response, json.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error calculating total - " + e.getMessage());
            sendErrorResponse(response, "Error calculating total");
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handlePlaceOrder(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            if (customerId == null) {
                sendErrorResponse(response, "Customer not authenticated");
                return;
            }
            
            HttpSession session = request.getSession(false);
            if (session == null) {
                sendErrorResponse(response, "No cart session found");
                return;
            }
            
            List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
            if (cart == null || cart.isEmpty()) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            // Get form data
            String customerName = request.getParameter("customerName");
            String customerEmail = request.getParameter("customerEmail");
            String customerPhone = request.getParameter("customerPhone");
            String shippingAddress = request.getParameter("shippingAddress");
            String promoCode = request.getParameter("promoCode");
            
            if (customerName == null || customerEmail == null || shippingAddress == null) {
                sendErrorResponse(response, "Customer details are required");
                return;
            }
            
            // Calculate totals
            BigDecimal subtotal = cart.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal discountAmount = BigDecimal.ZERO;
            Integer promoCodeId = null;
            
            if (promoCode != null && !promoCode.trim().isEmpty()) {
                PromoCode promo = promoCodeDAO.getPromoCodeByCode(promoCode.trim());
                
                if (promo != null && "active".equals(promo.getStatus())) {
                    LocalDate today = LocalDate.now();
                    if (!today.isBefore(promo.getStartDate().toLocalDate()) && 
                        !today.isAfter(promo.getEndDate().toLocalDate())) {
                        
                        if ("percentage".equals(promo.getDiscountType())) {
                            discountAmount = subtotal.multiply(promo.getDiscountValue())
                                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                        } else if ("fixed".equals(promo.getDiscountType())) {
                            discountAmount = promo.getDiscountValue();
                            if (discountAmount.compareTo(subtotal) > 0) {
                                discountAmount = subtotal;
                            }
                        }
                        promoCodeId = promo.getId();
                    }
                }
            }
            
            BigDecimal finalTotal = subtotal.subtract(discountAmount);
            
            // Generate order number
            String orderNumber = generateOrderNumber();
            
            // Create order
            Order order = new Order();
            order.setUserId(customerId);
            order.setOrderNumber(orderNumber);
            order.setTotalAmount(subtotal);
            order.setDiscountAmount(discountAmount);
            order.setFinalAmount(finalTotal);
            order.setPromoCodeId(promoCodeId);
            order.setStatus("pending");
            order.setCustomerName(customerName);
            order.setCustomerEmail(customerEmail);
            order.setCustomerPhone(customerPhone);
            order.setShippingAddress(shippingAddress);
            
            // Convert cart items to order items
            List<OrderItem> orderItems = new ArrayList<>();
            for (CartItem cartItem : cart) {
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(cartItem.getProductId());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setUnitPrice(cartItem.getUnitPrice());
                orderItem.setTotalPrice(cartItem.getTotalPrice());
                orderItems.add(orderItem);
            }
            order.setOrderItems(orderItems);
            
            // Save order
            boolean success = orderDAO.createOrderWithItems(order);
            
            if (success) {
                // Update promo code usage
                if (promoCodeId != null) {
                    promoCodeDAO.incrementUsedCount(promoCodeId);
                }
                
                // Update product stock
                for (CartItem cartItem : cart) {
                    updateProductStock(cartItem.getProductId(), -cartItem.getQuantity());
                }
                
                // Clear cart
                session.removeAttribute("cart");
                
                StringBuilder json = new StringBuilder();
                json.append("{");
                json.append("\"success\": true,");
                json.append("\"orderNumber\": \"").append(escapeJsonString(orderNumber)).append("\",");
                json.append("\"message\": \"Order placed successfully\"");
                json.append("}");
                
                sendJsonResponse(response, json.toString());
            } else {
                sendErrorResponse(response, "Failed to place order");
            }
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error placing order - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error placing order");
        }
    }
    
    // Order Operations
    public void handleOrderOperations(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "list":
                    handleOrdersList(request, response);
                    break;
                case "details":
                    handleOrderDetails(request, response);
                    break;
                case "cancel":
                    handleCancelOrder(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid order action");
            }
        } catch (Exception e) {
            System.err.println("CustomerService: Order operations error - " + e.getMessage());
            sendErrorResponse(response, "Error processing order operation");
        }
    }
    
    private void handleOrdersList(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            if (customerId == null) {
                sendErrorResponse(response, "Customer not authenticated");
                return;
            }
            
            List<Order> orders = orderDAO.getOrdersByUserId(customerId);
            sendJsonResponse(response, serializeOrders(orders));
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting orders list - " + e.getMessage());
            sendErrorResponse(response, "Error loading orders");
        }
    }
    
    private void handleOrderDetails(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            if (customerId == null) {
                sendErrorResponse(response, "Customer not authenticated");
                return;
            }
            
            String orderIdStr = request.getParameter("orderId");
            if (orderIdStr == null) {
                sendErrorResponse(response, "Order ID is required");
                return;
            }
            
            int orderId = Integer.parseInt(orderIdStr);
            Order order = orderDAO.getOrderById(orderId);
            
            if (order == null || order.getUserId() != customerId) {
                sendErrorResponse(response, "Order not found");
                return;
            }
            
            sendJsonResponse(response, serializeOrderWithItems(order));
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid order ID");
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting order details - " + e.getMessage());
            sendErrorResponse(response, "Error loading order details");
        }
    }
    
    private void handleCancelOrder(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            if (customerId == null) {
                sendErrorResponse(response, "Customer not authenticated");
                return;
            }
            
            String orderIdStr = request.getParameter("orderId");
            if (orderIdStr == null) {
                sendErrorResponse(response, "Order ID is required");
                return;
            }
            
            int orderId = Integer.parseInt(orderIdStr);
            Order order = orderDAO.getOrderById(orderId);
            
            if (order == null || order.getUserId() != customerId) {
                sendErrorResponse(response, "Order not found");
                return;
            }
            
            if (!"pending".equals(order.getStatus())) {
                sendErrorResponse(response, "Only pending orders can be cancelled");
                return;
            }
            
            boolean success = orderDAO.updateOrderStatus(orderId, "cancelled");
            
            if (success) {
                // Restore product stock
                List<OrderItem> orderItems = orderDAO.getOrderItems(orderId);
                for (OrderItem item : orderItems) {
                    updateProductStock(item.getProductId(), item.getQuantity());
                }
                
                sendBooleanResponse(response, true, "Order cancelled successfully");
            } else {
                sendErrorResponse(response, "Failed to cancel order");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid order ID");
        } catch (Exception e) {
            System.err.println("CustomerService: Error cancelling order - " + e.getMessage());
            sendErrorResponse(response, "Error cancelling order");
        }
    }
    
    // Profile Operations
    public void handleProfileOperations(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String action = request.getParameter("action");
        
        try {
            switch (action) {
                case "get":
                    handleGetProfile(request, response);
                    break;
                case "update":
                    handleUpdateProfile(request, response);
                    break;
                case "change-password":
                    handleChangePassword(request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid profile action");
            }
        } catch (Exception e) {
            System.err.println("CustomerService: Profile operations error - " + e.getMessage());
            sendErrorResponse(response, "Error processing profile operation");
        }
    }
    
    private void handleGetProfile(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            if (customerId == null) {
                sendErrorResponse(response, "Customer not authenticated");
                return;
            }
            
            User customer = userDAO.getUserById(customerId);
            if (customer == null) {
                sendErrorResponse(response, "Customer not found");
                return;
            }
            
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"id\": ").append(customer.getId()).append(",");
            json.append("\"firstName\": \"").append(escapeJsonString(customer.getFirstName())).append("\",");
            json.append("\"lastName\": \"").append(escapeJsonString(customer.getLastName())).append("\",");
            json.append("\"email\": \"").append(escapeJsonString(customer.getEmail())).append("\",");
            json.append("\"phone\": \"").append(escapeJsonString(customer.getPhone() != null ? customer.getPhone() : "")).append("\",");
            json.append("\"status\": \"").append(escapeJsonString(customer.getStatus())).append("\",");
            json.append("\"createdAt\": \"").append(customer.getCreatedAt()).append("\"");
            json.append("}");
            
            sendJsonResponse(response, json.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error getting profile - " + e.getMessage());
            sendErrorResponse(response, "Error loading profile");
        }
    }
    
    private void handleUpdateProfile(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            if (customerId == null) {
                sendErrorResponse(response, "Customer not authenticated");
                return;
            }
            
            User customer = userDAO.getUserById(customerId);
            if (customer == null) {
                sendErrorResponse(response, "Customer not found");
                return;
            }
            
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String phone = request.getParameter("phone");
            
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty()) {
                sendErrorResponse(response, "First name and last name are required");
                return;
            }
            
            customer.setFirstName(firstName.trim());
            customer.setLastName(lastName.trim());
            customer.setPhone(phone != null ? phone.trim() : null);
            
            boolean success = userDAO.updateUser(customer);
            
            if (success) {
                // Update session
                HttpSession session = request.getSession(false);
                if (session != null) {
                    session.setAttribute("userName", firstName + " " + lastName);
                }
                
                sendBooleanResponse(response, true, "Profile updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update profile");
            }
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error updating profile - " + e.getMessage());
            sendErrorResponse(response, "Error updating profile");
        }
    }
    
    private void handleChangePassword(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Integer customerId = getCustomerId(request);
            if (customerId == null) {
                sendErrorResponse(response, "Customer not authenticated");
                return;
            }
            
            String currentPassword = request.getParameter("currentPassword");
            String newPassword = request.getParameter("newPassword");
            String confirmPassword = request.getParameter("confirmPassword");
            
            if (currentPassword == null || newPassword == null || confirmPassword == null) {
                sendErrorResponse(response, "All password fields are required");
                return;
            }
            
            if (!newPassword.equals(confirmPassword)) {
                sendErrorResponse(response, "New passwords do not match");
                return;
            }
            
            if (newPassword.length() < 6) {
                sendErrorResponse(response, "New password must be at least 6 characters long");
                return;
            }
            
            User customer = userDAO.getUserById(customerId);
            if (customer == null) {
                sendErrorResponse(response, "Customer not found");
                return;
            }
            
            // Verify current password using UserDAO's validateLogin method
            User validatedUser = userDAO.validateLogin(customer.getEmail(), currentPassword);
            if (validatedUser == null) {
                sendErrorResponse(response, "Current password is incorrect");
                return;
            }
            
            // Update password using UserDAO's updatePassword method
            boolean success = userDAO.updatePassword(customer.getEmail(), newPassword);
            
            if (success) {
                sendBooleanResponse(response, true, "Password changed successfully");
            } else {
                sendErrorResponse(response, "Failed to change password");
            }
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error changing password - " + e.getMessage());
            sendErrorResponse(response, "Error changing password");
        }
    }
    
    // Promo Code Validation
    public void handlePromoValidation(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String promoCode = request.getParameter("code");
            
            if (promoCode == null || promoCode.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code is required");
                return;
            }
            
            PromoCode promo = promoCodeDAO.getPromoCodeByCode(promoCode.trim());
            
            if (promo == null) {
                sendErrorResponse(response, "Invalid promo code");
                return;
            }
            
            if (!"active".equals(promo.getStatus())) {
                sendErrorResponse(response, "Promo code is not active");
                return;
            }
            
            LocalDate today = LocalDate.now();
            LocalDate startDate = promo.getStartDate().toLocalDate();
            LocalDate endDate = promo.getEndDate().toLocalDate();
            
            if (today.isBefore(startDate)) {
                sendErrorResponse(response, "Promo code is not yet valid");
                return;
            }
            
            if (today.isAfter(endDate)) {
                sendErrorResponse(response, "Promo code has expired");
                return;
            }
            
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"valid\": true,");
            json.append("\"code\": \"").append(escapeJsonString(promo.getCode())).append("\",");
            json.append("\"description\": \"").append(escapeJsonString(promo.getDescription())).append("\",");
            json.append("\"discountType\": \"").append(escapeJsonString(promo.getDiscountType())).append("\",");
            json.append("\"discountValue\": ").append(promo.getDiscountValue()).append(",");
            json.append("\"message\": \"Valid promo code\"");
            json.append("}");
            
            sendJsonResponse(response, json.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerService: Error validating promo code - " + e.getMessage());
            sendErrorResponse(response, "Error validating promo code");
        }
    }
    
    // Helper Methods
    private Integer getCustomerId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return (Integer) session.getAttribute("userId");
        }
        return null;
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
    
    private String generateOrderNumber() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = LocalDateTime.now().format(formatter);
        long timestamp = System.currentTimeMillis() % 10000;
        return "ORD" + dateStr + timestamp;
    }
    
    // Serialization Methods
    private String serializeProducts(List<Product> products) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < products.size(); i++) {
            if (i > 0) json.append(",");
            json.append(serializeSingleProduct(products.get(i)));
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializeSingleProduct(Product product) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"id\": ").append(product.getId()).append(",");
        json.append("\"title\": \"").append(escapeJsonString(product.getTitle())).append("\",");
        json.append("\"author\": \"").append(escapeJsonString(product.getAuthor() != null ? product.getAuthor() : "")).append("\",");
        json.append("\"isbn\": \"").append(escapeJsonString(product.getIsbn() != null ? product.getIsbn() : "")).append("\",");
        json.append("\"categoryId\": ").append(product.getCategoryId()).append(",");
        json.append("\"categoryName\": \"").append(escapeJsonString(product.getCategoryName() != null ? product.getCategoryName() : "")).append("\",");
        json.append("\"description\": \"").append(escapeJsonString(product.getDescription() != null ? product.getDescription() : "")).append("\",");
        json.append("\"price\": ").append(product.getPrice()).append(",");
        json.append("\"offerPrice\": ").append(product.getOfferPrice() != null ? product.getOfferPrice() : "null").append(",");
        json.append("\"stockQuantity\": ").append(product.getStockQuantity()).append(",");
        json.append("\"imagePath\": \"").append(escapeJsonString(product.getImagePath() != null ? product.getImagePath() : "")).append("\",");
        json.append("\"status\": \"").append(escapeJsonString(product.getStatus())).append("\",");
        json.append("\"isOnOffer\": ").append(product.getOfferPrice() != null && product.getOfferPrice().compareTo(BigDecimal.ZERO) > 0).append(",");
        json.append("\"displayPrice\": ").append(product.getOfferPrice() != null && product.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 ? product.getOfferPrice() : product.getPrice()).append(",");
        json.append("\"savings\": ").append(product.getOfferPrice() != null && product.getOfferPrice().compareTo(BigDecimal.ZERO) > 0 ? product.getPrice().subtract(product.getOfferPrice()) : "0").append(",");
        json.append("\"createdAt\": \"").append(product.getCreatedAt()).append("\"");
        json.append("}");
        return json.toString();
    }
    
    private String serializeCategories(List<Category> categories) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < categories.size(); i++) {
            if (i > 0) json.append(",");
            Category category = categories.get(i);
            json.append("{");
            json.append("\"id\": ").append(category.getId()).append(",");
            json.append("\"name\": \"").append(escapeJsonString(category.getName())).append("\",");
            json.append("\"description\": \"").append(escapeJsonString(category.getDescription() != null ? category.getDescription() : "")).append("\",");
            json.append("\"status\": \"").append(escapeJsonString(category.getStatus())).append("\"");
            json.append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializeCart(List<CartItem> cartItems) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"items\": [");
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;
        
        for (int i = 0; i < cartItems.size(); i++) {
            if (i > 0) json.append(",");
            CartItem item = cartItems.get(i);
            
            json.append("{");
            json.append("\"productId\": ").append(item.getProductId()).append(",");
            json.append("\"productTitle\": \"").append(escapeJsonString(item.getProductTitle())).append("\",");
            json.append("\"productImage\": \"").append(escapeJsonString(item.getProductImage() != null ? item.getProductImage() : "")).append("\",");
            json.append("\"quantity\": ").append(item.getQuantity()).append(",");
            json.append("\"unitPrice\": ").append(item.getUnitPrice()).append(",");
            json.append("\"totalPrice\": ").append(item.getTotalPrice());
            json.append("}");
            
            totalAmount = totalAmount.add(item.getTotalPrice());
            totalItems += item.getQuantity();
        }
        
        json.append("],");
        json.append("\"totalItems\": ").append(totalItems).append(",");
        json.append("\"totalAmount\": ").append(totalAmount.setScale(2, RoundingMode.HALF_UP));
        json.append("}");
        
        return json.toString();
    }
    
    private String serializeOrders(List<Order> orders) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < orders.size(); i++) {
            if (i > 0) json.append(",");
            Order order = orders.get(i);
            
            json.append("{");
            json.append("\"id\": ").append(order.getId()).append(",");
            json.append("\"orderNumber\": \"").append(escapeJsonString(order.getOrderNumber())).append("\",");
            json.append("\"totalAmount\": ").append(order.getTotalAmount()).append(",");
            json.append("\"discountAmount\": ").append(order.getDiscountAmount() != null ? order.getDiscountAmount() : "0").append(",");
            json.append("\"finalAmount\": ").append(order.getFinalAmount()).append(",");
            json.append("\"status\": \"").append(escapeJsonString(order.getStatus())).append("\",");
            json.append("\"customerName\": \"").append(escapeJsonString(order.getCustomerName())).append("\",");
            json.append("\"shippingAddress\": \"").append(escapeJsonString(order.getShippingAddress() != null ? order.getShippingAddress() : "")).append("\",");
            json.append("\"createdAt\": \"").append(order.getCreatedAt()).append("\"");
            json.append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    private String serializeOrderWithItems(Order order) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"id\": ").append(order.getId()).append(",");
        json.append("\"orderNumber\": \"").append(escapeJsonString(order.getOrderNumber())).append("\",");
        json.append("\"totalAmount\": ").append(order.getTotalAmount()).append(",");
        json.append("\"discountAmount\": ").append(order.getDiscountAmount() != null ? order.getDiscountAmount() : "0").append(",");
        json.append("\"finalAmount\": ").append(order.getFinalAmount()).append(",");
        json.append("\"status\": \"").append(escapeJsonString(order.getStatus())).append("\",");
        json.append("\"customerName\": \"").append(escapeJsonString(order.getCustomerName())).append("\",");
        json.append("\"customerEmail\": \"").append(escapeJsonString(order.getCustomerEmail())).append("\",");
        json.append("\"customerPhone\": \"").append(escapeJsonString(order.getCustomerPhone() != null ? order.getCustomerPhone() : "")).append("\",");
        json.append("\"shippingAddress\": \"").append(escapeJsonString(order.getShippingAddress() != null ? order.getShippingAddress() : "")).append("\",");
        json.append("\"promoCode\": \"").append(escapeJsonString(order.getPromoCode() != null ? order.getPromoCode() : "")).append("\",");
        json.append("\"createdAt\": \"").append(order.getCreatedAt()).append("\",");
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
                json.append("\"productAuthor\": \"").append(escapeJsonString(item.getProductAuthor() != null ? item.getProductAuthor() : "")).append("\",");
                json.append("\"quantity\": ").append(item.getQuantity()).append(",");
                json.append("\"unitPrice\": ").append(item.getUnitPrice()).append(",");
                json.append("\"totalPrice\": ").append(item.getTotalPrice());
                json.append("}");
            }
        }
        
        json.append("]}");
        return json.toString();
    }
    
    // Utility Methods
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
}

// CartItem Helper Class
class CartItem {
    private int productId;
    private String productTitle;
    private String productImage;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    
    public CartItem() {
        this.unitPrice = BigDecimal.ZERO;
        this.totalPrice = BigDecimal.ZERO;
    }
    
    // Getters and setters
    public int getProductId() { return productId; }
    public void setProductId(int productId) { this.productId = productId; }
    
    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }
    
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
    
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { 
        this.quantity = quantity;
        updateTotalPrice();
    }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { 
        this.unitPrice = unitPrice;
        updateTotalPrice();
    }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public void updateTotalPrice() {
        this.totalPrice = this.unitPrice.multiply(new BigDecimal(this.quantity));
    }
}
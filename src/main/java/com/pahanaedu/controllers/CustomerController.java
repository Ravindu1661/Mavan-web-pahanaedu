package com.pahanaedu.controllers;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.services.CustomerService;

/**
 * Customer Controller for Customer Portal Management
 * Handles all customer operations: product browsing, cart management, orders, profile
 * Customer authentication required for most operations
 */
@WebServlet({
    "/customer/dashboard",
    "/customer/products", 
    "/customer/product-details",
    "/customer/cart",
    "/customer/checkout",
    "/customer/orders",
    "/customer/profile",
    "/customer/promo-validate"
})
public class CustomerController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private CustomerService customerService;
    
    @Override
    public void init() throws ServletException {
        try {
            customerService = CustomerService.getInstance();
            System.out.println("CustomerController: Service initialized successfully");
        } catch (Exception e) {
            System.err.println("CustomerController: Failed to initialize service - " + e.getMessage());
            throw new ServletException("Failed to initialize customer service", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String action = getActionFromURI(requestURI);
        
        System.out.println("CustomerController: Processing GET request - " + action);
        
        try {
            switch (action) {
                case "dashboard":
                    handleDashboardPage(request, response);
                    break;
                case "products":
                    handleProductsPage(request, response);
                    break;
                case "product-details":
                    handleProductDetailsPage(request, response);
                    break;
                case "cart":
                    handleCartPage(request, response);
                    break;
                case "checkout":
                    if (!isCustomerAuthenticated(request)) {
                        response.sendRedirect(request.getContextPath() + "/login-signup.jsp");
                        return;
                    }
                    handleCheckoutPage(request, response);
                    break;
                case "orders":
                    if (!isCustomerAuthenticated(request)) {
                        response.sendRedirect(request.getContextPath() + "/login-signup.jsp");
                        return;
                    }
                    handleOrdersPage(request, response);
                    break;
                case "profile":
                    if (!isCustomerAuthenticated(request)) {
                        response.sendRedirect(request.getContextPath() + "/login-signup.jsp");
                        return;
                    }
                    handleProfilePage(request, response);
                    break;
                default:
                    response.sendError(HttpServletResponse.SC_NOT_FOUND, "Page not found");
                    break;
            }
        } catch (Exception e) {
            System.err.println("CustomerController: Error handling GET request - " + e.getMessage());
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server error");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String action = getActionFromURI(requestURI);
        
        System.out.println("CustomerController: Processing POST request - " + action);
        
        // Set response headers for AJAX requests
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        
        try {
            switch (action) {
                case "dashboard":
                    customerService.handleDashboardData(request, response);
                    break;
                case "products":
                    customerService.handleProductOperations(request, response);
                    break;
                case "product-details":
                    customerService.handleProductDetails(request, response);
                    break;
                case "cart":
                    customerService.handleCartOperations(request, response);
                    break;
                case "checkout":
                    if (!isCustomerAuthenticated(request)) {
                        sendJsonError(response, "Authentication required", HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                    customerService.handleCheckoutOperations(request, response);
                    break;
                case "orders":
                    if (!isCustomerAuthenticated(request)) {
                        sendJsonError(response, "Authentication required", HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                    customerService.handleOrderOperations(request, response);
                    break;
                case "profile":
                    if (!isCustomerAuthenticated(request)) {
                        sendJsonError(response, "Authentication required", HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                    customerService.handleProfileOperations(request, response);
                    break;
                case "promo-validate":
                    customerService.handlePromoValidation(request, response);
                    break;
                default:
                    sendJsonError(response, "Invalid endpoint", HttpServletResponse.SC_NOT_FOUND);
                    break;
            }
        } catch (Exception e) {
            System.err.println("CustomerController: Error processing POST request - " + e.getMessage());
            e.printStackTrace();
            sendJsonError(response, "Server error: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Check if customer is authenticated
     */
    private boolean isCustomerAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            System.out.println("CustomerController: No valid session found");
            return false;
        }
        
        String userRole = (String) session.getAttribute("userRole");
        boolean isCustomer = "CUSTOMER".equals(userRole);
        
        if (!isCustomer) {
            System.out.println("CustomerController: User role is not CUSTOMER: " + userRole);
        } else {
            System.out.println("CustomerController: Customer authentication successful - Role: " + userRole);
        }
        
        return isCustomer;
    }
    
    /**
     * Get customer ID from session
     */
    private Integer getCustomerId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return (Integer) session.getAttribute("userId");
        }
        return null;
    }
    
    /**
     * Handle dashboard page request
     */
    private void handleDashboardPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/customer-dashboard.jsp");
    }
    
    /**
     * Handle products page request
     */
    private void handleProductsPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/customer-products.jsp");
    }
    
    /**
     * Handle product details page request
     */
    private void handleProductDetailsPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String productId = request.getParameter("id");
        if (productId != null) {
            response.sendRedirect(request.getContextPath() + "/customer-product-details.jsp?id=" + productId);
        } else {
            response.sendRedirect(request.getContextPath() + "/customer-products.jsp");
        }
    }
    
    /**
     * Handle cart page request
     */
    private void handleCartPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/customer-cart.jsp");
    }
    
    /**
     * Handle checkout page request
     */
    private void handleCheckoutPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/customer-checkout.jsp");
    }
    
    /**
     * Handle orders page request
     */
    private void handleOrdersPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/customer-orders.jsp");
    }
    
    /**
     * Handle profile page request
     */
    private void handleProfilePage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/customer-profile.jsp");
    }
    
    /**
     * Extract action from request URI
     */
    private String getActionFromURI(String requestURI) {
        if (requestURI == null) {
            return "";
        }
        
        // Extract the last part after /customer/
        String[] parts = requestURI.split("/");
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
        
        return "";
    }
    
    /**
     * Send JSON error response
     */
    private void sendJsonError(HttpServletResponse response, String message, int statusCode) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String jsonError = "{\"success\": false, \"error\": true, \"message\": \"" + 
                          escapeJsonString(message) + "\"}";
        
        response.getWriter().write(jsonError);
        response.getWriter().flush();
    }
    
    /**
     * Escape JSON string to prevent injection
     */
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
    
    @Override
    public void destroy() {
        System.out.println("CustomerController: Controller being destroyed");
        customerService = null;
        super.destroy();
    }
}
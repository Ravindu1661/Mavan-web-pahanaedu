package com.pahanaedu.controllers;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.pahanaedu.services.PasswordResetService;

/**
 * Password Reset Controller
 * Handles password reset and password change requests
 * Maps to /auth/password-reset and /auth/password-change endpoints
 */
@WebServlet({
    "/auth/password-reset",
    "/auth/password-change"
})
public class PasswordResetController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private PasswordResetService passwordResetService;
    
    @Override
    public void init() throws ServletException {
        try {
            passwordResetService = PasswordResetService.getInstance();
            System.out.println("PasswordResetController: Service initialized successfully");
        } catch (Exception e) {
            System.err.println("PasswordResetController: Failed to initialize service - " + e.getMessage());
            throw new ServletException("Failed to initialize password reset service", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        System.out.println("PasswordResetController: Processing GET request - " + requestURI);
        
        // Redirect GET requests to appropriate pages
        if (requestURI.contains("password-reset")) {
            response.sendRedirect(request.getContextPath() + "/password-reset.jsp");
        } else if (requestURI.contains("password-change")) {
            response.sendRedirect(request.getContextPath() + "/login-signup.jsp");
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Page not found");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        System.out.println("PasswordResetController: Processing POST request - " + requestURI);
        
        // Set response headers for AJAX requests
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        
        try {
            if (requestURI.contains("password-reset")) {
                handlePasswordReset(request, response);
            } else if (requestURI.contains("password-change")) {
                handlePasswordChange(request, response);
            } else {
                sendJsonError(response, "Invalid endpoint", HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("PasswordResetController: Error processing request - " + e.getMessage());
            e.printStackTrace();
            sendJsonError(response, "Server error: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Handle password reset request
     */
    private void handlePasswordReset(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        System.out.println("PasswordResetController: Handling password reset request");
        
        // Get email parameter
        String email = request.getParameter("email");
        
        // Log request details (without sensitive data)
        System.out.println("PasswordResetController: Reset request for email: " + 
            (email != null ? maskEmail(email) : "null"));
        
        // Validate request
        if (email == null || email.trim().isEmpty()) {
            System.err.println("PasswordResetController: Email parameter missing");
            sendJsonError(response, "Email address is required", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        // Delegate to service
        try {
            passwordResetService.handlePasswordReset(request, response);
            System.out.println("PasswordResetController: Password reset request processed");
        } catch (Exception e) {
            System.err.println("PasswordResetController: Service error - " + e.getMessage());
            sendJsonError(response, "Failed to process password reset request", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Handle password change request
     */
    private void handlePasswordChange(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        System.out.println("PasswordResetController: Handling password change request");
        
        // Get parameters
        String email = request.getParameter("email");
        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");
        String confirmPassword = request.getParameter("confirmPassword");
        
        // Log request details (without sensitive data)
        System.out.println("PasswordResetController: Password change request for email: " + 
            (email != null ? maskEmail(email) : "null"));
        
        // Basic validation
        if (email == null || email.trim().isEmpty()) {
            sendJsonError(response, "Email address is required", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            sendJsonError(response, "Current password is required", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        if (newPassword == null || newPassword.trim().isEmpty()) {
            sendJsonError(response, "New password is required", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        if (confirmPassword == null || !newPassword.equals(confirmPassword)) {
            sendJsonError(response, "New passwords do not match", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        // Delegate to service
        try {
            passwordResetService.handlePasswordChange(request, response);
            System.out.println("PasswordResetController: Password change request processed");
        } catch (Exception e) {
            System.err.println("PasswordResetController: Service error - " + e.getMessage());
            sendJsonError(response, "Failed to process password change request", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Send JSON error response
     */
    private void sendJsonError(HttpServletResponse response, String message, int statusCode) 
            throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String jsonError = "{\"success\": false, \"message\": \"" + 
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
    
    /**
     * Mask email address for logging (privacy protection)
     */
    private String maskEmail(String email) {
        if (email == null || email.length() < 3) {
            return "***";
        }
        
        int atIndex = email.indexOf('@');
        if (atIndex == -1) {
            return email.substring(0, 2) + "***";
        }
        
        String localPart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex);
        
        if (localPart.length() <= 2) {
            return localPart.charAt(0) + "***" + domainPart;
        } else {
            return localPart.substring(0, 2) + "***" + domainPart;
        }
    }
    
    /**
     * Check if request is AJAX
     */
    private boolean isAjaxRequest(HttpServletRequest request) {
        String xRequestedWith = request.getHeader("X-Requested-With");
        return "XMLHttpRequest".equals(xRequestedWith);
    }
    
    /**
     * Get client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    @Override
    public void destroy() {
        System.out.println("PasswordResetController: Controller being destroyed");
        passwordResetService = null;
        super.destroy();
    }
}
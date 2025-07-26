package com.pahanaedu.services;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

/**
 * Simple Password Reset Service using Singleton Pattern
 * Provides basic password reset functionality
 */
public class PasswordResetService {
    
    // Singleton instance
    private static PasswordResetService instance = null;
    
    private UserDAO userDAO;
    
    // Private constructor
    private PasswordResetService() {
        userDAO = UserDAO.getInstance();
    }
    
    /**
     * Get singleton instance
     */
    public static synchronized PasswordResetService getInstance() {
        if (instance == null) {
            instance = new PasswordResetService();
        }
        return instance;
    }
    
    /**
     * Handle password reset request
     */
    public void handlePasswordReset(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        
        PrintWriter out = null;
        
        try {
            out = response.getWriter();
            
            String email = request.getParameter("email");
            
            System.out.println("PasswordResetService: Processing reset request for: " + email);
            
            // Validation
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, out, "Email address is required");
                return;
            }
            
            if (!isValidEmail(email)) {
                sendErrorResponse(response, out, "Please enter a valid email address");
                return;
            }
            
            email = email.trim().toLowerCase();
            
            // Check if user exists
            User user = userDAO.getUserByEmail(email);
            if (user == null) {
                // For security, don't reveal if email exists or not
                sendSuccessResponse(response, out, 
                    "If this email exists in our system, a temporary password has been sent.");
                return;
            }
            
            // Reset password
            String tempPassword = userDAO.resetPassword(email);
            
            if (tempPassword != null) {
                System.out.println("PasswordResetService: Password reset successful for - " + email);
                System.out.println("PasswordResetService: Temporary password - " + tempPassword);
                
                // In a real application, you would send this via email
                // For now, we'll return it in the response (NOT RECOMMENDED for production)
                String message = String.format(
                    "Password reset successful! Your temporary password is: %s\\n\\n" +
                    "Please login with this password and change it immediately.", 
                    tempPassword
                );
                
                sendSuccessResponse(response, out, message);
                
            } else {
                System.err.println("PasswordResetService: Failed to reset password for - " + email);
                sendErrorResponse(response, out, "Failed to reset password. Please try again.");
            }
            
        } catch (Exception e) {
            System.err.println("PasswordResetService: Unexpected error - " + e.getMessage());
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, "Reset error occurred. Please try again.");
            }
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }
    
    /**
     * Handle password change request
     */
    public void handlePasswordChange(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = null;
        
        try {
            out = response.getWriter();
            
            String email = request.getParameter("email");
            String currentPassword = request.getParameter("currentPassword");
            String newPassword = request.getParameter("newPassword");
            String confirmPassword = request.getParameter("confirmPassword");
            
            System.out.println("PasswordResetService: Processing password change for: " + email);
            
            // Validation
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, out, "Email is required");
                return;
            }
            
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                sendErrorResponse(response, out, "Current password is required");
                return;
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                sendErrorResponse(response, out, "New password is required");
                return;
            }
            
            if (!newPassword.equals(confirmPassword)) {
                sendErrorResponse(response, out, "New passwords do not match");
                return;
            }
            
            if (newPassword.length() < 6) {
                sendErrorResponse(response, out, "New password must be at least 6 characters long");
                return;
            }
            
            // Verify current password
            User user = userDAO.validateLogin(email, currentPassword);
            if (user == null) {
                sendErrorResponse(response, out, "Current password is incorrect");
                return;
            }
            
            // Update password
            if (userDAO.updatePassword(email, newPassword)) {
                System.out.println("PasswordResetService: Password changed successfully for - " + email);
                sendSuccessResponse(response, out, "Password changed successfully!");
            } else {
                sendErrorResponse(response, out, "Failed to change password. Please try again.");
            }
            
        } catch (Exception e) {
            System.err.println("PasswordResetService: Error changing password - " + e.getMessage());
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, "Password change error. Please try again.");
            }
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }
    
    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }
    
    /**
     * Send success response
     */
    private void sendSuccessResponse(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_OK);
        
        String jsonResponse = String.format(
            "{\"success\": true, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
    }
    
    /**
     * Escape JSON string
     */
    private String escapeJsonString(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }
}
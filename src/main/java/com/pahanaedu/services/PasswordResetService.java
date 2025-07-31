package com.pahanaedu.services;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

/**
 * Password Reset Service using Singleton Pattern
 * Provides password reset functionality for customer accounts only
 * Integrates with existing UserDAO and follows the same patterns as other services
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
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
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
            
            // Only allow password reset for customer accounts
            if (!User.ROLE_CUSTOMER.equals(user.getRole())) {
                sendErrorResponse(response, out, 
                    "Password reset is only available for customer accounts. Please contact administrator for assistance.");
                return;
            }
            
            // Check if user account is active
            if (!user.isActive()) {
                sendErrorResponse(response, out, "Account is inactive. Please contact administrator.");
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
                    "Please login with this password and change it immediately for security.", 
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
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
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
            
            if (!isValidEmail(email)) {
                sendErrorResponse(response, out, "Please enter a valid email address");
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
            
            if (!isValidPassword(newPassword)) {
                sendErrorResponse(response, out, "New password must be at least 6 characters long");
                return;
            }
            
            email = email.trim().toLowerCase();
            
            // Verify current password and get user
            User user = userDAO.validateLogin(email, currentPassword);
            if (user == null) {
                sendErrorResponse(response, out, "Current password is incorrect");
                return;
            }
            
            // Only allow password change for customer accounts
            if (!User.ROLE_CUSTOMER.equals(user.getRole())) {
                sendErrorResponse(response, out, 
                    "Password change is only available for customer accounts. Please contact administrator for assistance.");
                return;
            }
            
            // Check if user account is active
            if (!user.isActive()) {
                sendErrorResponse(response, out, "Account is inactive. Please contact administrator.");
                return;
            }
            
            // Update password
            if (userDAO.updatePassword(email, newPassword)) {
                System.out.println("PasswordResetService: Password changed successfully for - " + email);
                sendSuccessResponse(response, out, "Password changed successfully! You can now login with your new password.");
            } else {
                System.err.println("PasswordResetService: Failed to change password for - " + email);
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
     * Validate password strength (same as SignupService)
     */
    private boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        
        return password.length() >= 6;
    }
    
    /**
     * Send success response (same pattern as other services)
     */
    private void sendSuccessResponse(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_OK);
        
        String jsonResponse = String.format(
            "{\"success\": true, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
        
        System.out.println("PasswordResetService: Success response sent");
    }
    
    /**
     * Send error response (same pattern as other services)
     */
    private void sendErrorResponse(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
        
        System.out.println("PasswordResetService: Error response sent - " + message);
    }
    
    /**
     * Escape JSON string (same as other services)
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
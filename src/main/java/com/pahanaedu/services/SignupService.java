package com.pahanaedu.services;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

/**
 * Signup Service using Singleton Pattern
 * Handles customer registration only
 */
public class SignupService {
    
    // Singleton instance
    private static SignupService instance = null;
    
    private UserDAO userDAO;
    
    // Private constructor
    private SignupService() {
        userDAO = UserDAO.getInstance();
    }
    
    /**
     * Get singleton instance
     */
    public static synchronized SignupService getInstance() {
        if (instance == null) {
            instance = new SignupService();
        }
        return instance;
    }
    
    /**
     * Handle signup request
     */
    public void handleSignup(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        PrintWriter out = null;
        
        try {
            out = response.getWriter();
            
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String phone = request.getParameter("phone");
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            String confirmPassword = request.getParameter("confirmPassword");
            
            System.out.println("SignupService: Processing signup request for: " + email);
            
            // Validation
            if (firstName == null || firstName.trim().isEmpty()) {
                sendErrorResponse(response, out, "First name is required");
                return;
            }
            
            if (lastName == null || lastName.trim().isEmpty()) {
                sendErrorResponse(response, out, "Last name is required");
                return;
            }
            
            if (phone == null || phone.trim().isEmpty()) {
                sendErrorResponse(response, out, "Phone number is required");
                return;
            }
            
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, out, "Email address is required");
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                sendErrorResponse(response, out, "Password is required");
                return;
            }
            
            if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
                sendErrorResponse(response, out, "Password confirmation is required");
                return;
            }
            
            // Phone validation
            String cleanPhone = phone.replaceAll("\\D", "");
            if (cleanPhone.length() != 10) {
                sendErrorResponse(response, out, "Please enter a valid 10-digit phone number");
                return;
            }
            
            // Email validation
            if (!isValidEmail(email)) {
                sendErrorResponse(response, out, "Please enter a valid email address");
                return;
            }
            
            // Password confirmation
            if (!password.equals(confirmPassword)) {
                sendErrorResponse(response, out, "Passwords do not match");
                return;
            }
            
            // Password strength
            if (!isValidPassword(password)) {
                sendErrorResponse(response, out, "Password must be at least 6 characters long");
                return;
            }
            
            // Check if email already exists
            if (userDAO.emailExists(email.trim().toLowerCase())) {
                sendErrorResponse(response, out, "Email address already exists");
                return;
            }
            
            // Create new customer user
            User newUser = new User(
                firstName.trim(),
                lastName.trim(),
                email.trim().toLowerCase(),
                password,
                cleanPhone
            );
            
            newUser.setRole(User.ROLE_CUSTOMER);
            newUser.setStatus(User.STATUS_ACTIVE);
            
            if (userDAO.createUser(newUser)) {
                System.out.println("SignupService: Customer registration successful - " + email);
                
                createUserSession(request, newUser);
                
                sendSuccessResponse(response, out, 
                    "Account created successfully! Welcome to Pahana Edu!", 
                    User.ROLE_CUSTOMER, "customer-dashboard.jsp");
                
            } else {
                System.err.println("SignupService: Database error during registration - " + email);
                sendErrorResponse(response, out, "Failed to create account. Please try again.");
            }
            
        } catch (Exception e) {
            System.err.println("SignupService: Unexpected error during signup - " + e.getMessage());
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, "Registration error occurred. Please try again.");
            }
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }
    
    /**
     * Create user session after successful registration
     */
    private void createUserSession(HttpServletRequest request, User user) {
        System.out.println("SignupService: Creating session for new user: " + user.getEmail());
        
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        
        HttpSession session = request.getSession(true);
        
        // Set user attributes
        session.setAttribute("user", user);
        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("userName", user.getFullName());
        session.setAttribute("userRole", user.getRole());
        session.setAttribute("userFirstName", user.getFirstName());
        session.setAttribute("userLastName", user.getLastName());
        session.setAttribute("userPhone", user.getPhone());
        session.setAttribute("userStatus", user.getStatus());
        session.setAttribute("isLoggedIn", true);
        session.setAttribute("loginTime", System.currentTimeMillis());
        
        // Set role flags
        session.setAttribute("isAdmin", false);
        session.setAttribute("isCustomer", true);
        
        // Set session timeout
        session.setMaxInactiveInterval(30 * 60); // 30 minutes
        session.setAttribute("rememberMe", false);
        
        System.out.println("SignupService: Session created successfully");
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
     * Validate password strength
     */
    private boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        
        return password.length() >= 6;
    }
    
    /**
     * Send success response
     */
    private void sendSuccessResponse(HttpServletResponse response, PrintWriter out, 
                                   String message, String role, String redirectUrl) {
        response.setStatus(HttpServletResponse.SC_OK);
        
        String jsonResponse = String.format(
            "{\"success\": true, \"message\": \"%s\", \"role\": \"%s\", \"redirectUrl\": \"%s\"}",
            escapeJsonString(message),
            escapeJsonString(role),
            escapeJsonString(redirectUrl)
        );
        
        out.print(jsonResponse);
        out.flush();
        
        System.out.println("SignupService: Success response sent");
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
        
        System.out.println("SignupService: Error response sent - " + message);
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
    
    /**
     * Determine redirect URL based on role
     */
    public String determineRedirectUrl(String role) {
        if (role == null) {
            return "index.jsp";
        }
        
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "admin-dashboard.jsp";
            case "CUSTOMER":
            default:
                return "customer-dashboard.jsp";
        }
    }
}
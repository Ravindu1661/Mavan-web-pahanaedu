package com.pahanaedu.services;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

/**
 * Login Service using Singleton Pattern
 * Handles authentication for Admin and Customer roles only
 */
public class LoginService {
    
    // Singleton instance
    private static LoginService instance = null;
    
    // Default admin credentials
    private static final String ADMIN_EMAIL = "admin@pahana.lk";
    private static final String ADMIN_PASSWORD = "admin123";
    
    private UserDAO userDAO;
    
    // Private constructor
    private LoginService() {
        userDAO = UserDAO.getInstance();
    }
    
    /**
     * Get singleton instance
     */
    public static synchronized LoginService getInstance() {
        if (instance == null) {
            instance = new LoginService();
        }
        return instance;
    }
    
    /**
     * Handle login request
     */
    public void handleLogin(HttpServletRequest request, HttpServletResponse response) 
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
            String password = request.getParameter("password");
            String rememberMe = request.getParameter("rememberMe");
            
            System.out.println("LoginService: Processing login request for: " + email);
            
            // Validation
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, out, "Email address is required");
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                sendErrorResponse(response, out, "Password is required");
                return;
            }
            
            email = email.trim().toLowerCase();
            
            // Check for default admin login
            if (ADMIN_EMAIL.equalsIgnoreCase(email) && ADMIN_PASSWORD.equals(password)) {
                handleDefaultAdminLogin(request, response, out, rememberMe);
                return;
            }
            
            // Authenticate regular user
            authenticateUser(email, password, request, response, out, rememberMe);
            
        } catch (Exception e) {
            System.err.println("LoginService: Unexpected error during login - " + e.getMessage());
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, "An unexpected error occurred. Please try again.");
            }
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }
    
    /**
     * Handle default admin login
     */
    private void handleDefaultAdminLogin(HttpServletRequest request, HttpServletResponse response, 
                                       PrintWriter out, String rememberMe) throws IOException {
        
        System.out.println("LoginService: Processing default admin login");
        
        User adminUser = new User();
        adminUser.setId(-1);
        adminUser.setFirstName("System");
        adminUser.setLastName("Administrator");
        adminUser.setEmail(ADMIN_EMAIL);
        adminUser.setPhone("0771234567");
        adminUser.setRole(User.ROLE_ADMIN);
        adminUser.setStatus(User.STATUS_ACTIVE);
        
        configureSession(request, adminUser, rememberMe);
        
        System.out.println("LoginService: Default admin login successful");
        
        sendSuccessResponse(response, out, "Admin login successful!", 
                           User.ROLE_ADMIN, "admin-dashboard.jsp");
    }
    
    /**
     * Authenticate regular user
     */
    private void authenticateUser(String email, String password, HttpServletRequest request, 
                                 HttpServletResponse response, PrintWriter out, String rememberMe) 
                                 throws IOException {
        
        System.out.println("LoginService: Authenticating user: " + email);
        
        try {
            User user = userDAO.validateLogin(email, password);
            
            if (user == null) {
                System.out.println("LoginService: Authentication failed for: " + email);
                sendErrorResponse(response, out, "Invalid email or password");
                return;
            }
            
            if (!user.isActive()) {
                System.out.println("LoginService: Account inactive for: " + email);
                sendErrorResponse(response, out, "Your account has been deactivated. Please contact support.");
                return;
            }
            
            configureSession(request, user, rememberMe);
            
            String redirectUrl = determineRedirectUrl(user.getRole());
            String successMessage = getSuccessMessage(user.getRole());
            
            System.out.println("LoginService: User authentication successful - " + email + 
                             " (Role: " + user.getRole() + ")");
            
            sendSuccessResponse(response, out, successMessage, user.getRole(), redirectUrl);
            
        } catch (Exception e) {
            System.err.println("LoginService: Error during authentication - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, out, "Authentication error. Please try again.");
        }
    }
    
    /**
     * Configure user session
     */
    private void configureSession(HttpServletRequest request, User user, String rememberMe) {
        System.out.println("LoginService: Configuring session for: " + user.getEmail());
        
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
        session.setAttribute("isAdmin", user.isAdmin());
        session.setAttribute("isCustomer", user.isCustomer());
        
        // Configure session timeout
        boolean rememberMeEnabled = "on".equals(rememberMe) || "true".equals(rememberMe);
        
        if (rememberMeEnabled) {
            session.setMaxInactiveInterval(7 * 24 * 60 * 60); // 7 days
            session.setAttribute("rememberMe", true);
        } else {
            session.setMaxInactiveInterval(30 * 60); // 30 minutes
            session.setAttribute("rememberMe", false);
        }
        
        System.out.println("LoginService: Session configured successfully");
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
    
    /**
     * Get success message based on role
     */
    private String getSuccessMessage(String role) {
        if (role == null) {
            return "Login successful!";
        }
        
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "Admin login successful! Redirecting to dashboard...";
            case "CUSTOMER":
            default:
                return "Login successful! Welcome back!";
        }
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
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
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
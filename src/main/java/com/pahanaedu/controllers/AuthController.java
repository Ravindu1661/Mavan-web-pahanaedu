package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.services.LoginService;
import com.pahanaedu.services.SignupService;
import com.pahanaedu.services.PasswordResetService;

/**
 * Authentication Controller using Singleton Pattern
 * Handles all authentication related requests:
 * - Login (/auth/login)
 * - Signup (/auth/signup) 
 * - Logout (/auth/logout)
 * - Password Reset (/auth/password-reset)
 * - Password Change (/auth/password-change)
 */
@WebServlet({
    "/auth/login", 
    "/auth/signup", 
    "/auth/logout", 
    "/auth/password-reset", 
    "/auth/password-change"
})
public class AuthController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private LoginService loginService;
    private SignupService signupService;
    private PasswordResetService passwordResetService;
    
    @Override
    public void init() throws ServletException {
        try {
            // Initialize singleton services
            loginService = LoginService.getInstance();
            signupService = SignupService.getInstance();
            passwordResetService = PasswordResetService.getInstance();
            
            System.out.println("AuthController: All services initialized successfully");
        } catch (Exception e) {
            System.err.println("AuthController: Failed to initialize services - " + e.getMessage());
            throw new ServletException("Failed to initialize authentication services", e);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String action = getActionFromURI(requestURI);
        
        System.out.println("AuthController: Processing POST request - " + action);
        
        try {
            switch (action) {
                case "login":
                    loginService.handleLogin(request, response);
                    break;
                    
                case "signup":
                    signupService.handleSignup(request, response);
                    break;
                    
                case "logout":
                    handleLogout(request, response);
                    break;
                    
                case "password-reset":
                    passwordResetService.handlePasswordReset(request, response);
                    break;
                    
                case "password-change":
                    passwordResetService.handlePasswordChange(request, response);
                    break;
                    
                default:
                    sendErrorResponse(response, "Invalid authentication action");
                    break;
            }
            
        } catch (Exception e) {
            System.err.println("AuthController: Error processing request - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Authentication service error. Please try again.");
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String action = getActionFromURI(requestURI);
        
        System.out.println("AuthController: Processing GET request - " + action);
        
        try {
            switch (action) {
                case "login":
                    handleLoginPageRequest(request, response);
                    break;
                    
                case "signup":
                    handleSignupPageRequest(request, response);
                    break;
                    
                case "logout":
                    handleLogout(request, response);
                    break;
                    
                case "password-reset":
                    handlePasswordResetPageRequest(request, response);
                    break;
                    
                case "password-change":
                    handlePasswordChangePageRequest(request, response);
                    break;
                    
                default:
                    response.sendError(HttpServletResponse.SC_NOT_FOUND, "Page not found");
                    break;
            }
            
        } catch (Exception e) {
            System.err.println("AuthController: Error handling GET request - " + e.getMessage());
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server error");
        }
    }
    
    /**
     * Handle login page request
     */
    private void handleLoginPageRequest(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        HttpSession session = request.getSession(false);
        
        // Check if user is already logged in
        if (session != null && Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            String userRole = (String) session.getAttribute("userRole");
            String redirectUrl = loginService.determineRedirectUrl(userRole);
            response.sendRedirect(request.getContextPath() + "/" + redirectUrl);
            return;
        }
        
        // Redirect to login page
        response.sendRedirect(request.getContextPath() + "/login.jsp");
    }
    
    /**
     * Handle signup page request
     */
    private void handleSignupPageRequest(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        HttpSession session = request.getSession(false);
        
        // Check if user is already logged in
        if (session != null && Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            String userRole = (String) session.getAttribute("userRole");
            String redirectUrl = signupService.determineRedirectUrl(userRole);
            response.sendRedirect(request.getContextPath() + "/" + redirectUrl);
            return;
        }
        
        // Redirect to signup page
        response.sendRedirect(request.getContextPath() + "/signup.jsp");
    }
    
    /**
     * Handle password reset page request
     */
    private void handlePasswordResetPageRequest(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/password-reset.jsp");
    }
    
    /**
     * Handle password change page request
     */
    private void handlePasswordChangePageRequest(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        HttpSession session = request.getSession(false);
        
        // Check if user is logged in for password change
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            response.sendRedirect(request.getContextPath() + "/auth/login");
            return;
        }
        
        response.sendRedirect(request.getContextPath() + "/password-change.jsp");
    }
    
    /**
     * Handle logout request
     */
    private void handleLogout(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        HttpSession session = request.getSession(false);
        
        if (session != null) {
            String userEmail = (String) session.getAttribute("userEmail");
            String userRole = (String) session.getAttribute("userRole");
            
            System.out.println("AuthController: User logging out - " + userEmail + " (Role: " + userRole + ")");
            
            // Invalidate session
            session.invalidate();
            
            System.out.println("AuthController: Session invalidated successfully");
        }
        
        // Clear cache headers
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        // Check if this is an AJAX request
        String requestedWith = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equals(requestedWith)) {
            // Return JSON response for AJAX requests
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            
            PrintWriter out = response.getWriter();
            out.print("{\"success\": true, \"message\": \"Logged out successfully\", \"redirectUrl\": \"index.jsp\"}");
            out.flush();
            out.close();
        } else {
            // Regular redirect for non-AJAX requests
            response.sendRedirect(request.getContextPath() + "/index.jsp");
        }
    }
    
    /**
     * Extract action from request URI
     */
    private String getActionFromURI(String requestURI) {
        if (requestURI == null) {
            return "";
        }
        
        // Extract the last part after /auth/
        String[] parts = requestURI.split("/");
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
        
        return "";
    }
    
    /**
     * Send error response for invalid requests
     */
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        
        PrintWriter out = response.getWriter();
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
        out.close();
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
    
    @Override
    public void destroy() {
        System.out.println("AuthController: Controller being destroyed");
        
        // Clean up references
        loginService = null;
        signupService = null;
        passwordResetService = null;
        
        super.destroy();
    }
}
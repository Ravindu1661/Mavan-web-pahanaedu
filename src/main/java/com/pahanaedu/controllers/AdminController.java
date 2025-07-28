package com.pahanaedu.controllers;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.pahanaedu.services.AdminService;

/**
 * Enhanced Admin Controller for Admin Panel Management
 * Handles all admin operations: users, products, categories, promo codes, orders
 * Supports file uploads for product images
 * Updated with STAFF role support
 */
@WebServlet({
    "/admin/dashboard",
    "/admin/users", 
    "/admin/categories",
    "/admin/products",
    "/admin/promo-codes",
    "/admin/orders"
})
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 1,    // 1 MB
    maxFileSize = 1024 * 1024 * 5,          // 5 MB
    maxRequestSize = 1024 * 1024 * 10       // 10 MB
)
public class AdminController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private AdminService adminService;
    
    // File upload settings
    private static final String UPLOAD_DIRECTORY = "uploads/products";
    private static final int MEMORY_THRESHOLD = 1024 * 1024 * 3; // 3MB
    private static final int MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
    private static final int MAX_REQUEST_SIZE = 1024 * 1024 * 10; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
    
    @Override
    public void init() throws ServletException {
        try {
            adminService = AdminService.getInstance();
            System.out.println("AdminController: Service initialized successfully with file upload support");
            
            // Initialize file upload directory
            String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIRECTORY;
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                boolean created = uploadDir.mkdirs();
                if (created) {
                    System.out.println("AdminController: Upload directory created at " + uploadPath);
                } else {
                    System.err.println("AdminController: Failed to create upload directory at " + uploadPath);
                }
            } else {
                System.out.println("AdminController: Upload directory exists at " + uploadPath);
            }
        } catch (Exception e) {
            System.err.println("AdminController: Failed to initialize service - " + e.getMessage());
            throw new ServletException("Failed to initialize admin service", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin or staff authentication
        if (!isAuthorizedUser(request)) {
            response.sendRedirect(request.getContextPath() + "/login-signup.jsp");
            return;
        }
        
        String requestURI = request.getRequestURI();
        String action = getActionFromURI(requestURI);
        
        System.out.println("AdminController: Processing GET request - " + action);
        
        try {
            switch (action) {
                case "dashboard":
                    handleDashboardPage(request, response);
                    break;
                case "users":
                    // Only admins can access user management
                    if (isAdminUser(request)) {
                        handleUsersPage(request, response);
                    } else {
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied. Admin privileges required.");
                    }
                    break;
                case "categories":
                    handleCategoriesPage(request, response);
                    break;
                case "products":
                    handleProductsPage(request, response);
                    break;
                case "promo-codes":
                    handlePromoCodesPage(request, response);
                    break;
                case "orders":
                    handleOrdersPage(request, response);
                    break;
                default:
                    response.sendError(HttpServletResponse.SC_NOT_FOUND, "Page not found");
                    break;
            }
        } catch (Exception e) {
            System.err.println("AdminController: Error handling GET request - " + e.getMessage());
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server error");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin or staff authentication
        if (!isAuthorizedUser(request)) {
            sendJsonError(response, "Unauthorized access", HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        String requestURI = request.getRequestURI();
        String action = getActionFromURI(requestURI);
        
        // Check if user management requires admin privileges
        if ("users".equals(action) && !isAdminUser(request)) {
            sendJsonError(response, "Access denied. Admin privileges required for user management.", HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        
        System.out.println("AdminController: Processing POST request - " + action);
        
        // Set response headers for AJAX requests
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        
        try {
            // Handle multipart requests for product management with file uploads
            if ("products".equals(action) && isMultipartRequest(request)) {
                handleProductWithFileUpload(request, response);
            } else {
                // Handle regular POST requests
                switch (action) {
                    case "dashboard":
                        adminService.handleDashboardStats(request, response);
                        break;
                    case "users":
                        // Double check admin privileges for user management
                        if (isAdminUser(request)) {
                            adminService.handleUserManagement(request, response);
                        } else {
                            sendJsonError(response, "Access denied. Admin privileges required for user management.", HttpServletResponse.SC_FORBIDDEN);
                        }
                        break;
                    case "categories":
                        adminService.handleCategoryManagement(request, response);
                        break;
                    case "products":
                        adminService.handleProductManagement(request, response);
                        break;
                    case "promo-codes":
                        adminService.handlePromoCodeManagement(request, response);
                        break;
                    case "orders":
                        adminService.handleOrderManagement(request, response);
                        break;
                    default:
                        sendJsonError(response, "Invalid endpoint", HttpServletResponse.SC_NOT_FOUND);
                        break;
                }
            }
        } catch (Exception e) {
            System.err.println("AdminController: Error processing POST request - " + e.getMessage());
            e.printStackTrace();
            sendJsonError(response, "Server error: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Check if request is multipart (contains file upload)
     */
    private boolean isMultipartRequest(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().contains("multipart/form-data");
    }
    
    /**
     * Handle product operations with file upload support
     */
    private void handleProductWithFileUpload(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        try {
            String actionParam = null;
            String imagePath = null;
            
            // Parse multipart form data
            for (Part part : request.getParts()) {
                String partName = part.getName();
                
                if ("action".equals(partName)) {
                    actionParam = getPartValue(part);
                } else if ("productImage".equals(partName) && part.getSize() > 0) {
                    // Handle file upload
                    imagePath = handleImageUpload(part, request);
                    if (imagePath != null) {
                        System.out.println("AdminController: Image uploaded successfully - " + imagePath);
                    }
                }
            }
            
            // Set imagePath as request attribute for the service to use
            if (imagePath != null) {
                request.setAttribute("uploadedImagePath", imagePath);
            }
            
            // Forward to admin service
            adminService.handleProductManagement(request, response);
            
        } catch (Exception e) {
            System.err.println("AdminController: Error handling product file upload - " + e.getMessage());
            e.printStackTrace();
            sendJsonError(response, "File upload error: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Handle image file upload
     */
    private String handleImageUpload(Part filePart, HttpServletRequest request) throws IOException {
        if (filePart == null || filePart.getSize() == 0) {
            return null;
        }
        
        // Validate file size
        if (filePart.getSize() > MAX_FILE_SIZE) {
            throw new IOException("File size exceeds maximum limit of 5MB");
        }
        
        // Get original filename
        String originalFileName = getFileName(filePart);
        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new IOException("Invalid file name");
        }
        
        // Validate file extension
        String extension = getFileExtension(originalFileName).toLowerCase();
        if (!isValidExtension(extension)) {
            throw new IOException("Invalid file type. Only JPG, PNG, GIF, and WEBP files are allowed");
        }
        
        // Generate unique filename
        String uniqueFileName = generateUniqueFileName(extension);
        
        // Create upload directory path
        String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIRECTORY;
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        // Save file
        String filePath = uploadPath + File.separator + uniqueFileName;
        try {
            Files.copy(filePart.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);
            System.out.println("AdminController: File saved to " + filePath);
        } catch (IOException e) {
            System.err.println("AdminController: Failed to save file - " + e.getMessage());
            throw new IOException("Failed to save uploaded file");
        }
        
        // Return relative path for database storage
        return UPLOAD_DIRECTORY + "/" + uniqueFileName;
    }
    
    /**
     * Delete uploaded image file
     */
    public boolean deleteImageFile(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return true;
        }
        
        try {
            String fullPath = getServletContext().getRealPath("") + File.separator + imagePath;
            File file = new File(fullPath);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (deleted) {
                    System.out.println("AdminController: Image file deleted - " + imagePath);
                } else {
                    System.err.println("AdminController: Failed to delete image file - " + imagePath);
                }
                return deleted;
            }
            return true; // File doesn't exist, consider it as successfully deleted
        } catch (Exception e) {
            System.err.println("AdminController: Error deleting image file - " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get filename from Part header
     */
    private String getFileName(Part part) {
        String contentDisposition = part.getHeader("content-disposition");
        if (contentDisposition != null) {
            for (String content : contentDisposition.split(";")) {
                if (content.trim().startsWith("filename")) {
                    String fileName = content.substring(content.indexOf('=') + 1).trim();
                    return fileName.replace("\"", "");
                }
            }
        }
        return null;
    }
    
    /**
     * Get file extension
     */
    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.lastIndexOf('.') != -1) {
            return fileName.substring(fileName.lastIndexOf('.'));
        }
        return "";
    }
    
    /**
     * Check if extension is valid
     */
    private boolean isValidExtension(String extension) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equals(extension)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Generate unique filename
     */
    private String generateUniqueFileName(String extension) {
        return "product_" + UUID.randomUUID().toString() + extension;
    }
    
    /**
     * Get value from multipart Part
     */
    private String getPartValue(Part part) throws IOException {
        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(part.getInputStream(), "UTF-8"))) {
            StringBuilder value = new StringBuilder();
            char[] buffer = new char[1024];
            int read;
            while ((read = reader.read(buffer, 0, buffer.length)) != -1) {
                value.append(buffer, 0, read);
            }
            return value.toString();
        }
    }
    
    /**
     * Check if user is authenticated as admin or staff (authorized users)
     */
    private boolean isAuthorizedUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            System.out.println("AdminController: No valid session found");
            return false;
        }
        
        String userRole = (String) session.getAttribute("userRole");
        boolean isAuthorized = "ADMIN".equals(userRole) || "STAFF".equals(userRole);
        
        if (!isAuthorized) {
            System.out.println("AdminController: User role is not ADMIN or STAFF: " + userRole);
        } else {
            System.out.println("AdminController: User authentication successful - Role: " + userRole);
        }
        
        return isAuthorized;
    }
    
    /**
     * Check if user is authenticated as admin only
     */
    private boolean isAdminUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return false;
        }
        
        String userRole = (String) session.getAttribute("userRole");
        return "ADMIN".equals(userRole);
    }
    
    /**
     * Check if user is authenticated as staff only
     */
    private boolean isStaffUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return false;
        }
        
        String userRole = (String) session.getAttribute("userRole");
        return "STAFF".equals(userRole);
    }
    
    /**
     * Get user role from session
     */
    private String getUserRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return (String) session.getAttribute("userRole");
        }
        return null;
    }
    
    /**
     * Handle dashboard page request
     */
    private void handleDashboardPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/admin-dashboard.jsp");
    }
    
    /**
     * Handle users management page request (Admin only)
     */
    private void handleUsersPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/admin-users.jsp");
    }
    
    /**
     * Handle categories management page request
     */
    private void handleCategoriesPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/admin-categories.jsp");
    }
    
    /**
     * Handle products management page request
     */
    private void handleProductsPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/admin-products.jsp");
    }
    
    /**
     * Handle promo codes management page request
     */
    private void handlePromoCodesPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/admin-promo-codes.jsp");
    }
    
    /**
     * Handle orders management page request
     */
    private void handleOrdersPage(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        response.sendRedirect(request.getContextPath() + "/admin-orders.jsp");
    }
    
    /**
     * Extract action from request URI
     */
    private String getActionFromURI(String requestURI) {
        if (requestURI == null) {
            return "";
        }
        
        // Extract the last part after /admin/
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
    
    /**
     * Get upload directory path
     */
    public String getUploadDirectory() {
        return UPLOAD_DIRECTORY;
    }
    
    /**
     * Get max file size
     */
    public int getMaxFileSize() {
        return MAX_FILE_SIZE;
    }
    
    @Override
    public void destroy() {
        System.out.println("AdminController: Controller being destroyed");
        adminService = null;
        super.destroy();
    }
}
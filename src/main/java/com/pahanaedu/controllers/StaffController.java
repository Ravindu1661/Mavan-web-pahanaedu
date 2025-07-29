package com.pahanaedu.controllers;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.services.StaffService;
import com.pahanaedu.utils.FileUploadHandler;

@WebServlet({
    "/staff/dashboard",
    "/staff/products", 
    "/staff/orders",
    "/staff/customers",
    "/staff/pos",
    "/staff/search-orders"
})
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 1,
    maxFileSize = 1024 * 1024 * 5,
    maxRequestSize = 1024 * 1024 * 10
)
public class StaffController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private StaffService staffService;
    
    @Override
    public void init() throws ServletException {
        staffService = StaffService.getInstance();
        System.out.println("StaffController: POS System initialized successfully");
        
        // Sync project files to deployment directory on startup
        String webAppPath = getServletContext().getRealPath("");
        FileUploadHandler.syncProjectFilesToDeployment(webAppPath);
        System.out.println("StaffController: Project files synced to deployment directory");
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        if (!isStaffAuthenticated(request)) {
            response.sendRedirect(request.getContextPath() + "/login-signup.jsp");
            return;
        }
        
        String action = getActionFromURI(request.getRequestURI());
        
        switch (action) {
            case "dashboard":
                response.sendRedirect(request.getContextPath() + "/staff-dashboard.jsp");
                break;
            case "products":
                response.sendRedirect(request.getContextPath() + "/staff-dashboard.jsp#products");
                break;
            case "orders":
                response.sendRedirect(request.getContextPath() + "/staff-dashboard.jsp#orders");
                break;
            case "customers":
                response.sendRedirect(request.getContextPath() + "/staff-dashboard.jsp#customers");
                break;
            case "pos":
                response.sendRedirect(request.getContextPath() + "/staff-dashboard.jsp#pos");
                break;
            case "search-orders":
                response.sendRedirect(request.getContextPath() + "/staff-dashboard.jsp#search-orders");
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        if (!isStaffAuthenticated(request)) {
            sendJsonError(response, "Unauthorized access", HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        String action = getActionFromURI(request.getRequestURI());
        
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        
        try {
            switch (action) {
                case "dashboard":
                    staffService.handleDashboardStats(request, response);
                    break;
                case "products":
                    if (isMultipartRequest(request)) {
                        staffService.handleProductWithFileUpload(request, response);
                    } else {
                        staffService.handleProductManagement(request, response);
                    }
                    break;
                case "orders":
                    staffService.handleOrderManagement(request, response);
                    break;
                case "customers":
                    staffService.handleCustomerManagement(request, response);
                    break;
                case "pos":
                    // POS requests can go through orders or products depending on action
                    String posAction = request.getParameter("action");
                    if (posAction != null && posAction.startsWith("product")) {
                        staffService.handleProductManagement(request, response);
                    } else if (posAction != null && posAction.startsWith("customer")) {
                        staffService.handleCustomerManagement(request, response);
                    } else {
                        staffService.handleOrderManagement(request, response);
                    }
                    break;
                case "search-orders":
                    staffService.handleOrderManagement(request, response);
                    break;
                default:
                    sendJsonError(response, "Invalid endpoint", HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("StaffController: Error - " + e.getMessage());
            e.printStackTrace();
            sendJsonError(response, "Server error: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    private boolean isStaffAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return false;
        }
        String userRole = (String) session.getAttribute("userRole");
        return "STAFF".equals(userRole) || "ADMIN".equals(userRole);
    }
    
    private boolean isMultipartRequest(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().contains("multipart/form-data");
    }
    
    private String getActionFromURI(String requestURI) {
        String[] parts = requestURI.split("/");
        return parts.length > 0 ? parts[parts.length - 1] : "";
    }
    
    private void sendJsonError(HttpServletResponse response, String message, int statusCode) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String jsonError = "{\"success\": false, \"error\": true, \"message\": \"" + 
                          escapeJsonString(message) + "\"}";
        response.getWriter().write(jsonError);
        response.getWriter().flush();
    }
    
    private String escapeJsonString(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
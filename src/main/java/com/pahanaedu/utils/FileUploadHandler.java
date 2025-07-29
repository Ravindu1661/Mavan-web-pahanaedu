package com.pahanaedu.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import javax.servlet.http.Part;

/**
 * Enhanced utility class for handling file uploads - Dual Storage System
 * Saves images to both project source (persistent) and server deployment (immediate access)
 */
public class FileUploadHandler {
    
    private static final String UPLOAD_DIR = "uploads/products/";
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    /**
     * Upload product image to both project source and deployment directories
     */
    public static String uploadProductImage(Part filePart, String webAppPath) throws IOException {
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
        
        // Get both upload paths
        String projectUploadPath = getProjectUploadPath();
        String deploymentUploadPath = getDeploymentUploadPath(webAppPath);
        
        // Create upload directories if they don't exist
        createDirectoryIfNotExists(projectUploadPath);
        createDirectoryIfNotExists(deploymentUploadPath);
        
        // Debug information
        System.out.println("=== DUAL STORAGE FILE UPLOAD DEBUG ===");
        System.out.println("Original filename: " + originalFileName);
        System.out.println("Generated filename: " + uniqueFileName);
        System.out.println("Project upload path: " + projectUploadPath);
        System.out.println("Deployment upload path: " + deploymentUploadPath);
        
        // Save file to project source directory first (persistent storage)
        Path projectFilePath = Paths.get(projectUploadPath + uniqueFileName);
        Files.copy(filePart.getInputStream(), projectFilePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Also save to deployment directory (immediate access)
        Path deploymentFilePath = Paths.get(deploymentUploadPath + uniqueFileName);
        Files.copy(Files.newInputStream(projectFilePath), deploymentFilePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Verify both files were saved
        File projectFile = new File(projectFilePath.toString());
        File deploymentFile = new File(deploymentFilePath.toString());
        
        System.out.println("Project file saved: " + projectFile.exists() + " (Size: " + projectFile.length() + " bytes)");
        System.out.println("Deployment file saved: " + deploymentFile.exists() + " (Size: " + deploymentFile.length() + " bytes)");
        System.out.println("Project file path: " + projectFilePath.toString());
        System.out.println("Deployment file path: " + deploymentFilePath.toString());
        
        // Return relative path for database storage
        return UPLOAD_DIR + uniqueFileName;
    }
    
    /**
     * Get project source upload path (persistent storage)
     */
    private static String getProjectUploadPath() {
        // Direct path to your project's webapp directory
        String projectPath = "C:" + File.separator + "Users" + File.separator + 
                           "Chama Computers" + File.separator + "eclipse-workspace" + 
                           File.separator + "assigment-pahanaedu" + File.separator + 
                           "src" + File.separator + "main" + File.separator + 
                           "webapp" + File.separator + UPLOAD_DIR.replace("/", File.separator);
        
        return projectPath;
    }
    
    /**
     * Get deployment upload path (immediate access)
     */
    private static String getDeploymentUploadPath(String webAppPath) {
        if (webAppPath != null && !webAppPath.isEmpty()) {
            return webAppPath + UPLOAD_DIR.replace("/", File.separator);
        } else {
            // Fallback to typical deployment path
            return "C:" + File.separator + "Users" + File.separator + 
                   "Chama Computers" + File.separator + "eclipse-workspace" + 
                   File.separator + ".metadata" + File.separator + ".plugins" + 
                   File.separator + "org.eclipse.wst.server.core" + File.separator + 
                   "tmp1" + File.separator + "wtpwebapps" + File.separator + 
                   "assigment-pahanaedu" + File.separator + UPLOAD_DIR.replace("/", File.separator);
        }
    }
    
    /**
     * Create directory if it doesn't exist
     */
    private static void createDirectoryIfNotExists(String directoryPath) {
        File directory = new File(directoryPath);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            System.out.println("Directory created: " + created + " at " + directoryPath);
        }
    }
    
    /**
     * Delete product image from both locations
     */
    public static boolean deleteProductImage(String imagePath, String webAppPath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return true;
        }
        
        try {
            String fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
            
            // Delete from project source
            String projectPath = getProjectUploadPath() + fileName;
            Path projectFilePath = Paths.get(projectPath);
            boolean projectDeleted = Files.deleteIfExists(projectFilePath);
            
            // Delete from deployment
            String deploymentPath = getDeploymentUploadPath(webAppPath) + fileName;
            Path deploymentFilePath = Paths.get(deploymentPath);
            boolean deploymentDeleted = Files.deleteIfExists(deploymentFilePath);
            
            System.out.println("Project file deleted: " + projectDeleted + " from " + projectPath);
            System.out.println("Deployment file deleted: " + deploymentDeleted + " from " + deploymentPath);
            
            return projectDeleted || deploymentDeleted;
            
        } catch (IOException e) {
            System.err.println("Error deleting image: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Sync project files to deployment directory
     * Call this during server startup to ensure all images are available
     */
    public static void syncProjectFilesToDeployment(String webAppPath) {
        try {
            String projectUploadPath = getProjectUploadPath();
            String deploymentUploadPath = getDeploymentUploadPath(webAppPath);
            
            File projectDir = new File(projectUploadPath);
            if (!projectDir.exists()) {
                System.out.println("Project upload directory doesn't exist: " + projectUploadPath);
                return;
            }
            
            createDirectoryIfNotExists(deploymentUploadPath);
            
            File[] projectFiles = projectDir.listFiles();
            if (projectFiles != null) {
                int syncedCount = 0;
                for (File projectFile : projectFiles) {
                    if (projectFile.isFile()) {
                        Path deploymentFilePath = Paths.get(deploymentUploadPath + projectFile.getName());
                        Files.copy(projectFile.toPath(), deploymentFilePath, StandardCopyOption.REPLACE_EXISTING);
                        syncedCount++;
                    }
                }
                System.out.println("Synced " + syncedCount + " files from project to deployment directory");
            }
            
        } catch (IOException e) {
            System.err.println("Error syncing files: " + e.getMessage());
        }
    }
    
    /**
     * Get filename from Part
     */
    private static String getFileName(Part part) {
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
    private static String getFileExtension(String fileName) {
        if (fileName != null && fileName.lastIndexOf('.') != -1) {
            return fileName.substring(fileName.lastIndexOf('.'));
        }
        return "";
    }
    
    /**
     * Check if extension is valid
     */
    private static boolean isValidExtension(String extension) {
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
    private static String generateUniqueFileName(String extension) {
        return "product_" + UUID.randomUUID().toString() + extension;
    }
    
    /**
     * Validate image file
     */
    public static void validateImageFile(Part filePart) throws IOException {
        if (filePart == null) {
            return; // Optional file
        }
        
        if (filePart.getSize() > MAX_FILE_SIZE) {
            throw new IOException("File size exceeds maximum limit of 5MB");
        }
        
        String fileName = getFileName(filePart);
        if (fileName != null && !fileName.isEmpty()) {
            String extension = getFileExtension(fileName).toLowerCase();
            if (!isValidExtension(extension)) {
                throw new IOException("Invalid file type. Only JPG, PNG, GIF, and WEBP files are allowed");
            }
        }
    }
    
    /**
     * Get upload directory
     */
    public static String getUploadDirectory() {
        return UPLOAD_DIR;
    }
    
    /**
     * Get max file size
     */
    public static long getMaxFileSize() {
        return MAX_FILE_SIZE;
    }
    
    /**
     * Get allowed extensions
     */
    public static String[] getAllowedExtensions() {
        return ALLOWED_EXTENSIONS.clone();
    }
}
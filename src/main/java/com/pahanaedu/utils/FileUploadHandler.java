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
 * Utility class for handling file uploads
 */
public class FileUploadHandler {
    
    private static final String UPLOAD_DIR = "uploads/products/";
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    /**
     * Upload product image
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
        
        // Create upload directory if it doesn't exist
        String uploadPath = webAppPath + UPLOAD_DIR;
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        // Save file
        Path filePath = Paths.get(uploadPath + uniqueFileName);
        Files.copy(filePart.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative path for database storage
        return UPLOAD_DIR + uniqueFileName;
    }
    
    /**
     * Delete product image
     */
    public static boolean deleteProductImage(String imagePath, String webAppPath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return true;
        }
        
        try {
            Path filePath = Paths.get(webAppPath + imagePath);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Error deleting image: " + e.getMessage());
            return false;
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
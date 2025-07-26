package com.pahanaedu.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.pahanaedu.models.Category;
import com.pahanaedu.utils.DatabaseConnection;

public class CategoryDAO {
    private static CategoryDAO instance = null;
    
    private static final String INSERT_CATEGORY = 
        "INSERT INTO categories (name, description, status) VALUES (?, ?, ?)";
    private static final String SELECT_ALL_CATEGORIES = 
        "SELECT * FROM categories ORDER BY name ASC";
    private static final String SELECT_CATEGORY_BY_ID = 
        "SELECT * FROM categories WHERE id = ?";
    private static final String UPDATE_CATEGORY = 
        "UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?";
    private static final String DELETE_CATEGORY = 
        "DELETE FROM categories WHERE id = ?";
    private static final String SELECT_ACTIVE_CATEGORIES = 
        "SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC";
    
    private CategoryDAO() {}
    
    public static synchronized CategoryDAO getInstance() {
        if (instance == null) {
            instance = new CategoryDAO();
        }
        return instance;
    }
    
    public boolean createCategory(Category category) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_CATEGORY)) {
            
            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.setString(3, category.getStatus());
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error creating category: " + e.getMessage());
            return false;
        }
    }
    
    public List<Category> getAllCategories() {
        List<Category> categories = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_CATEGORIES)) {
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                categories.add(extractCategoryFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all categories: " + e.getMessage());
        }
        return categories;
    }
    
    public List<Category> getActiveCategories() {
        List<Category> categories = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ACTIVE_CATEGORIES)) {
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                categories.add(extractCategoryFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting active categories: " + e.getMessage());
        }
        return categories;
    }
    
    public Category getCategoryById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_CATEGORY_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();
            
            if (rs.next()) {
                return extractCategoryFromResultSet(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error getting category by ID: " + e.getMessage());
        }
        return null;
    }
    
    public boolean updateCategory(Category category) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_CATEGORY)) {
            
            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.setString(3, category.getStatus());
            statement.setInt(4, category.getId());
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating category: " + e.getMessage());
            return false;
        }
    }
    
    public boolean deleteCategory(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_CATEGORY)) {
            
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting category: " + e.getMessage());
            return false;
        }
    }
    
    private Category extractCategoryFromResultSet(ResultSet rs) throws SQLException {
        Category category = new Category();
        category.setId(rs.getInt("id"));
        category.setName(rs.getString("name"));
        category.setDescription(rs.getString("description"));
        category.setStatus(rs.getString("status"));
        category.setCreatedAt(rs.getTimestamp("created_at"));
        category.setUpdatedAt(rs.getTimestamp("updated_at"));
        return category;
    }
}
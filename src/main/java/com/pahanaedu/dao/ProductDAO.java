package com.pahanaedu.dao;

import java.sql.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.pahanaedu.models.Product;
import com.pahanaedu.utils.DatabaseConnection;

public class ProductDAO {
    private static ProductDAO instance = null;
    
    private static final String INSERT_PRODUCT = 
        "INSERT INTO products (title, author, isbn, category_id, description, price, offer_price, stock_quantity, image_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    private static final String SELECT_ALL_PRODUCTS = 
        "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC";
    private static final String SELECT_PRODUCT_BY_ID = 
        "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?";
    private static final String UPDATE_PRODUCT = 
        "UPDATE products SET title = ?, author = ?, isbn = ?, category_id = ?, description = ?, price = ?, offer_price = ?, stock_quantity = ?, image_path = ?, status = ? WHERE id = ?";
    private static final String DELETE_PRODUCT = 
        "DELETE FROM products WHERE id = ?";
    private static final String SEARCH_PRODUCTS = 
        "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.title LIKE ? OR p.author LIKE ? ORDER BY p.title ASC";
    private static final String SELECT_ACTIVE_PRODUCTS = 
        "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 'active' ORDER BY p.title ASC";
    
    private ProductDAO() {}
    
    public static synchronized ProductDAO getInstance() {
        if (instance == null) {
            instance = new ProductDAO();
        }
        return instance;
    }
    
    public boolean createProduct(Product product) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_PRODUCT)) {
            
            statement.setString(1, product.getTitle());
            statement.setString(2, product.getAuthor());
            statement.setString(3, product.getIsbn());
            statement.setInt(4, product.getCategoryId());
            statement.setString(5, product.getDescription());
            statement.setBigDecimal(6, product.getPrice());
            statement.setBigDecimal(7, product.getOfferPrice());
            statement.setInt(8, product.getStockQuantity());
            statement.setString(9, product.getImagePath());
            statement.setString(10, product.getStatus());
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error creating product: " + e.getMessage());
            return false;
        }
    }
    
    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_PRODUCTS)) {
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                products.add(extractProductFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all products: " + e.getMessage());
        }
        return products;
    }
    
    public List<Product> getActiveProducts() {
        List<Product> products = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ACTIVE_PRODUCTS)) {
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                products.add(extractProductFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting active products: " + e.getMessage());
        }
        return products;
    }
    
    public Product getProductById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_PRODUCT_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();
            
            if (rs.next()) {
                return extractProductFromResultSet(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error getting product by ID: " + e.getMessage());
        }
        return null;
    }
    
    public List<Product> searchProducts(String keyword) {
        List<Product> products = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SEARCH_PRODUCTS)) {
            
            String searchTerm = "%" + keyword + "%";
            statement.setString(1, searchTerm);
            statement.setString(2, searchTerm);
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                products.add(extractProductFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error searching products: " + e.getMessage());
        }
        return products;
    }
    
    public boolean updateProduct(Product product) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_PRODUCT)) {
            
            statement.setString(1, product.getTitle());
            statement.setString(2, product.getAuthor());
            statement.setString(3, product.getIsbn());
            statement.setInt(4, product.getCategoryId());
            statement.setString(5, product.getDescription());
            statement.setBigDecimal(6, product.getPrice());
            statement.setBigDecimal(7, product.getOfferPrice());
            statement.setInt(8, product.getStockQuantity());
            statement.setString(9, product.getImagePath());
            statement.setString(10, product.getStatus());
            statement.setInt(11, product.getId());
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating product: " + e.getMessage());
            return false;
        }
    }
    
    public boolean deleteProduct(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_PRODUCT)) {
            
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting product: " + e.getMessage());
            return false;
        }
    }
    
    private Product extractProductFromResultSet(ResultSet rs) throws SQLException {
        Product product = new Product();
        product.setId(rs.getInt("id"));
        product.setTitle(rs.getString("title"));
        product.setAuthor(rs.getString("author"));
        product.setIsbn(rs.getString("isbn"));
        product.setCategoryId(rs.getInt("category_id"));
        product.setCategoryName(rs.getString("category_name"));
        product.setDescription(rs.getString("description"));
        product.setPrice(rs.getBigDecimal("price"));
        product.setOfferPrice(rs.getBigDecimal("offer_price"));
        product.setStockQuantity(rs.getInt("stock_quantity"));
        product.setImagePath(rs.getString("image_path"));
        product.setStatus(rs.getString("status"));
        product.setCreatedAt(rs.getTimestamp("created_at"));
        product.setUpdatedAt(rs.getTimestamp("updated_at"));
        return product;
    }
}
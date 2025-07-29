package com.pahanaedu.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.mindrot.jbcrypt.BCrypt;

import com.pahanaedu.models.User;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * Data Access Object for User operations using Singleton Pattern
 * Handles all database operations related to users
 * Supports ADMIN, CUSTOMER, and STAFF roles
 */
public class UserDAO {
    
    // Singleton instance
    private static UserDAO instance = null;
    
    // SQL Queries
    private static final String INSERT_USER = 
        "INSERT INTO users (first_name, last_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    private static final String SELECT_USER_BY_EMAIL = 
        "SELECT * FROM users WHERE email = ?";
    
    private static final String SELECT_USER_BY_ID = 
        "SELECT * FROM users WHERE id = ?";
    
    private static final String SELECT_ALL_USERS = 
        "SELECT * FROM users ORDER BY created_at DESC";
    
    private static final String SELECT_USERS_BY_ROLE = 
        "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC";
    
    private static final String SELECT_ACTIVE_USERS_BY_ROLE = 
        "SELECT * FROM users WHERE role = ? AND status = 'active' ORDER BY created_at DESC";
    
    private static final String UPDATE_USER = 
        "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, status = ? WHERE id = ?";
    
    private static final String UPDATE_PASSWORD = 
        "UPDATE users SET password = ? WHERE email = ?";
    
    private static final String DELETE_USER = 
        "DELETE FROM users WHERE id = ?";
    
    private static final String COUNT_USERS_BY_ROLE = 
        "SELECT COUNT(*) FROM users WHERE role = ?";
    
    private static final String CHECK_EMAIL_EXISTS = 
        "SELECT COUNT(*) FROM users WHERE email = ?";
    
    // Private constructor
    private UserDAO() {}
    
    /**
     * Get singleton instance
     * @return UserDAO instance
     */
    public static synchronized UserDAO getInstance() {
        if (instance == null) {
            instance = new UserDAO();
        }
        return instance;
    }
    
    /**
     * Create new user
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createUser(User user) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_USER)) {
            
            // Set default status if not provided
            if (user.getStatus() == null || user.getStatus().trim().isEmpty()) {
                user.setStatus(User.STATUS_ACTIVE);
            }
            
            // Hash password
            String hashedPassword = hashPassword(user.getPassword());
            
            // Set parameters
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getPhone());
            statement.setString(6, user.getRole()); // Use role from user object
            statement.setString(7, user.getStatus());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: User created successfully - " + user.getEmail() + " with role: " + user.getRole());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error creating user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Create admin user
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createAdminUser(User user) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_USER)) {
            
            String hashedPassword = hashPassword(user.getPassword());
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getPhone());
            statement.setString(6, user.getRole());
            statement.setString(7, user.getStatus() != null ? user.getStatus() : User.STATUS_ACTIVE);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: Admin user created - " + user.getEmail());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error creating admin user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Create staff user
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createStaffUser(User user) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_USER)) {
            
            String hashedPassword = hashPassword(user.getPassword());
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getPhone());
            statement.setString(6, user.getRole());
            statement.setString(7, user.getStatus() != null ? user.getStatus() : User.STATUS_ACTIVE);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: Staff user created - " + user.getEmail());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error creating staff user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Create user with specified role (Admin, Customer, or Staff)
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createUserWithRole(User user) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_USER)) {
            
            String hashedPassword = hashPassword(user.getPassword());
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getPhone());
            statement.setString(6, user.getRole());
            statement.setString(7, user.getStatus() != null ? user.getStatus() : User.STATUS_ACTIVE);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: User created with role " + user.getRole() + " - " + user.getEmail());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error creating user with role - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Validate user login credentials
     * @param email User email
     * @param password Plain text password
     * @return User object if valid, null otherwise
     */
    public User validateLogin(String email, String password) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USER_BY_EMAIL)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                String storedPassword = resultSet.getString("password");
                
                if (verifyPassword(password, storedPassword)) {
                    User user = extractUserFromResultSet(resultSet);
                    System.out.println("UserDAO: Login successful - " + email + " (Role: " + user.getRole() + ")");
                    return user;
                } else {
                    System.out.println("UserDAO: Password verification failed - " + email);
                }
            } else {
                System.out.println("UserDAO: User not found - " + email);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error validating login - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get user by ID
     */
    public User getUserById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USER_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractUserFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting user by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USER_BY_EMAIL)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractUserFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting user by email - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_USERS)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                users.add(extractUserFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting all users - " + e.getMessage());
            e.printStackTrace();
        }
        
        return users;
    }
    
    /**
     * Get users by role
     */
    public List<User> getUsersByRole(String role) {
        List<User> users = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USERS_BY_ROLE)) {
            
            statement.setString(1, role);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                users.add(extractUserFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting users by role - " + e.getMessage());
            e.printStackTrace();
        }
        
        return users;
    }
    
    /**
     * Get active users by role (for POS system)
     */
    public List<User> getActiveUsersByRole(String role) {
        List<User> users = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ACTIVE_USERS_BY_ROLE)) {
            
            statement.setString(1, role);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                users.add(extractUserFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting active users by role - " + e.getMessage());
            e.printStackTrace();
        }
        
        return users;
    }
    
    /**
     * Get all customers
     */
    public List<User> getAllCustomers() {
        return getUsersByRole(User.ROLE_CUSTOMER);
    }
    
    /**
     * Get active customers (for POS system)
     */
    public List<User> getActiveCustomers() {
        return getActiveUsersByRole(User.ROLE_CUSTOMER);
    }
    
    /**
     * Get all staff members
     */
    public List<User> getAllStaff() {
        return getUsersByRole(User.ROLE_STAFF);
    }
    
    /**
     * Get all admin users
     */
    public List<User> getAllAdmins() {
        return getUsersByRole(User.ROLE_ADMIN);
    }
    
    /**
     * Update user information
     */
    public boolean updateUser(User user) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_USER)) {
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, user.getPhone());
            statement.setString(5, user.getStatus());
            statement.setInt(6, user.getId());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: User updated successfully - " + user.getEmail());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error updating user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Update user password
     */
    public boolean updatePassword(String email, String newPassword) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_PASSWORD)) {
            
            String hashedPassword = hashPassword(newPassword);
            statement.setString(1, hashedPassword);
            statement.setString(2, email);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: Password updated successfully - " + email);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error updating password - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Simple password reset - generates temporary password
     */
    public String resetPassword(String email) {
        String tempPassword = generateTempPassword();
        
        if (updatePassword(email, tempPassword)) {
            System.out.println("UserDAO: Password reset successful for - " + email);
            return tempPassword;
        }
        
        return null;
    }
    
    /**
     * Delete user by ID
     */
    public boolean deleteUser(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_USER)) {
            
            statement.setInt(1, id);
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: User deleted successfully - ID: " + id);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error deleting user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(CHECK_EMAIL_EXISTS)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error checking email existence - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get count of users by role
     */
    public int getUserCountByRole(String role) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_USERS_BY_ROLE)) {
            
            statement.setString(1, role);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting user count by role - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Get customer count
     */
    public int getCustomerCount() {
        return getUserCountByRole(User.ROLE_CUSTOMER);
    }
    
    /**
     * Get staff count
     */
    public int getStaffCount() {
        return getUserCountByRole(User.ROLE_STAFF);
    }
    
    /**
     * Get admin count
     */
    public int getAdminCount() {
        return getUserCountByRole(User.ROLE_ADMIN);
    }
    
    /**
     * Extract User object from ResultSet
     */
    private User extractUserFromResultSet(ResultSet resultSet) throws SQLException {
        User user = new User();
        user.setId(resultSet.getInt("id"));
        user.setFirstName(resultSet.getString("first_name"));
        user.setLastName(resultSet.getString("last_name"));
        user.setEmail(resultSet.getString("email"));
        user.setPassword(resultSet.getString("password"));
        user.setPhone(resultSet.getString("phone"));
        user.setRole(resultSet.getString("role"));
        user.setStatus(resultSet.getString("status"));
        user.setCreatedAt(resultSet.getTimestamp("created_at"));
        user.setUpdatedAt(resultSet.getTimestamp("updated_at"));
        return user;
    }
    
    /**
     * Hash password using BCrypt
     */
    private String hashPassword(String plainTextPassword) {
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt(12));
    }
    
    /**
     * Verify password against stored hash
     */
    private boolean verifyPassword(String plainTextPassword, String hashedPassword) {
        try {
            return BCrypt.checkpw(plainTextPassword, hashedPassword);
        } catch (Exception e) {
            System.err.println("UserDAO: Error verifying password - " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Generate temporary password for reset
     */
    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder temp = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            temp.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return temp.toString();
    }
}
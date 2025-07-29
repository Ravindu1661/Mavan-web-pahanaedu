package com.pahanaedu.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.pahanaedu.models.Order;
import com.pahanaedu.models.OrderItem;
import com.pahanaedu.utils.DatabaseConnection;

public class OrderDAO {
    private static OrderDAO instance = null;
    
    private static final String SELECT_ALL_ORDERS = 
        "SELECT o.*, u.first_name, u.last_name, p.code as promo_code FROM orders o " +
        "LEFT JOIN users u ON o.user_id = u.id " +
        "LEFT JOIN promo_codes p ON o.promo_code_id = p.id " +
        "ORDER BY o.created_at DESC";
    
    private static final String SELECT_ORDER_BY_ID = 
        "SELECT o.*, u.first_name, u.last_name, p.code as promo_code FROM orders o " +
        "LEFT JOIN users u ON o.user_id = u.id " +
        "LEFT JOIN promo_codes p ON o.promo_code_id = p.id " +
        "WHERE o.id = ?";
    
    private static final String SELECT_ORDER_BY_NUMBER = 
        "SELECT o.*, u.first_name, u.last_name, p.code as promo_code FROM orders o " +
        "LEFT JOIN users u ON o.user_id = u.id " +
        "LEFT JOIN promo_codes p ON o.promo_code_id = p.id " +
        "WHERE o.order_number = ?";
    
    private static final String INSERT_ORDER = 
        "INSERT INTO orders (user_id, order_number, total_amount, discount_amount, final_amount, promo_code_id, status, customer_name, customer_email, customer_phone, shipping_address) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    private static final String INSERT_ORDER_ITEM = 
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)";
    
    private static final String UPDATE_ORDER_STATUS = 
        "UPDATE orders SET status = ? WHERE id = ?";
    
    private static final String SELECT_ORDER_ITEMS = 
        "SELECT oi.*, pr.title, pr.author FROM order_items oi " +
        "LEFT JOIN products pr ON oi.product_id = pr.id " +
        "WHERE oi.order_id = ?";
    
    private static final String SEARCH_ORDERS = 
        "SELECT o.*, u.first_name, u.last_name, p.code as promo_code FROM orders o " +
        "LEFT JOIN users u ON o.user_id = u.id " +
        "LEFT JOIN promo_codes p ON o.promo_code_id = p.id " +
        "WHERE o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? " +
        "ORDER BY o.created_at DESC";
    
    private OrderDAO() {}
    
    public static synchronized OrderDAO getInstance() {
        if (instance == null) {
            instance = new OrderDAO();
        }
        return instance;
    }
    
    /**
     * Create a new order with items (for POS system)
     */
    public boolean createOrderWithItems(Order order) {
        Connection connection = null;
        try {
            connection = DatabaseConnection.getConnection();
            connection.setAutoCommit(false);
            
            // Insert order
            PreparedStatement orderStmt = connection.prepareStatement(INSERT_ORDER, Statement.RETURN_GENERATED_KEYS);
            orderStmt.setInt(1, order.getUserId());
            orderStmt.setString(2, order.getOrderNumber());
            orderStmt.setBigDecimal(3, order.getTotalAmount());
            orderStmt.setBigDecimal(4, order.getDiscountAmount());
            orderStmt.setBigDecimal(5, order.getFinalAmount());
            orderStmt.setObject(6, order.getPromoCodeId());
            orderStmt.setString(7, order.getStatus());
            orderStmt.setString(8, order.getCustomerName());
            orderStmt.setString(9, order.getCustomerEmail());
            orderStmt.setString(10, order.getCustomerPhone());
            orderStmt.setString(11, order.getShippingAddress());
            
            int rowsAffected = orderStmt.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet generatedKeys = orderStmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int orderId = generatedKeys.getInt(1);
                    order.setId(orderId);
                    
                    // Insert order items
                    if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                        PreparedStatement itemStmt = connection.prepareStatement(INSERT_ORDER_ITEM);
                        
                        for (OrderItem item : order.getOrderItems()) {
                            itemStmt.setInt(1, orderId);
                            itemStmt.setInt(2, item.getProductId());
                            itemStmt.setInt(3, item.getQuantity());
                            itemStmt.setBigDecimal(4, item.getUnitPrice());
                            itemStmt.setBigDecimal(5, item.getTotalPrice());
                            itemStmt.addBatch();
                        }
                        
                        itemStmt.executeBatch();
                        itemStmt.close();
                    }
                    
                    connection.commit();
                    orderStmt.close();
                    return true;
                }
            }
            
            connection.rollback();
            orderStmt.close();
            return false;
            
        } catch (SQLException e) {
            System.err.println("Error creating order with items: " + e.getMessage());
            e.printStackTrace();
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException ex) {
                    System.err.println("Error rolling back transaction: " + ex.getMessage());
                }
            }
            return false;
        } finally {
            if (connection != null) {
                try {
                    connection.setAutoCommit(true);
                    connection.close();
                } catch (SQLException e) {
                    System.err.println("Error closing connection: " + e.getMessage());
                }
            }
        }
    }
    
    /**
     * Create a simple order (existing method)
     */
    public boolean createOrder(Order order) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_ORDER)) {
            
            statement.setInt(1, order.getUserId());
            statement.setString(2, order.getOrderNumber());
            statement.setBigDecimal(3, order.getTotalAmount());
            statement.setBigDecimal(4, order.getDiscountAmount());
            statement.setBigDecimal(5, order.getFinalAmount());
            statement.setObject(6, order.getPromoCodeId());
            statement.setString(7, order.getStatus());
            statement.setString(8, order.getCustomerName());
            statement.setString(9, order.getCustomerEmail());
            statement.setString(10, order.getCustomerPhone());
            statement.setString(11, order.getShippingAddress());
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error creating order: " + e.getMessage());
            return false;
        }
    }
    
    public List<Order> getAllOrders() {
        List<Order> orders = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_ORDERS)) {
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                orders.add(extractOrderFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all orders: " + e.getMessage());
        }
        return orders;
    }
    
    public Order getOrderById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDER_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();
            
            if (rs.next()) {
                Order order = extractOrderFromResultSet(rs);
                order.setOrderItems(getOrderItems(id));
                return order;
            }
        } catch (SQLException e) {
            System.err.println("Error getting order by ID: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Get order by order number (for POS system)
     */
    public Order getOrderByNumber(String orderNumber) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDER_BY_NUMBER)) {
            
            statement.setString(1, orderNumber);
            ResultSet rs = statement.executeQuery();
            
            if (rs.next()) {
                Order order = extractOrderFromResultSet(rs);
                order.setOrderItems(getOrderItems(order.getId()));
                return order;
            }
        } catch (SQLException e) {
            System.err.println("Error getting order by number: " + e.getMessage());
        }
        return null;
    }
    
    public List<OrderItem> getOrderItems(int orderId) {
        List<OrderItem> items = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDER_ITEMS)) {
            
            statement.setInt(1, orderId);
            ResultSet rs = statement.executeQuery();
            
            while (rs.next()) {
                OrderItem item = new OrderItem();
                item.setId(rs.getInt("id"));
                item.setOrderId(rs.getInt("order_id"));
                item.setProductId(rs.getInt("product_id"));
                item.setQuantity(rs.getInt("quantity"));
                item.setUnitPrice(rs.getBigDecimal("unit_price"));
                item.setTotalPrice(rs.getBigDecimal("total_price"));
                item.setProductTitle(rs.getString("title"));
                item.setProductAuthor(rs.getString("author"));
                item.setCreatedAt(rs.getTimestamp("created_at"));
                items.add(item);
            }
        } catch (SQLException e) {
            System.err.println("Error getting order items: " + e.getMessage());
        }
        return items;
    }
    
    public List<Order> searchOrders(String keyword) {
        List<Order> orders = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SEARCH_ORDERS)) {
            
            String searchTerm = "%" + keyword + "%";
            statement.setString(1, searchTerm);
            statement.setString(2, searchTerm);
            statement.setString(3, searchTerm);
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                orders.add(extractOrderFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error searching orders: " + e.getMessage());
        }
        return orders;
    }
    
    public boolean updateOrderStatus(int orderId, String status) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_ORDER_STATUS)) {
            
            statement.setString(1, status);
            statement.setInt(2, orderId);
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating order status: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get orders by user ID
     */
    public List<Order> getOrdersByUserId(int userId) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT o.*, u.first_name, u.last_name, p.code as promo_code FROM orders o " +
                    "LEFT JOIN users u ON o.user_id = u.id " +
                    "LEFT JOIN promo_codes p ON o.promo_code_id = p.id " +
                    "WHERE o.user_id = ? ORDER BY o.created_at DESC";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            
            statement.setInt(1, userId);
            ResultSet rs = statement.executeQuery();
            
            while (rs.next()) {
                orders.add(extractOrderFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting orders by user ID: " + e.getMessage());
        }
        return orders;
    }
    
    /**
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(String status) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT o.*, u.first_name, u.last_name, p.code as promo_code FROM orders o " +
                    "LEFT JOIN users u ON o.user_id = u.id " +
                    "LEFT JOIN promo_codes p ON o.promo_code_id = p.id " +
                    "WHERE o.status = ? ORDER BY o.created_at DESC";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            
            statement.setString(1, status);
            ResultSet rs = statement.executeQuery();
            
            while (rs.next()) {
                orders.add(extractOrderFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting orders by status: " + e.getMessage());
        }
        return orders;
    }
    
    /**
     * Get today's orders (for dashboard stats)
     */
    public List<Order> getTodaysOrders() {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT o.*, u.first_name, u.last_name, p.code as promo_code FROM orders o " +
                    "LEFT JOIN users u ON o.user_id = u.id " +
                    "LEFT JOIN promo_codes p ON o.promo_code_id = p.id " +
                    "WHERE DATE(o.created_at) = CURDATE() ORDER BY o.created_at DESC";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                orders.add(extractOrderFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting today's orders: " + e.getMessage());
        }
        return orders;
    }
    
    /**
     * Get order count by status
     */
    public int getOrderCountByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM orders WHERE status = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            
            statement.setString(1, status);
            ResultSet rs = statement.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Error getting order count by status: " + e.getMessage());
        }
        return 0;
    }
    
    /**
     * Delete order (and its items)
     */
    public boolean deleteOrder(int orderId) {
        Connection connection = null;
        try {
            connection = DatabaseConnection.getConnection();
            connection.setAutoCommit(false);
            
            // Delete order items first
            String deleteItemsSQL = "DELETE FROM order_items WHERE order_id = ?";
            PreparedStatement itemStmt = connection.prepareStatement(deleteItemsSQL);
            itemStmt.setInt(1, orderId);
            itemStmt.executeUpdate();
            itemStmt.close();
            
            // Delete order
            String deleteOrderSQL = "DELETE FROM orders WHERE id = ?";
            PreparedStatement orderStmt = connection.prepareStatement(deleteOrderSQL);
            orderStmt.setInt(1, orderId);
            int rowsAffected = orderStmt.executeUpdate();
            orderStmt.close();
            
            connection.commit();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error deleting order: " + e.getMessage());
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException ex) {
                    System.err.println("Error rolling back transaction: " + ex.getMessage());
                }
            }
            return false;
        } finally {
            if (connection != null) {
                try {
                    connection.setAutoCommit(true);
                    connection.close();
                } catch (SQLException e) {
                    System.err.println("Error closing connection: " + e.getMessage());
                }
            }
        }
    }
    
    private Order extractOrderFromResultSet(ResultSet rs) throws SQLException {
        Order order = new Order();
        order.setId(rs.getInt("id"));
        order.setUserId(rs.getInt("user_id"));
        order.setOrderNumber(rs.getString("order_number"));
        order.setTotalAmount(rs.getBigDecimal("total_amount"));
        order.setDiscountAmount(rs.getBigDecimal("discount_amount"));
        order.setFinalAmount(rs.getBigDecimal("final_amount"));
        order.setPromoCodeId((Integer) rs.getObject("promo_code_id"));
        order.setStatus(rs.getString("status"));
        order.setCustomerName(rs.getString("customer_name"));
        order.setCustomerEmail(rs.getString("customer_email"));
        order.setCustomerPhone(rs.getString("customer_phone"));
        order.setShippingAddress(rs.getString("shipping_address"));
        order.setCreatedAt(rs.getTimestamp("created_at"));
        order.setUpdatedAt(rs.getTimestamp("updated_at"));
        
        // Set display names
        String firstName = rs.getString("first_name");
        String lastName = rs.getString("last_name");
        if (firstName != null && lastName != null) {
            order.setUserName(firstName + " " + lastName);
        }
        order.setPromoCode(rs.getString("promo_code"));
        
        return order;
    }
}
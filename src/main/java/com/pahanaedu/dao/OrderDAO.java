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
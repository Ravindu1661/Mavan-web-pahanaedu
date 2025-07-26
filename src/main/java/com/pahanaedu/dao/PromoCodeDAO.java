package com.pahanaedu.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.pahanaedu.models.PromoCode;
import com.pahanaedu.utils.DatabaseConnection;

public class PromoCodeDAO {
    private static PromoCodeDAO instance = null;
    
    private static final String INSERT_PROMO = 
        "INSERT INTO promo_codes (code, description, discount_type, discount_value, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    private static final String SELECT_ALL_PROMOS = 
        "SELECT * FROM promo_codes ORDER BY created_at DESC";
    private static final String SELECT_PROMO_BY_ID = 
        "SELECT * FROM promo_codes WHERE id = ?";
    private static final String SELECT_PROMO_BY_CODE = 
        "SELECT * FROM promo_codes WHERE code = ?";
    private static final String UPDATE_PROMO = 
        "UPDATE promo_codes SET code = ?, description = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?";
    private static final String DELETE_PROMO = 
        "DELETE FROM promo_codes WHERE id = ?";
    private static final String UPDATE_USED_COUNT = 
        "UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?";
    
    private PromoCodeDAO() {}
    
    public static synchronized PromoCodeDAO getInstance() {
        if (instance == null) {
            instance = new PromoCodeDAO();
        }
        return instance;
    }
    
    public boolean createPromoCode(PromoCode promoCode) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_PROMO)) {
            
            statement.setString(1, promoCode.getCode());
            statement.setString(2, promoCode.getDescription());
            statement.setString(3, promoCode.getDiscountType());
            statement.setBigDecimal(4, promoCode.getDiscountValue());
            statement.setDate(5, promoCode.getStartDate());
            statement.setDate(6, promoCode.getEndDate());
            statement.setString(7, promoCode.getStatus());
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error creating promo code: " + e.getMessage());
            return false;
        }
    }
    
    public List<PromoCode> getAllPromoCodes() {
        List<PromoCode> promoCodes = new ArrayList<>();
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_PROMOS)) {
            
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                promoCodes.add(extractPromoCodeFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all promo codes: " + e.getMessage());
        }
        return promoCodes;
    }
    
    public PromoCode getPromoCodeById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_PROMO_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();
            
            if (rs.next()) {
                return extractPromoCodeFromResultSet(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error getting promo code by ID: " + e.getMessage());
        }
        return null;
    }
    
    public PromoCode getPromoCodeByCode(String code) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_PROMO_BY_CODE)) {
            
            statement.setString(1, code);
            ResultSet rs = statement.executeQuery();
            
            if (rs.next()) {
                return extractPromoCodeFromResultSet(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error getting promo code by code: " + e.getMessage());
        }
        return null;
    }
    
    public boolean updatePromoCode(PromoCode promoCode) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_PROMO)) {
            
            statement.setString(1, promoCode.getCode());
            statement.setString(2, promoCode.getDescription());
            statement.setString(3, promoCode.getDiscountType());
            statement.setBigDecimal(4, promoCode.getDiscountValue());
            statement.setDate(5, promoCode.getStartDate());
            statement.setDate(6, promoCode.getEndDate());
            statement.setString(7, promoCode.getStatus());
            statement.setInt(8, promoCode.getId());
            
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating promo code: " + e.getMessage());
            return false;
        }
    }
    
    public boolean deletePromoCode(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_PROMO)) {
            
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting promo code: " + e.getMessage());
            return false;
        }
    }
    
    public boolean incrementUsedCount(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_USED_COUNT)) {
            
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating used count: " + e.getMessage());
            return false;
        }
    }
    
    private PromoCode extractPromoCodeFromResultSet(ResultSet rs) throws SQLException {
        PromoCode promoCode = new PromoCode();
        promoCode.setId(rs.getInt("id"));
        promoCode.setCode(rs.getString("code"));
        promoCode.setDescription(rs.getString("description"));
        promoCode.setDiscountType(rs.getString("discount_type"));
        promoCode.setDiscountValue(rs.getBigDecimal("discount_value"));
        promoCode.setUsedCount(rs.getInt("used_count"));
        promoCode.setStartDate(rs.getDate("start_date"));
        promoCode.setEndDate(rs.getDate("end_date"));
        promoCode.setStatus(rs.getString("status"));
        promoCode.setCreatedAt(rs.getTimestamp("created_at"));
        promoCode.setUpdatedAt(rs.getTimestamp("updated_at"));
        return promoCode;
    }
}
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - Pahana Edu</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="assets/css/index.css" rel="stylesheet">
    <link href="assets/css/customer-profile.css" rel="stylesheet">
</head>
<body>
    <!-- Include Navigation Bar -->
    <jsp:include page="includes/customer-navbar.jsp" />

    <!-- Main Content -->
    <main class="profile-main">
        <div class="profile-container">
            <!-- Page Header -->
            <div class="page-header">
                <div class="breadcrumb">
                    <a href="customer/dashboard"><i class="fas fa-home"></i> Dashboard</a>
                    <span class="separator">/</span>
                    <span class="current">Profile</span>
                </div>
                
                <div class="page-title">
                    <h1><i class="fas fa-user-circle"></i> My Profile</h1>
                    <p>Manage your account information and settings</p>
                </div>
            </div>

            <!-- Profile Content -->
            <div class="profile-content">
                <!-- Profile Sidebar -->
                <div class="profile-sidebar">
                    <div class="profile-card">
                        <div class="profile-avatar">
                            <div class="avatar-circle">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                        
                        <div class="profile-info" id="profileSidebarInfo">
                            <h3 class="profile-name">Loading...</h3>
                            <p class="profile-email">Loading...</p>
                            <span class="profile-status active">
                                <i class="fas fa-circle"></i> Active Account
                            </span>
                        </div>
                        
                        <div class="profile-stats">
                            <div class="stat-item">
                                <span class="stat-value" id="totalOrdersCount">0</span>
                                <span class="stat-label">Total Orders</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="totalSpentAmount">Rs. 0</span>
                                <span class="stat-label">Total Spent</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <h4>Quick Actions</h4>
                        <a href="customer/orders" class="action-link">
                            <i class="fas fa-shopping-bag"></i>
                            <span>View Orders</span>
                        </a>
                        <a href="customer/cart" class="action-link">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Shopping Cart</span>
                        </a>
                        <a href="customer/dashboard" class="action-link">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Dashboard</span>
                        </a>
                    </div>
                </div>

                <!-- Profile Main -->
                <div class="profile-main-content">
                    <!-- Tab Navigation -->
                    <div class="tab-navigation">
                        <button class="tab-btn active" data-tab="personal" onclick="switchTab('personal')">
                            <i class="fas fa-user"></i>
                            Personal Information
                        </button>
                        <button class="tab-btn" data-tab="security" onclick="switchTab('security')">
                            <i class="fas fa-shield-alt"></i>
                            Security
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div class="tab-content">
                        <!-- Personal Information Tab -->
                        <div class="tab-panel active" id="personalTab">
                            <div class="panel-header">
                                <h3><i class="fas fa-user"></i> Personal Information</h3>
                                <p>Update your personal details and contact information</p>
                            </div>
                            
                            <form class="profile-form" id="profileForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="firstName">
                                            <i class="fas fa-user"></i>
                                            First Name *
                                        </label>
                                        <input type="text" id="firstName" name="firstName" required>
                                        <span class="error-message" id="firstNameError"></span>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="lastName">
                                            <i class="fas fa-user"></i>
                                            Last Name *
                                        </label>
                                        <input type="text" id="lastName" name="lastName" required>
                                        <span class="error-message" id="lastNameError"></span>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="email">
                                            <i class="fas fa-envelope"></i>
                                            Email Address *
                                        </label>
                                        <input type="email" id="email" name="email" readonly>
                                        <span class="help-text">Email cannot be changed for security reasons</span>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="phone">
                                            <i class="fas fa-phone"></i>
                                            Phone Number
                                        </label>
                                        <input type="tel" id="phone" name="phone" placeholder="+94 XX XXX XXXX">
                                        <span class="error-message" id="phoneError"></span>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary" onclick="resetPersonalForm()">
                                        <i class="fas fa-undo"></i>
                                        Reset
                                    </button>
                                    <button type="submit" class="btn-primary">
                                        <i class="fas fa-save"></i>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Security Tab -->
                        <div class="tab-panel" id="securityTab">
                            <div class="panel-header">
                                <h3><i class="fas fa-shield-alt"></i> Security Settings</h3>
                                <p>Manage your password and account security</p>
                            </div>
                            
                            <!-- Password Change Form -->
                            <div class="security-section">
                                <h4><i class="fas fa-key"></i> Change Password</h4>
                                <p class="section-description">Keep your account secure with a strong password</p>
                                
                                <form class="security-form" id="passwordForm">
                                    <div class="form-group">
                                        <label for="currentPassword">
                                            <i class="fas fa-lock"></i>
                                            Current Password *
                                        </label>
                                        <div class="password-input">
                                            <input type="password" id="currentPassword" name="currentPassword" required>
                                            <button type="button" class="password-toggle" onclick="togglePassword('currentPassword')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <span class="error-message" id="currentPasswordError"></span>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="newPassword">
                                            <i class="fas fa-lock"></i>
                                            New Password *
                                        </label>
                                        <div class="password-input">
                                            <input type="password" id="newPassword" name="newPassword" required>
                                            <button type="button" class="password-toggle" onclick="togglePassword('newPassword')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="password-strength" id="passwordStrength"></div>
                                        <span class="error-message" id="newPasswordError"></span>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="confirmPassword">
                                            <i class="fas fa-lock"></i>
                                            Confirm New Password *
                                        </label>
                                        <div class="password-input">
                                            <input type="password" id="confirmPassword" name="confirmPassword" required>
                                            <button type="button" class="password-toggle" onclick="togglePassword('confirmPassword')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <span class="error-message" id="confirmPasswordError"></span>
                                    </div>
                                    
                                    <div class="form-actions">
                                        <button type="button" class="btn-secondary" onclick="resetPasswordForm()">
                                            <i class="fas fa-times"></i>
                                            Cancel
                                        </button>
                                        <button type="submit" class="btn-primary">
                                            <i class="fas fa-key"></i>
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Account Security Info -->
                            <div class="security-section">
                                <h4><i class="fas fa-info-circle"></i> Account Security</h4>
                                <div class="security-info">
                                    <div class="security-item">
                                        <div class="security-icon">
                                            <i class="fas fa-check-circle"></i>
                                        </div>
                                        <div class="security-details">
                                            <h5>Email Verified</h5>
                                            <p>Your email address has been verified</p>
                                        </div>
                                    </div>
                                    
                                    <div class="security-item">
                                        <div class="security-icon">
                                            <i class="fas fa-clock"></i>
                                        </div>
                                        <div class="security-details">
                                            <h5>Last Login</h5>
                                            <p id="lastLoginTime">Loading...</p>
                                        </div>
                                    </div>
                                    
                                    <div class="security-item">
                                        <div class="security-icon">
                                            <i class="fas fa-calendar-alt"></i>
                                        </div>
                                        <div class="security-details">
                                            <h5>Account Created</h5>
                                            <p id="accountCreatedDate">Loading...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Processing...</p>
        </div>
    </div>

    <!-- Include Footer -->
    <jsp:include page="includes/footer.jsp" />

    <!-- Custom JavaScript -->
    <script src="assets/js/customer-profile.js"></script>
</body>
</html>
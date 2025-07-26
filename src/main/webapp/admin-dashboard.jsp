<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Check admin authentication
    if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn")) || 
        !"ADMIN".equals(session.getAttribute("userRole"))) {
        response.sendRedirect("login-signup.jsp");
        return;
    }
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Pahana Edu</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- SweetAlert2 -->
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    
    <style>
        .sidebar {
            height: 100vh;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            position: fixed;
            width: 260px;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .sidebar .nav-link {
            color: #ecf0f1;
            padding: 15px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        }
        
        .sidebar .nav-link:hover {
            background: rgba(255,255,255,0.1);
            color: #fff;
            transform: translateX(5px);
        }
        
        .sidebar .nav-link.active {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: #fff;
            border-left: 4px solid #e74c3c;
        }
        
        .sidebar .nav-link i {
            width: 20px;
            margin-right: 10px;
        }
        
        .content {
            margin-left: 260px;
            padding: 20px;
            min-height: 100vh;
            background: #f8f9fa;
        }
        
        .stats-card {
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            color: white;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .stats-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        
        .stats-card.users { background: linear-gradient(135deg, #3498db, #2980b9); }
        .stats-card.products { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .stats-card.orders { background: linear-gradient(135deg, #f39c12, #e67e22); }
        .stats-card.categories { background: linear-gradient(135deg, #27ae60, #229954); }
        .stats-card.pending { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
        .stats-card.promo { background: linear-gradient(135deg, #1abc9c, #16a085); }
        
        .stats-card h3 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .section {
            display: none;
        }
        
        .section.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .search-box {
            max-width: 400px;
            margin-bottom: 20px;
        }
        
        .btn-action {
            margin: 2px;
            padding: 5px 10px;
        }
        
        .table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .table thead th {
            background: #34495e;
            color: white;
            border: none;
            font-weight: 600;
        }
        
        .table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
        }
        
        .card-header {
            background: linear-gradient(135deg, #34495e, #2c3e50);
            color: white;
            border: none;
            border-radius: 15px 15px 0 0 !important;
        }
        
        .modal-content {
            border-radius: 15px;
            border: none;
        }
        
        .modal-header {
            background: linear-gradient(135deg, #34495e, #2c3e50);
            color: white;
            border: none;
            border-radius: 15px 15px 0 0;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3498db, #2980b9);
            border: none;
        }
        
        .btn-success {
            background: linear-gradient(135deg, #27ae60, #229954);
            border: none;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #f39c12, #e67e22);
            border: none;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border: none;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
        }
        
        .spinner-border {
            color: #3498db;
        }
        
        .badge {
            font-size: 0.8em;
            padding: 5px 10px;
        }
        
        .header-section {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .quick-action-card {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .quick-action-card:hover {
            transform: translateY(-3px);
        }
        
        .quick-action-card i {
            font-size: 2rem;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <nav class="sidebar">
        <div class="p-3 text-center">
            <h4 class="text-white mb-1">
                <i class="fas fa-book-open"></i>
                Pahana Edu
            </h4>
            <small class="text-muted">Admin Panel</small>
        </div>
        
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link active" href="#" onclick="showSection('dashboard')" id="nav-dashboard">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('users')" id="nav-users">
                    <i class="fas fa-users"></i> Manage Users
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('categories')" id="nav-categories">
                    <i class="fas fa-tags"></i> Categories
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('products')" id="nav-products">
                    <i class="fas fa-book"></i> Products/Books
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('promo-codes')" id="nav-promo-codes">
                    <i class="fas fa-percent"></i> Promo Codes
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('orders')" id="nav-orders">
                    <i class="fas fa-shopping-cart"></i> Orders
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="auth/logout">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </li>
        </ul>
    </nav>

    <!-- Main Content -->
    <div class="content">
        <!-- Header Section -->
        <div class="header-section">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h2 id="sectionTitle" class="mb-1">Dashboard</h2>
                    <p class="text-muted mb-0">Welcome to Admin Panel</p>
                </div>
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <small class="text-muted">Welcome, </small>
                        <strong class="text-primary">${sessionScope.userName}</strong>
                    </div>
                    <img src="https://via.placeholder.com/40" class="rounded-circle" alt="Admin">
                </div>
            </div>
        </div>

        <!-- Dashboard Section -->
        <div id="dashboard" class="section active">
            <div class="row">
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="stats-card users">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="totalUsers">-</h3>
                                <p class="mb-0">Total Users</p>
                            </div>
                            <i class="fas fa-users fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="stats-card products">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="totalProducts">-</h3>
                                <p class="mb-0">Products</p>
                            </div>
                            <i class="fas fa-book fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="stats-card orders">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="totalOrders">-</h3>
                                <p class="mb-0">Total Orders</p>
                            </div>
                            <i class="fas fa-shopping-cart fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="stats-card categories">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="totalCategories">-</h3>
                                <p class="mb-0">Categories</p>
                            </div>
                            <i class="fas fa-tags fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="stats-card pending">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="pendingOrders">-</h3>
                                <p class="mb-0">Pending</p>
                            </div>
                            <i class="fas fa-clock fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="stats-card promo">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="totalPromoCodes">-</h3>
                                <p class="mb-0">Promo Codes</p>
                            </div>
                            <i class="fas fa-percent fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-bolt"></i> Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <div class="quick-action-card" onclick="showSection('products')">
                                        <i class="fas fa-plus text-primary"></i>
                                        <h6>Add Product</h6>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="quick-action-card" onclick="showSection('categories')">
                                        <i class="fas fa-tags text-success"></i>
                                        <h6>Add Category</h6>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="quick-action-card" onclick="showSection('promo-codes')">
                                        <i class="fas fa-percent text-warning"></i>
                                        <h6>Add Promo</h6>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="quick-action-card" onclick="showSection('orders')">
                                        <i class="fas fa-eye text-info"></i>
                                        <h6>View Orders</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-chart-line"></i> System Status</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Active Customers:</span>
                                <strong id="totalCustomers">-</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Active Products:</span>
                                <strong id="activeProducts">-</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Today's Orders:</span>
                                <strong id="todayOrders">-</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Revenue This Month:</span>
                                <strong id="monthlyRevenue">Rs. -</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Section -->
        <div id="users" class="section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4><i class="fas fa-users"></i> User Management</h4>
                <button class="btn btn-primary" onclick="showUserModal()">
                    <i class="fas fa-plus"></i> Add User
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="search-box">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                    <input type="text" class="form-control" placeholder="Search users..." id="userSearch">
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 text-end">
                            <button class="btn btn-outline-success" onclick="exportUsers()">
                                <i class="fas fa-download"></i> Export
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody">
                                <tr>
                                    <td colspan="8" class="text-center">
                                        <div class="loading">
                                            <div class="spinner-border" role="status"></div>
                                            <p class="mt-2">Loading users...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Categories Section -->
        <div id="categories" class="section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4><i class="fas fa-tags"></i> Category Management</h4>
                <button class="btn btn-primary" onclick="showCategoryModal()">
                    <i class="fas fa-plus"></i> Add Category
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Products</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="categoriesTableBody">
                                <tr>
                                    <td colspan="7" class="text-center">
                                        <div class="loading">
                                            <div class="spinner-border" role="status"></div>
                                            <p class="mt-2">Loading categories...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Products Section -->
        <div id="products" class="section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4><i class="fas fa-book"></i> Product Management</h4>
                <button class="btn btn-primary" onclick="showProductModal()">
                    <i class="fas fa-plus"></i> Add Product
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="search-box">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                    <input type="text" class="form-control" placeholder="Search products..." id="productSearch">
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 text-end">
                            <select class="form-select d-inline-block w-auto me-2" id="categoryFilter">
                                <option value="">All Categories</option>
                            </select>
                            <button class="btn btn-outline-success" onclick="exportProducts()">
                                <i class="fas fa-download"></i> Export
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="productsTableBody">
                                <tr>
                                    <td colspan="9" class="text-center">
                                        <div class="loading">
                                            <div class="spinner-border" role="status"></div>
                                            <p class="mt-2">Loading products...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Promo Codes Section -->
        <div id="promo-codes" class="section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4><i class="fas fa-percent"></i> Promo Code Management</h4>
                <button class="btn btn-primary" onclick="showPromoModal()">
                    <i class="fas fa-plus"></i> Add Promo Code
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Code</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Used Count</th>
                                    <th>Valid Period</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="promoCodesTableBody">
                                <tr>
                                    <td colspan="9" class="text-center">
                                        <div class="loading">
                                            <div class="spinner-border" role="status"></div>
                                            <p class="mt-2">Loading promo codes...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Orders Section -->
        <div id="orders" class="section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4><i class="fas fa-shopping-cart"></i> Order Management</h4>
                <div>
                    <select class="form-select d-inline-block w-auto me-2" id="orderStatusFilter">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="search-box">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                    <input type="text" class="form-control" placeholder="Search orders..." id="orderSearch">
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 text-end">
                            <button class="btn btn-outline-success" onclick="exportOrders()">
                                <i class="fas fa-download"></i> Export
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="ordersTableBody">
                                <tr>
                                    <td colspan="8" class="text-center">
                                        <div class="loading">
                                            <div class="spinner-border" role="status"></div>
                                            <p class="mt-2">Loading orders...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals will be added here via JavaScript -->
    <div id="modalContainer"></div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Admin Dashboard JS -->
    <script src="assets/js/admin-dashboard.js"></script>
</body>
</html>
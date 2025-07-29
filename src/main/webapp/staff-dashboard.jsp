<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Check staff authentication
    if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn")) || 
        (!("STAFF".equals(session.getAttribute("userRole"))) && 
         !("ADMIN".equals(session.getAttribute("userRole"))))) {
        response.sendRedirect("login-signup.jsp");
        return;
    }
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Dashboard - Pahana Edu POS</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- SweetAlert2 -->
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    
    <style>
        .sidebar {
            height: 100vh;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            position: fixed;
            width: 260px;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .sidebar .nav-link {
            color: #fff;
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
            background: linear-gradient(135deg, #17a2b8, #138496);
            color: #fff;
            border-left: 4px solid #ffc107;
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
        
        .stats-card.products { background: linear-gradient(135deg, #28a745, #20c997); }
        .stats-card.orders { background: linear-gradient(135deg, #17a2b8, #138496); }
        .stats-card.customers { background: linear-gradient(135deg, #6f42c1, #563d7c); }
        .stats-card.revenue { background: linear-gradient(135deg, #fd7e14, #e85d04); }
        
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
        
        .header-section {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .table thead th {
            background: #28a745;
            color: white;
            border: none;
            font-weight: 600;
            padding: 12px;
        }
        
        .table tbody tr {
            transition: background-color 0.2s ease;
        }
        
        .table tbody tr:hover {
            background-color: #f1f9f1;
        }
        
        .btn-action {
            margin: 2px;
            padding: 5px 10px;
        }
        
        /* POS Specific Styles */
        .pos-container {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 20px;
            height: calc(100vh - 140px);
        }
        
        .pos-products {
            background: white;
            border-radius: 10px;
            padding: 20px;
            overflow-y: auto;
        }
        
        .pos-cart {
            background: white;
            border-radius: 10px;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }
        
        .product-grid {
            margin-top: 15px;
        }
        
        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .cart-summary {
            margin-top: auto;
            padding-top: 20px;
            border-top: 2px solid #28a745;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .quantity-controls button {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 1px solid #ddd;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .quantity-controls button:hover {
            background: #f1f9f1;
            border-color: #28a745;
        }
        
        .search-section {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .table img {
            width: 50px;
            height: 60px;
            object-fit: cover;
            border-radius: 5px;
        }
        
        .table .no-image {
            width: 50px;
            height: 60px;
            background: #f8f9fa;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Additional styles for POS table */
        .pos-products .table tbody tr {
            cursor: pointer;
        }
        
        .pos-products .table .btn-sm {
            padding: 4px 8px;
        }
        
        .badge {
            padding: 6px 10px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <nav class="sidebar">
        <div class="p-3 text-center">
            <h4 class="text-white mb-1">
                <i class="fas fa-cash-register"></i>
                POS System
            </h4>
            <small class="text-light">Pahana Edu</small>
        </div>
        
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link active" href="#" onclick="showSection('dashboard')" id="nav-dashboard">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('pos')" id="nav-pos">
                    <i class="fas fa-cash-register"></i> POS Terminal
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('products')" id="nav-products">
                    <i class="fas fa-book"></i> Products
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showSection('customers')" id="nav-customers">
                    <i class="fas fa-users"></i> Customers
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
                    <h2 id="sectionTitle" class="mb-1">Staff Dashboard</h2>
                    <p class="text-muted mb-0">Point of Sale System & Management</p>
                </div>
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <small class="text-muted">Welcome, </small>
                        <strong class="text-success">${sessionScope.userName}</strong>
                    </div>
                    <img src="https://via.placeholder.com/40" class="rounded-circle" alt="Staff">
                </div>
            </div>
        </div>

        <!-- Dashboard Section -->
        <div id="dashboard" class="section active">
            <div class="row">
                <div class="col-lg-3 col-md-6">
                    <div class="stats-card products">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="totalProducts">-</h3>
                                <p class="mb-0">Total Products</p>
                            </div>
                            <i class="fas fa-book fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
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
                
                <div class="col-lg-3 col-md-6">
                    <div class="stats-card customers">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="totalCustomers">-</h3>
                                <p class="mb-0">Customers</p>
                            </div>
                            <i class="fas fa-users fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                    <div class="stats-card revenue">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="todayRevenue">Rs. 0</h3>
                                <p class="mb-0">Today's Revenue</p>
                            </div>
                            <i class="fas fa-money-bill-wave fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5><i class="fas fa-bolt"></i> Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <div class="text-center p-3 border rounded" onclick="showSection('pos')" style="cursor: pointer;">
                                        <i class="fas fa-cash-register fa-2x text-success mb-2"></i>
                                        <h6>Create Sale</h6>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="text-center p-3 border rounded" onclick="showSection('products')" style="cursor: pointer;">
                                        <i class="fas fa-plus fa-2x text-info mb-2"></i>
                                        <h6>Add Product</h6>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="text-center p-3 border rounded" onclick="showSection('customers')" style="cursor: pointer;">
                                        <i class="fas fa-user-plus fa-2x text-warning mb-2"></i>
                                        <h6>Add Customer</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5><i class="fas fa-chart-line"></i> Today's Summary</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Active Products:</span>
                                <strong id="activeProducts">-</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Today's Orders:</span>
                                <strong id="todayOrders">-</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Pending Orders:</span>
                                <strong class="text-warning" id="pendingOrders">-</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- POS Terminal Section -->
        <div id="pos" class="section">
            <div class="pos-container">
                <!-- Products Side -->
                <div class="pos-products">
                    <div class="search-section">
                        <div class="input-group flex-grow-1">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" class="form-control" placeholder="Search products..." id="posProductSearch">
                        </div>
                        <button class="btn btn-outline-info" onclick="showCustomerSearchModal()">
                            <i class="fas fa-user"></i> Customer
                        </button>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <h5>Products</h5>
                        <div id="selectedCustomerInfo" class="text-muted small">
                            No customer selected
                        </div>
                    </div>
                    
                    <div id="posProductGrid" class="product-grid">
                        <div class="text-center p-5">
                            <div class="spinner-border text-success" role="status"></div>
                            <p class="mt-2">Loading products...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Cart Side -->
                <div class="pos-cart">
                    <h5><i class="fas fa-shopping-cart"></i> Cart</h5>
                    
                    <div id="cartItems" class="flex-grow-1" style="max-height: 400px; overflow-y: auto;">
                        <div class="text-center text-muted p-4">
                            <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                            <p>Cart is empty</p>
                        </div>
                    </div>
                    
                    <div class="cart-summary">
                        <div class="mb-2">
                            <label class="form-label">Discount (Rs.)</label>
                            <input type="number" class="form-control" id="discountAmount" value="0" min="0" step="0.01">
                        </div>
                        
                        <!-- Cash received field -->
                        <div class="mb-2" id="cashReceivedContainer" style="display: none;">
                            <label class="form-label">Cash Received (Rs.)</label>
                            <input type="number" class="form-control" id="cashReceived" min="0" step="0.01">
                        </div>
                        
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <strong id="cartSubtotal">Rs. 0.00</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Discount:</span>
                            <strong id="cartDiscount">Rs. 0.00</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Change:</span>
                            <strong id="changeAmount" class="text-success">Rs. 0.00</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-3" style="font-size: 1.2rem;">
                            <span><strong>Total:</strong></span>
                            <strong id="cartTotal" class="text-success">Rs. 0.00</strong>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <select class="form-select" id="paymentMethod">
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-danger w-100" onclick="clearCart()">
                                    <i class="fas fa-trash"></i> Clear
                                </button>
                            </div>
                        </div>
                        
                        <button class="btn btn-success w-100 btn-lg" onclick="processOrder()" id="checkoutBtn" disabled>
                            <i class="fas fa-credit-card"></i> Process Order
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Products Section -->
        <div id="products" class="section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4><i class="fas fa-book"></i> Product Management</h4>
                <button class="btn btn-success" onclick="showProductModal()">
                    <i class="fas fa-plus"></i> Add Product
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" placeholder="Search products..." id="productSearch">
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <select class="form-select d-inline-block w-auto me-2" id="categoryFilter">
                                <option value="">All Categories</option>
                            </select>
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
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="productsTableBody">
                                <tr>
                                    <td colspan="8" class="text-center">
                                        <div class="spinner-border text-success" role="status"></div>
                                        <p class="mt-2">Loading products...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Customers Section -->
        <div id="customers" class="section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4><i class="fas fa-users"></i> Customer Management</h4>
                <button class="btn btn-success" onclick="showCustomerModal()">
                    <i class="fas fa-user-plus"></i> Add Customer
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" placeholder="Search customers..." id="customerSearch">
                            </div>
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
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="customersTableBody">
                                <tr>
                                    <td colspan="7" class="text-center">
                                        <div class="spinner-border text-success" role="status"></div>
                                        <p class="mt-2">Loading customers...</p>
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
                <button class="btn btn-success" onclick="showSection('pos')">
                    <i class="fas fa-cash-register"></i> Create Sale
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" placeholder="Search orders by number, customer name, email or ID..." id="orderSearch">
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="ordersTableBody">
                                <tr>
                                    <td colspan="8" class="text-center">
                                        <div class="spinner-border text-success" role="status"></div>
                                        <p class="mt-2">Loading orders...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals Container -->
    <div id="modalContainer"></div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Staff Dashboard JS -->
    <script src="assets/js/staff-dashboard.js"></script>
</body>
</html>
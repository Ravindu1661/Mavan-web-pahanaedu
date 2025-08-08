<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Orders - Pahana Edu</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
     
    <!-- Custom CSS -->
    <link href="assets/css/index.css" rel="stylesheet">
    <link href="assets/css/customer-orders.css" rel="stylesheet">
</head>
<body>
    <!-- Include Navigation Bar -->
    <jsp:include page="includes/customer-navbar.jsp" />

    <!-- Page Header -->
    <section class="page-header">
        <div class="header-container">
            <div class="breadcrumb fade-in">
                <a href="customer-dashboard.jsp"><i class="fas fa-home"></i> Home</a>
                <span><i class="fas fa-chevron-right"></i></span>
                <span class="current">My Orders</span>
            </div>
            
            <div class="header-content fade-in">
                <h1 class="page-title">
                    <i class="fas fa-box"></i>
                    My Orders
                </h1>
                <p class="page-subtitle">Track and manage your order history</p>
            </div>
        </div>
    </section>

    <!-- Orders Filter Section -->
    <section class="orders-filter">
        <div class="filter-container">
            <div class="filter-controls fade-in">
                <div class="filter-group">
                    <label for="statusFilter">
                        <i class="fas fa-filter"></i>
                        Filter by Status
                    </label>
                    <select id="statusFilter" class="filter-select">
                        <option value="">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="dateFilter">
                        <i class="fas fa-calendar"></i>
                        Filter by Date
                    </label>
                    <select id="dateFilter" class="filter-select">
                        <option value="">All Time</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="last3months">Last 3 Months</option>
                        <option value="lastyear">Last Year</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="searchOrder">
                        <i class="fas fa-search"></i>
                        Search Orders
                    </label>
                    <input type="text" id="searchOrder" class="search-input" placeholder="Search by order number...">
                </div>

                <button class="btn-clear-filters" onclick="clearFilters()">
                    <i class="fas fa-times"></i>
                    Clear Filters
                </button>
            </div>
        </div>
    </section>

    <!-- Orders Content -->
    <section class="orders-section">
        <div class="orders-container">
            <!-- Orders Statistics -->
            <div class="orders-stats fade-in">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="totalOrders">0</h3>
                        <p>Total Orders</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="pendingOrders">0</h3>
                        <p>Pending Orders</p>
                    </div>
                </div>

                <!-- CHANGED: Completed Orders to Confirmed Orders -->
                <div class="stat-card">
                    <div class="stat-icon confirmed">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="confirmedOrders">0</h3>
                        <p>Confirmed Orders</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon total-spent">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="totalSpent">Rs. 0.00</h3>
                        <p>Total Spent</p>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div class="loading-state" id="ordersLoadingState">
                <div class="spinner"></div>
                <p>Loading your orders...</p>
            </div>

            <!-- Empty Orders State -->
            <div class="empty-orders" id="emptyOrdersState" style="display: none;">
                <i class="fas fa-box-open"></i>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet or no orders match your current filters.</p>
                <a href="customer-dashboard.jsp" class="btn-shop">
                    <i class="fas fa-shopping-cart"></i>
                    Start Shopping
                </a>
            </div>

            <!-- Orders List -->
            <div class="orders-list" id="ordersList" style="display: none;">
                <!-- Orders will be populated here by JavaScript -->
            </div>

            <!-- Pagination -->
            <div class="pagination-container" id="paginationContainer" style="display: none;">
                <div class="pagination">
                    <button class="pagination-btn" id="prevPage" onclick="changePage(-1)">
                        <i class="fas fa-chevron-left"></i>
                        Previous
                    </button>
                    
                    <div class="page-info">
                        <span>Page <span id="currentPage">1</span> of <span id="totalPages">1</span></span>
                    </div>
                    
                    <button class="pagination-btn" id="nextPage" onclick="changePage(1)">
                        Next
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Order Details Modal -->
    <div class="modal-overlay" id="orderDetailsModal" style="display: none;">
        <div class="modal-content order-modal">
            <div class="modal-header">
                <h3 id="orderModalTitle">Order Details</h3>
                <button class="modal-close" onclick="closeOrderModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" id="orderModalBody">
                <!-- Order details will be populated here by JavaScript -->
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeOrderModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- Cancel Order Confirmation Modal -->
    <div class="modal-overlay" id="cancelOrderModal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Cancel Order</h3>
                <button class="modal-close" onclick="closeCancelModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="cancel-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Are you sure you want to cancel this order?</p>
                    <p class="cancel-note">This action cannot be undone. You will receive a refund if payment was already processed.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeCancelModal()">Keep Order</button>
                <button class="btn-confirm cancel-confirm" onclick="confirmCancelOrder()">Yes, Cancel Order</button>
            </div>
        </div>
    </div>

    <!-- Include Footer -->
    <jsp:include page="includes/footer.jsp" />

    <!-- JavaScript -->
    <script src="assets/js/customer-orders.js"></script>

</body>
</html>
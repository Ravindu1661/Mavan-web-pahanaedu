<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shopping Cart - Pahana Edu</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="assets/css/index.css" rel="stylesheet">
    <link href="assets/css/customer-cart.css" rel="stylesheet">
</head>
<body>
    <!-- Include Navigation Bar -->
    <jsp:include page="includes/customer-navbar.jsp" />

    <!-- Cart Page Header -->
    <section class="page-header">
        <div class="header-container">
            <div class="breadcrumb fade-in">
                <a href="customer-dashboard.jsp"><i class="fas fa-home"></i> Home</a>
                <span><i class="fas fa-chevron-right"></i></span>
                <span class="current">Shopping Cart</span>
            </div>
            
            <div class="header-content fade-in">
                <h1 class="page-title">
                    <i class="fas fa-shopping-cart"></i>
                    Your Shopping Cart
                </h1>
                <p class="page-subtitle">Review your selected books and proceed to checkout</p>
            </div>
        </div>
    </section>

    <!-- Cart Content -->
    <section class="cart-section">
        <div class="cart-container">
            <!-- Cart Items -->
            <div class="cart-content-grid">
                <div class="cart-items-section">
                    <div class="cart-header fade-in">
                        <h2>Cart Items</h2>
                        <div class="cart-actions">
                            <button class="btn-clear-cart" onclick="clearEntireCart()">
                                <i class="fas fa-trash"></i>
                                Clear Cart
                            </button>
                            <a href="customer-dashboard.jsp#products" class="btn-continue-shopping">
                                <i class="fas fa-arrow-left"></i>
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                    
                    <div class="cart-items-container" id="cartItemsContainer">
                        <!-- Loading State -->
                        <div class="loading-state" id="cartLoadingState">
                            <div class="spinner"></div>
                            <p>Loading your cart...</p>
                        </div>
                        
                        <!-- Empty Cart State -->
                        <div class="empty-cart-state" id="emptyCartState" style="display: none;">
                            <div class="empty-cart-content">
                                <i class="fas fa-shopping-cart"></i>
                                <h3>Your cart is empty</h3>
                                <p>Looks like you haven't added any books to your cart yet.</p>
                                <a href="customer-dashboard.jsp#products" class="btn-start-shopping">
                                    <i class="fas fa-search"></i>
                                    Start Shopping
                                </a>
                            </div>
                        </div>
                        
                        <!-- Cart Items List -->
                        <div class="cart-items-list" id="cartItemsList" style="display: none;">
                            <!-- Cart items will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Cart Summary -->
                <div class="cart-summary-section">
                    <div class="cart-summary-card fade-in" id="cartSummaryCard" style="display: none;">
                        <div class="summary-header">
                            <h3><i class="fas fa-calculator"></i> Order Summary</h3>
                        </div>
                        
                        <div class="summary-content">
                            <div class="summary-row">
                                <span>Items (<span id="totalItemsCount">0</span>)</span>
                                <span>Rs. <span id="subtotalAmount">0.00</span></span>
                            </div>
                            
                            <div class="summary-row">
                                <span>Shipping</span>
                                <span class="shipping-free">Free</span>
                            </div>
                            
                            <div class="promo-section">
                                <div class="promo-input-container">
                                    <input type="text" id="promoCodeInput" placeholder="Enter promo code">
                                    <button class="btn-apply-promo" onclick="applyPromoCode()">
                                        <i class="fas fa-tag"></i>
                                        Apply
                                    </button>
                                </div>
                                <div class="promo-message" id="promoMessage"></div>
                            </div>
                            
                            <div class="applied-promo" id="appliedPromo" style="display: none;">
                                <div class="summary-row promo-discount">
                                    <span>Discount</span>
                                    <span class="discount-amount">- Rs. <span id="discountAmount">0.00</span></span>
                                </div>
                            </div>
                            
                            <div class="summary-divider"></div>
                            
                            <div class="summary-row total-row">
                                <span>Total</span>
                                <span class="total-amount">Rs. <span id="totalAmount">0.00</span></span>
                            </div>
                            
                            <div class="checkout-actions">
                                <c:choose>
                                    <c:when test="${sessionScope.isLoggedIn}">
                                        <button class="btn-checkout" onclick="proceedToCheckout()">
                                            <i class="fas fa-credit-card"></i>
                                            Proceed to Checkout
                                        </button>
                                    </c:when>
                                    <c:otherwise>
                                        <a href="login-signup.jsp" class="btn-checkout">
                                            <i class="fas fa-sign-in-alt"></i>
                                            Login to Checkout
                                        </a>
                                    </c:otherwise>
                                </c:choose>
                                
                                <div class="payment-methods">
                                    <span>We accept:</span>
                                    <div class="payment-icons">
                                        <i class="fab fa-cc-visa"></i>
                                        <i class="fab fa-cc-mastercard"></i>
                                        <i class="fab fa-cc-paypal"></i>
                                        <i class="fas fa-money-bill-wave"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recently Viewed -->
                    <div class="recently-viewed-section fade-in">
                        <h3><i class="fas fa-eye"></i> You Might Also Like</h3>
                        <div class="suggested-products" id="suggestedProducts">
                            <!-- Suggested products will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" id="confirmationModal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Confirm Action</h3>
                <button class="modal-close" onclick="closeConfirmationModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p id="modalMessage">Are you sure you want to perform this action?</p>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeConfirmationModal()">Cancel</button>
                <button class="btn-confirm" id="confirmButton" onclick="confirmAction()">Confirm</button>
            </div>
        </div>
    </div>

    <!-- Include Footer -->
    <jsp:include page="includes/footer.jsp" />

    <!-- Custom JavaScript -->
    <script src="assets/js/customer-cart.js"></script>
</body>
</html>
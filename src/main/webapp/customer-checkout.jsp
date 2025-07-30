<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - Pahana Edu</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="assets/css/index.css" rel="stylesheet">
    <link href="assets/css/customer-checkout.css" rel="stylesheet">
</head>
<body>
    <!-- Include Navigation Bar -->
    <jsp:include page="includes/customer-navbar.jsp" />

    <!-- Checkout Page Header -->
    <section class="page-header">
        <div class="header-container">
            <div class="breadcrumb fade-in">
                <a href="customer-dashboard.jsp"><i class="fas fa-home"></i> Home</a>
                <span><i class="fas fa-chevron-right"></i></span>
                <a href="customer/cart"><i class="fas fa-shopping-cart"></i> Cart</a>
                <span><i class="fas fa-chevron-right"></i></span>
                <span class="current">Checkout</span>
            </div>
            
            <div class="header-content fade-in">
                <h1 class="page-title">
                    <i class="fas fa-credit-card"></i>
                    Secure Checkout
                </h1>
                <p class="page-subtitle">Complete your order securely and safely</p>
            </div>
        </div>
    </section>

    <!-- Checkout Steps -->
    <section class="checkout-steps">
        <div class="steps-container">
            <div class="steps-wrapper fade-in">
                <div class="step active" data-step="1">
                    <div class="step-number">1</div>
                    <span>Order Review</span>
                </div>
                <div class="step-line"></div>
                <div class="step" data-step="2">
                    <div class="step-number">2</div>
                    <span>Shipping Details</span>
                </div>
                <div class="step-line"></div>
                <div class="step" data-step="3">
                    <div class="step-number">3</div>
                    <span>Payment</span>
                </div>
                <div class="step-line"></div>
                <div class="step" data-step="4">
                    <div class="step-number">4</div>
                    <span>Confirmation</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Checkout Content -->
    <section class="checkout-section">
        <div class="checkout-container">
            <div class="checkout-grid">
                <!-- Main Checkout Form -->
                <div class="checkout-main">
                    <!-- Step 1: Order Review -->
                    <div class="checkout-step" id="step1" style="display: block;">
                        <div class="step-header fade-in">
                            <h2><i class="fas fa-list"></i> Review Your Order</h2>
                            <p>Please review your items before proceeding</p>
                        </div>
                        
                        <div class="order-items" id="orderItemsReview">
                            <div class="loading-state">
                                <div class="spinner"></div>
                                <p>Loading your order...</p>
                            </div>
                        </div>
                        
                        <div class="step-actions">
                            <a href="customer/cart" class="btn-back">
                                <i class="fas fa-arrow-left"></i>
                                Back to Cart
                            </a>
                            <button class="btn-next" onclick="nextStep(2)">
                                Continue to Shipping
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: Shipping Details -->
                    <div class="checkout-step" id="step2" style="display: none;">
                        <div class="step-header fade-in">
                            <h2><i class="fas fa-shipping-fast"></i> Shipping Information</h2>
                            <p>Enter your delivery details</p>
                        </div>
                        
                        <form id="shippingForm" class="shipping-form fade-in">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="customerName">
                                        <i class="fas fa-user"></i>
                                        Full Name *
                                    </label>
                                    <input type="text" id="customerName" name="customerName" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="customerEmail">
                                        <i class="fas fa-envelope"></i>
                                        Email Address *
                                    </label>
                                    <input type="email" id="customerEmail" name="customerEmail" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="customerPhone">
                                        <i class="fas fa-phone"></i>
                                        Phone Number
                                    </label>
                                    <input type="tel" id="customerPhone" name="customerPhone">
                                </div>
                                
                                <div class="form-group full-width">
                                    <label for="shippingAddress">
                                        <i class="fas fa-map-marker-alt"></i>
                                        Shipping Address *
                                    </label>
                                    <textarea id="shippingAddress" name="shippingAddress" rows="4" required
                                              placeholder="Enter your complete address including street, city, and postal code"></textarea>
                                </div>
                            </div>
                            
                            <div class="shipping-options">
                                <h3><i class="fas fa-truck"></i> Delivery Options</h3>
                                <div class="shipping-methods">
                                    <div class="shipping-method active">
                                        <input type="radio" id="standardShipping" name="shippingMethod" value="standard" checked>
                                        <label for="standardShipping">
                                            <div class="method-info">
                                                <span class="method-name">Standard Delivery</span>
                                                <span class="method-time">3-5 business days</span>
                                            </div>
                                            <span class="method-price">Free</span>
                                        </label>
                                    </div>
                                    
                                    <div class="shipping-method">
                                        <input type="radio" id="expressShipping" name="shippingMethod" value="express">
                                        <label for="expressShipping">
                                            <div class="method-info">
                                                <span class="method-name">Express Delivery</span>
                                                <span class="method-time">1-2 business days</span>
                                            </div>
                                            <span class="method-price">Rs. 500</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                        
                        <div class="step-actions">
                            <button class="btn-back" onclick="previousStep(1)">
                                <i class="fas fa-arrow-left"></i>
                                Back to Review
                            </button>
                            <button class="btn-next" onclick="nextStep(3)">
                                Continue to Payment
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Step 3: Payment -->
                    <div class="checkout-step" id="step3" style="display: none;">
                        <div class="step-header fade-in">
                            <h2><i class="fas fa-credit-card"></i> Payment Method</h2>
                            <p>Choose your preferred payment method</p>
                        </div>
                        
                        <div class="payment-methods fade-in">
                            <div class="payment-method active">
                                <input type="radio" id="cashOnDelivery" name="paymentMethod" value="cod" checked>
                                <label for="cashOnDelivery">
                                    <div class="method-icon">
                                        <i class="fas fa-money-bill-wave"></i>
                                    </div>
                                    <div class="method-details">
                                        <span class="method-name">Cash on Delivery</span>
                                        <span class="method-description">Pay when you receive your order</span>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="payment-method">
                                <input type="radio" id="bankTransfer" name="paymentMethod" value="bank">
                                <label for="bankTransfer">
                                    <div class="method-icon">
                                        <i class="fas fa-university"></i>
                                    </div>
                                    <div class="method-details">
                                        <span class="method-name">Bank Transfer</span>
                                        <span class="method-description">Direct bank transfer</span>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="payment-method">
                                <input type="radio" id="creditCard" name="paymentMethod" value="card">
                                <label for="creditCard">
                                    <div class="method-icon">
                                        <i class="fas fa-credit-card"></i>
                                    </div>
                                    <div class="method-details">
                                        <span class="method-name">Credit/Debit Card</span>
                                        <span class="method-description">Visa, MasterCard accepted</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="terms-section">
                            <div class="terms-checkbox">
                                <input type="checkbox" id="agreeTerms" required>
                                <label for="agreeTerms">
                                    I agree to the <a href="#" target="_blank">Terms of Service</a> and 
                                    <a href="#" target="_blank">Privacy Policy</a>
                                </label>
                            </div>
                        </div>
                        
                        <div class="step-actions">
                            <button class="btn-back" onclick="previousStep(2)">
                                <i class="fas fa-arrow-left"></i>
                                Back to Shipping
                            </button>
                            <button class="btn-place-order" onclick="placeOrder()" id="placeOrderBtn">
                                <i class="fas fa-check"></i>
                                Place Order
                            </button>
                        </div>
                    </div>

                    <!-- Step 4: Confirmation -->
                    <div class="checkout-step" id="step4" style="display: none;">
                        <div class="confirmation-content fade-in">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h2>Order Placed Successfully!</h2>
                            <p class="order-number">Order Number: <span id="confirmationOrderNumber">#</span></p>
                            <p class="confirmation-message">
                                Thank you for your order! We've sent a confirmation email with your order details.
                                You can track your order status in your account.
                            </p>
                            
                            <div class="confirmation-actions">
                                <a href="customer/orders" class="btn-view-orders">
                                    <i class="fas fa-list"></i>
                                    View My Orders
                                </a>
                                <a href="customer-dashboard.jsp" class="btn-continue-shopping">
                                    <i class="fas fa-shopping-bag"></i>
                                    Continue Shopping
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary Sidebar -->
                <div class="checkout-sidebar">
                    <div class="order-summary-card sticky-summary">
                        <div class="summary-header">
                            <h3><i class="fas fa-receipt"></i> Order Summary</h3>
                        </div>
                        
                        <div class="summary-items" id="summaryItems">
                            <!-- Summary items will be populated here -->
                        </div>
                        
                        <div class="promo-section" id="checkoutPromoSection">
                            <div class="promo-input-container">
                                <input type="text" id="checkoutPromoCode" placeholder="Promo code">
                                <button class="btn-apply-promo" onclick="applyCheckoutPromo()">
                                    <i class="fas fa-tag"></i>
                                </button>
                            </div>
                            <div class="promo-message" id="checkoutPromoMessage"></div>
                        </div>
                        
                        <div class="summary-totals">
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span>Rs. <span id="summarySubtotal">0.00</span></span>
                            </div>
                            
                            <div class="summary-row" id="summaryDiscountRow" style="display: none;">
                                <span>Discount</span>
                                <span class="discount-amount">- Rs. <span id="summaryDiscount">0.00</span></span>
                            </div>
                            
                            <div class="summary-row">
                                <span>Shipping</span>
                                <span id="summaryShipping">Free</span>
                            </div>
                            
                            <div class="summary-divider"></div>
                            
                            <div class="summary-row total-row">
                                <span>Total</span>
                                <span class="total-amount">Rs. <span id="summaryTotal">0.00</span></span>
                            </div>
                        </div>
                        
                        <div class="security-badges">
                            <div class="security-item">
                                <i class="fas fa-shield-alt"></i>
                                <span>Secure Checkout</span>
                            </div>
                            <div class="security-item">
                                <i class="fas fa-lock"></i>
                                <span>SSL Protected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay" style="display: none;">
        <div class="loading-content">
            <div class="spinner"></div>
            <p>Processing your order...</p>
        </div>
    </div>

    <!-- Include Footer -->
    <jsp:include page="includes/footer.jsp" />

    <!-- Custom JavaScript -->
    <script src="assets/js/customer-checkout.js"></script>
</body>
</html>
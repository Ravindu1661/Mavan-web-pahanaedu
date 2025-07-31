/**
 * PAHANA EDU - CUSTOMER CHECKOUT JAVASCRIPT
 * Checkout process functionality with step-by-step validation
 * Updated to work with CustomerController endpoints
 */

// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

let currentStep = 1;
let cart = [];
let orderSummary = {
    subtotal: 0,
    discountAmount: 0,
    shippingCost: 0,
    finalTotal: 0
};
let appliedPromo = null;
let isProcessing = false;

// API endpoints - Updated to match CustomerController URLs
const API_ENDPOINTS = {
    cart: 'customer/cart',
    checkout: 'customer/checkout',
    profile: 'customer/profile',
    promo: 'customer/promo-validate'
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckoutPage();
});

async function initializeCheckoutPage() {
    try {
        showLoadingOverlay('Loading checkout...');
        
        // Initialize animations and event listeners
        initializeScrollAnimations();
        initializeEventListeners();
        
        // Validate cart and load data
        await validateAndLoadCart();
        await loadCustomerProfile();
        
        // Initialize checkout process
        initializeCheckoutSteps();
        updateOrderSummary();
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Failed to initialize checkout:', error);
        showNotification('Failed to load checkout. Please try again.', 'error');
        hideLoadingOverlay();
    }
}

function initializeEventListeners() {
    // Form validation
    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm) {
        shippingForm.addEventListener('input', validateShippingForm);
    }
    
    // Shipping method change
    const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
    shippingMethods.forEach(method => {
        method.addEventListener('change', updateShippingCost);
    });
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Promo code functionality
    const promoInput = document.getElementById('checkoutPromoCode');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyCheckoutPromo();
            }
        });
    }
    
    // Terms and conditions
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms) {
        agreeTerms.addEventListener('change', validatePaymentStep);
    }
}

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// =============================================================================
// CART VALIDATION AND LOADING
// =============================================================================

async function validateAndLoadCart() {
    try {
        // First, validate the cart
        const validateResponse = await fetch(API_ENDPOINTS.checkout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=validate-cart'
        });
        
        console.log('Cart validation response status:', validateResponse.status); // Debug log
        
        if (!validateResponse.ok) {
            throw new Error(`HTTP error! status: ${validateResponse.status}`);
        }
        
        const validateData = await validateResponse.json();
        console.log('Cart validation data:', validateData); // Debug log
        
        if (!validateData.valid) {
            if (validateData.issues && validateData.issues.length > 0) {
                validateData.issues.forEach(issue => {
                    showNotification(issue, 'warning');
                });
            }
            
            // If cart is invalid, redirect back to cart
            setTimeout(() => {
                window.location.href = 'customer/cart';
            }, 3000);
            return;
        }
        
        // Load cart items - handle different data structures
        if (validateData.cartItems && validateData.cartItems.items) {
            cart = validateData.cartItems.items;
        } else if (validateData.cartItems && Array.isArray(validateData.cartItems)) {
            cart = validateData.cartItems;
        } else {
            cart = [];
        }
        
        console.log('Loaded cart items for checkout:', cart); // Debug log
        
        // Log image data for each cart item
        cart.forEach((item, index) => {
            console.log(`Cart item ${index} image data:`, {
                productTitle: item.productTitle,
                productImage: item.productImage
            });
        });
        
        if (cart.length === 0) {
            showNotification('Your cart is empty. Redirecting to shop...', 'info');
            setTimeout(() => {
                window.location.href = 'customer-dashboard.jsp';
            }, 2000);
            return;
        }
        
        // Display cart items in review step
        displayOrderReview();
        
    } catch (error) {
        console.error('Cart validation failed:', error);
        showNotification('Failed to validate cart. Please try again.', 'error');
        throw error;
    }
}

async function loadCustomerProfile() {
    try {
        const response = await fetch(API_ENDPOINTS.profile, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=get'
        });
        
        if (response.ok) {
            const profile = await response.json();
            
            if (profile && !profile.error) {
                // Pre-fill customer information
                const customerName = document.getElementById('customerName');
                const customerEmail = document.getElementById('customerEmail');
                const customerPhone = document.getElementById('customerPhone');
                
                if (customerName) customerName.value = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
                if (customerEmail) customerEmail.value = profile.email || '';
                if (customerPhone) customerPhone.value = profile.phone || '';
            }
        }
    } catch (error) {
        console.error('Failed to load customer profile:', error);
        // Continue without pre-filling if profile loading fails
    }
}

// =============================================================================
// ORDER REVIEW DISPLAY
// =============================================================================

function displayOrderReview() {
    const orderItemsReview = document.getElementById('orderItemsReview');
    if (!orderItemsReview || cart.length === 0) return;
    
    console.log('Displaying order review with cart:', cart); // Debug log
    
    const html = `
        <div class="order-review-list">
            ${cart.map(item => createOrderReviewItem(item)).join('')}
        </div>
        <div class="order-review-summary">
            <div class="review-total">
                <span>Total Items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                <span>Subtotal: Rs. ${cart.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0).toFixed(2)}</span>
            </div>
        </div>
    `;
    
    orderItemsReview.innerHTML = html;
    console.log('Order review HTML generated and inserted'); // Debug log
}

function createOrderReviewItem(item) {
    console.log('Creating order review item:', item); // Debug log
    
    // FIXED: Handle image path properly (matching cart logic)
    let imageSrc = item.productImage;
    
    // Check if imageSrc exists and is not empty
    if (imageSrc && imageSrc.trim() !== '') {
        // Only add 'uploads/' if it's not already there and doesn't start with http/https
        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('uploads/')) {
            imageSrc = 'uploads/' + imageSrc;
        }
    } else {
        // Use default image if no image path
        imageSrc = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
    }
    
    console.log('Checkout review image source:', imageSrc); // Debug log
    
    return `
        <div class="order-review-item">
            <div class="review-item-image">
                <img src="${imageSrc}" 
                     alt="${escapeHtml(item.productTitle)}"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'"
                     onload="console.log('Checkout review image loaded:', this.src)">
            </div>
            <div class="review-item-details">
                <h4>${escapeHtml(item.productTitle)}</h4>
                <p>Quantity: ${item.quantity}</p>
                <p>Unit Price: Rs. ${parseFloat(item.unitPrice).toFixed(2)}</p>
            </div>
            <div class="review-item-total">
                <span>Rs. ${parseFloat(item.totalPrice).toFixed(2)}</span>
            </div>
        </div>
    `;
}

// =============================================================================
// CHECKOUT STEPS MANAGEMENT
// =============================================================================

function initializeCheckoutSteps() {
    updateStepIndicators();
    showStep(1);
}

function nextStep(stepNumber) {
    if (validateCurrentStep()) {
        currentStep = stepNumber;
        showStep(stepNumber);
        updateStepIndicators();
        
        // Scroll to top of checkout section
        const checkoutSection = document.querySelector('.checkout-section');
        if (checkoutSection) {
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function previousStep(stepNumber) {
    currentStep = stepNumber;
    showStep(stepNumber);
    updateStepIndicators();
}

function showStep(stepNumber) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) {
            step.style.display = 'none';
        }
    }
    
    // Show current step
    const currentStepEl = document.getElementById(`step${stepNumber}`);
    if (currentStepEl) {
        currentStepEl.style.display = 'block';
    }
    
    // Update order summary based on step
    if (stepNumber >= 2) {
        updateOrderSummary();
    }
}

function updateStepIndicators() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return validateOrderReview();
        case 2:
            return validateShippingForm();
        case 3:
            return validatePaymentStep();
        default:
            return true;
    }
}

// =============================================================================
// STEP VALIDATIONS
// =============================================================================

function validateOrderReview() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return false;
    }
    return true;
}

function validateShippingForm() {
    const form = document.getElementById('shippingForm');
    if (!form) return false;
    
    const requiredFields = [
        { id: 'customerName', name: 'Full Name' },
        { id: 'customerEmail', name: 'Email Address' },
        { id: 'shippingAddress', name: 'Shipping Address' }
    ];
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            const value = input.value.trim();
            if (!value) {
                showNotification(`${field.name} is required`, 'error');
                input.focus();
                isValid = false;
                return;
            }
            
            // Email validation
            if (field.id === 'customerEmail' && !isValidEmail(value)) {
                showNotification('Please enter a valid email address', 'error');
                input.focus();
                isValid = false;
                return;
            }
        }
    });
    
    return isValid;
}

function validatePaymentStep() {
    const agreeTerms = document.getElementById('agreeTerms');
    
    if (agreeTerms && !agreeTerms.checked) {
        showNotification('Please agree to the terms and conditions', 'error');
        agreeTerms.focus();
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// =============================================================================
// ORDER SUMMARY AND CALCULATIONS
// =============================================================================

function updateOrderSummary() {
    if (cart.length === 0) return;
    
    // Calculate subtotal
    orderSummary.subtotal = cart.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    
    // Apply shipping cost
    updateShippingCost();
    
    // Calculate final total
    orderSummary.finalTotal = orderSummary.subtotal - orderSummary.discountAmount + orderSummary.shippingCost;
    
    // Update summary display
    displayOrderSummary();
    displaySummaryItems();
}

function updateShippingCost() {
    const selectedShipping = document.querySelector('input[name="shippingMethod"]:checked');
    
    orderSummary.shippingCost = 0;
    let shippingText = 'Free';
    
    if (selectedShipping && selectedShipping.value === 'express') {
        orderSummary.shippingCost = 500;
        shippingText = 'Rs. 500.00';
    }
    
    // Update shipping display
    const summaryShipping = document.getElementById('summaryShipping');
    if (summaryShipping) {
        summaryShipping.textContent = shippingText;
    }
    
    // Recalculate total
    orderSummary.finalTotal = orderSummary.subtotal - orderSummary.discountAmount + orderSummary.shippingCost;
    displayOrderSummary();
}

function displayOrderSummary() {
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryDiscountRow = document.getElementById('summaryDiscountRow');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summarySubtotal) summarySubtotal.textContent = orderSummary.subtotal.toFixed(2);
    if (summaryDiscount) summaryDiscount.textContent = orderSummary.discountAmount.toFixed(2);
    if (summaryTotal) summaryTotal.textContent = orderSummary.finalTotal.toFixed(2);
    
    if (summaryDiscountRow) {
        summaryDiscountRow.style.display = orderSummary.discountAmount > 0 ? 'flex' : 'none';
    }
}

function displaySummaryItems() {
    const summaryItems = document.getElementById('summaryItems');
    if (!summaryItems || cart.length === 0) return;
    
    console.log('Displaying summary items with cart:', cart); // Debug log
    
    const html = cart.map(item => {
        console.log('Processing summary item:', item); // Debug log
        
        // FIXED: Handle image path properly (matching cart logic)
        let imageSrc = item.productImage;
        
        if (imageSrc && imageSrc.trim() !== '') {
            if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('uploads/')) {
                imageSrc = 'uploads/' + imageSrc;
            }
        } else {
            imageSrc = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80';
        }
        
        console.log('Summary item image source:', imageSrc); // Debug log
        
        return `
            <div class="summary-item">
                <div class="summary-item-image">
                    <img src="${imageSrc}" 
                         alt="${escapeHtml(item.productTitle)}"
                         onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80'"
                         onload="console.log('Summary image loaded:', this.src)">
                </div>
                <div class="summary-item-info">
                    <h4>${escapeHtml(item.productTitle)}</h4>
                    <span>Qty: ${item.quantity} × Rs. ${parseFloat(item.unitPrice).toFixed(2)}</span>
                </div>
                <div class="summary-item-total">
                    Rs. ${parseFloat(item.totalPrice).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    summaryItems.innerHTML = html;
    console.log('Summary items HTML generated and inserted'); // Debug log
}

// =============================================================================
// PROMO CODE FUNCTIONALITY
// =============================================================================

async function applyCheckoutPromo() {
    const promoInput = document.getElementById('checkoutPromoCode');
    const promoMessage = document.getElementById('checkoutPromoMessage');
    
    if (!promoInput || !promoMessage) return;
    
    const promoCode = promoInput.value.trim();
    
    if (!promoCode) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    try {
        promoMessage.textContent = 'Validating...';
        promoMessage.className = 'promo-message info';
        promoMessage.style.display = 'block';
        
        // Use the correct endpoint for promo validation
        const response = await fetch(API_ENDPOINTS.promo, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `code=${encodeURIComponent(promoCode)}`
        });
        
        console.log('Checkout promo validation response status:', response.status); // Debug log
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Checkout promo validation data:', data); // Debug log
        
        if (data && data.valid) {
            appliedPromo = {
                code: data.code,
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue
            };
            
            // Calculate discount
            if (data.discountType === 'percentage') {
                orderSummary.discountAmount = (orderSummary.subtotal * parseFloat(data.discountValue)) / 100;
            } else if (data.discountType === 'fixed') {
                orderSummary.discountAmount = Math.min(parseFloat(data.discountValue), orderSummary.subtotal);
            }
            
            updateOrderSummary();
            showPromoMessage(`Promo code applied: ${data.description}`, 'success');
            promoInput.value = '';
        } else {
            appliedPromo = null;
            orderSummary.discountAmount = 0;
            updateOrderSummary();
            showPromoMessage(data.message || 'Invalid promo code', 'error');
        }
        
    } catch (error) {
        console.error('Promo code validation failed:', error);
        appliedPromo = null;
        orderSummary.discountAmount = 0;
        updateOrderSummary();
        showPromoMessage('Failed to validate promo code. Please try again.', 'error');
    }
}

function showPromoMessage(message, type) {
    const promoMessage = document.getElementById('checkoutPromoMessage');
    if (promoMessage) {
        promoMessage.textContent = message;
        promoMessage.className = `promo-message ${type}`;
        promoMessage.style.display = 'block';
    }
}

// =============================================================================
// PAYMENT METHOD HANDLING
// =============================================================================

function handlePaymentMethodChange(e) {
    const selectedMethod = e.target.value;
    
    // You can add specific handling for different payment methods here
    console.log('Selected payment method:', selectedMethod);
    
    // Update UI based on selected payment method
    updatePaymentMethodUI(selectedMethod);
}

function updatePaymentMethodUI(method) {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(methodEl => {
        const input = methodEl.querySelector('input[type="radio"]');
        if (input && input.value === method) {
            methodEl.classList.add('active');
        } else {
            methodEl.classList.remove('active');
        }
    });
}

// =============================================================================
// ORDER PLACEMENT
// =============================================================================

async function placeOrder() {
    if (isProcessing) return;
    
    try {
        // Final validation
        if (!validatePaymentStep()) {
            return;
        }
        
        isProcessing = true;
        showLoadingOverlay('Processing your order...');
        
        // Collect form data
        const formData = collectOrderData();
        
        // Place the order
        const response = await fetch(API_ENDPOINTS.checkout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Show confirmation step
            displayOrderConfirmation(result.orderNumber);
            nextStep(4);
            
            // Update navbar cart badge
            if (typeof updateNavbarCartBadges === 'function') {
                updateNavbarCartBadges(0);
            }
        } else {
            throw new Error(result.message || 'Failed to place order');
        }
        
    } catch (error) {
        console.error('Order placement failed:', error);
        showNotification(`Failed to place order: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        hideLoadingOverlay();
    }
}

function collectOrderData() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const shippingAddress = document.getElementById('shippingAddress').value.trim();
    const selectedShipping = document.querySelector('input[name="shippingMethod"]:checked');
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    
    const params = new URLSearchParams();
    params.append('action', 'place-order');
    params.append('customerName', customerName);
    params.append('customerEmail', customerEmail);
    params.append('customerPhone', customerPhone);
    params.append('shippingAddress', shippingAddress);
    params.append('shippingMethod', selectedShipping ? selectedShipping.value : 'standard');
    params.append('paymentMethod', selectedPayment ? selectedPayment.value : 'cod');
    
    if (appliedPromo) {
        params.append('promoCode', appliedPromo.code);
    }
    
    return params.toString();
}

function displayOrderConfirmation(orderNumber) {
    const confirmationOrderNumber = document.getElementById('confirmationOrderNumber');
    if (confirmationOrderNumber) {
        confirmationOrderNumber.textContent = orderNumber;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const loadingText = overlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--white);
                color: var(--text-primary);
                padding: 16px 20px;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-medium);
                z-index: 9999;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                border-left: 4px solid var(--primary-color);
                max-width: 400px;
            }
            
            .notification.success {
                border-left-color: var(--success-color);
            }
            
            .notification.error {
                border-left-color: var(--alert-color);
            }
            
            .notification.warning {
                border-left-color: #ff9800;
            }
            
            .notification.info {
                border-left-color: var(--primary-color);
            }
            
            .notification.show {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(styles);
    }
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// =============================================================================
// EXPORT FOR GLOBAL ACCESS
// =============================================================================

window.nextStep = nextStep;
window.previousStep = previousStep;
window.applyCheckoutPromo = applyCheckoutPromo;
window.placeOrder = placeOrder;
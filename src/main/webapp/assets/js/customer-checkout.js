/**
 * PAHANA EDU - CUSTOMER CHECKOUT JAVASCRIPT
 * Enhanced checkout functionality with step-by-step process
 * Works with CustomerController checkout endpoints
 */

// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

let currentStep = 1;
let cartData = [];
let orderSummary = {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0
};
let appliedPromoCode = null;
let currentPromoData = null;
let customerData = {};
let isProcessingOrder = false;

// API endpoints - Match CustomerController URLs
const API_ENDPOINTS = {
    checkout: 'customer/checkout',
    cart: 'customer/cart',
    promo: 'customer/promo-validate',
    profile: 'customer/profile'
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

async function initializeCheckout() {
    try {
        showLoadingOverlay('Initializing checkout...');
        
        // Initialize scroll animations
        initializeScrollAnimations();
        
        // Load customer profile if logged in
        await loadCustomerProfile();
        
        // Validate and load cart
        await validateAndLoadCart();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Initialize first step
        initializeStep(1);
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Failed to initialize checkout:', error);
        showNotification('Failed to initialize checkout. Please try again.', 'error');
        hideLoadingOverlay();
        
        // Redirect to cart if major error
        setTimeout(() => {
            window.location.href = 'customer/cart';
        }, 3000);
    }
}

function initializeEventListeners() {
    // Form validation on input
    const form = document.getElementById('shippingForm');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
    
    // Shipping method selection
    const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
    shippingMethods.forEach(method => {
        method.addEventListener('change', updateShippingCost);
    });
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', updatePaymentMethod);
    });
    
    // Promo code functionality
    const promoInput = document.getElementById('checkoutPromoCode');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyCheckoutPromo();
            }
        });
    }
    
    // Terms checkbox
    const termsCheckbox = document.getElementById('agreeTerms');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', updatePlaceOrderButton);
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
// DATA LOADING FUNCTIONS
// =============================================================================

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
            const data = await response.json();
            if (data && !data.error) {
                customerData = data;
                prefillCustomerData();
            }
        }
        
    } catch (error) {
        console.log('Customer profile not loaded:', error.message);
    }
}

async function validateAndLoadCart() {
    try {
        const response = await fetch(API_ENDPOINTS.checkout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=validate-cart'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.valid) {
            const issues = data.issues || [];
            throw new Error(`Cart validation failed: ${issues.join(', ')}`);
        }
        
        cartData = data.cartItems || [];
        
        if (cartData.length === 0) {
            throw new Error('Your cart is empty');
        }
        
        // Load order summary
        await loadOrderSummary();
        
        // Render cart items in checkout
        renderOrderReview();
        renderOrderSummary();
        
    } catch (error) {
        console.error('Cart validation failed:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function loadOrderSummary() {
    try {
        const response = await fetch(API_ENDPOINTS.checkout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=calculate-total'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && !data.error) {
            orderSummary.subtotal = parseFloat(data.subtotal || 0);
            orderSummary.discount = parseFloat(data.discountAmount || 0);
            orderSummary.total = parseFloat(data.finalTotal || 0);
            
            if (data.promoMessage && data.discountAmount > 0) {
                showPromoMessage(data.promoMessage, 'success');
            }
        }
        
    } catch (error) {
        console.error('Failed to load order summary:', error);
    }
}

// =============================================================================
// RENDERING FUNCTIONS
// =============================================================================

function prefillCustomerData() {
    if (!customerData) return;
    
    const customerName = document.getElementById('customerName');
    const customerEmail = document.getElementById('customerEmail');
    const customerPhone = document.getElementById('customerPhone');
    
    if (customerName && customerData.firstName && customerData.lastName) {
        customerName.value = `${customerData.firstName} ${customerData.lastName}`;
    }
    
    if (customerEmail && customerData.email) {
        customerEmail.value = customerData.email;
    }
    
    if (customerPhone && customerData.phone) {
        customerPhone.value = customerData.phone;
    }
}

function renderOrderReview() {
    const orderItemsReview = document.getElementById('orderItemsReview');
    if (!orderItemsReview || cartData.length === 0) return;
    
    const html = `
        <div class="order-review-list">
            ${cartData.map(item => createOrderReviewItemHTML(item)).join('')}
        </div>
        
        <div class="order-review-summary">
            <div class="review-summary-row">
                <span>Items (${cartData.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>Rs. ${orderSummary.subtotal.toFixed(2)}</span>
            </div>
            ${orderSummary.discount > 0 ? `
                <div class="review-summary-row discount">
                    <span>Discount</span>
                    <span>- Rs. ${orderSummary.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="review-summary-row">
                <span>Shipping</span>
                <span>Free</span>
            </div>
            <div class="review-summary-divider"></div>
            <div class="review-summary-row total">
                <span>Total</span>
                <span>Rs. ${orderSummary.total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    orderItemsReview.innerHTML = html;
}

function createOrderReviewItemHTML(item) {
    return `
        <div class="order-review-item">
            <div class="review-item-image">
                <img src="${item.productImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}" 
                     alt="${escapeHtml(item.productTitle)}"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'">
            </div>
            <div class="review-item-details">
                <h4 class="review-item-title">${escapeHtml(item.productTitle)}</h4>
                <div class="review-item-price">Rs. ${parseFloat(item.unitPrice).toFixed(2)}</div>
                <div class="review-item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="review-item-total">
                Rs. ${parseFloat(item.totalPrice).toFixed(2)}
            </div>
        </div>
    `;
}

function renderOrderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryDiscountRow = document.getElementById('summaryDiscountRow');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summaryItems) {
        const html = cartData.map(item => `
            <div class="summary-item">
                <div class="summary-item-info">
                    <span class="summary-item-title">${escapeHtml(item.productTitle)}</span>
                    <span class="summary-item-qty">x ${item.quantity}</span>
                </div>
                <span class="summary-item-price">Rs. ${parseFloat(item.totalPrice).toFixed(2)}</span>
            </div>
        `).join('');
        
        summaryItems.innerHTML = html;
    }
    
    if (summarySubtotal) summarySubtotal.textContent = orderSummary.subtotal.toFixed(2);
    if (summaryTotal) summaryTotal.textContent = orderSummary.total.toFixed(2);
    if (summaryShipping) summaryShipping.textContent = orderSummary.shipping > 0 ? `Rs. ${orderSummary.shipping.toFixed(2)}` : 'Free';
    
    if (orderSummary.discount > 0) {
        if (summaryDiscount) summaryDiscount.textContent = orderSummary.discount.toFixed(2);
        if (summaryDiscountRow) summaryDiscountRow.style.display = 'flex';
    } else {
        if (summaryDiscountRow) summaryDiscountRow.style.display = 'none';
    }
}

// =============================================================================
// STEP NAVIGATION
// =============================================================================

function nextStep(stepNumber) {
    if (stepNumber === 2) {
        // Validate step 1 (cart items are already validated)
        showStep(2);
    } else if (stepNumber === 3) {
        // Validate step 2 (shipping form)
        if (validateShippingForm()) {
            showStep(3);
        }
    } else if (stepNumber === 4) {
        // This will be handled by placeOrder function
        return;
    }
}

function previousStep(stepNumber) {
    showStep(stepNumber);
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
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.style.display = 'block';
    }
    
    // Update step indicators
    updateStepIndicators(stepNumber);
    
    // Update current step
    currentStep = stepNumber;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepIndicators(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        if (stepNumber < activeStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNumber === activeStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// =============================================================================
// FORM VALIDATION
// =============================================================================

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
        if (!input || !input.value.trim()) {
            showFieldError(input, `${field.name} is required`);
            isValid = false;
        } else {
            clearFieldError(input);
        }
    });
    
    // Validate email format
    const emailInput = document.getElementById('customerEmail');
    if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showFieldError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

function validateField(e) {
    const input = e.target;
    const value = input.value.trim();
    
    if (input.hasAttribute('required') && !value) {
        showFieldError(input, 'This field is required');
        return false;
    }
    
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(input, 'Please enter a valid email address');
            return false;
        }
    }
    
    clearFieldError(input);
    return true;
}

function showFieldError(input, message) {
    if (!input) return;
    
    clearFieldError(input);
    
    input.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    input.parentNode.appendChild(errorElement);
}

function clearFieldError(input) {
    if (!input) return;
    
    input.classList.remove('error');
    
    const errorElement = input.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// =============================================================================
// SHIPPING AND PAYMENT METHODS
// =============================================================================

function updateShippingCost() {
    const selectedMethod = document.querySelector('input[name="shippingMethod"]:checked');
    if (!selectedMethod) return;
    
    const shippingCost = selectedMethod.value === 'express' ? 500 : 0;
    orderSummary.shipping = shippingCost;
    orderSummary.total = orderSummary.subtotal - orderSummary.discount + orderSummary.shipping;
    
    renderOrderSummary();
    
    // Update shipping method visual selection
    const shippingMethods = document.querySelectorAll('.shipping-method');
    shippingMethods.forEach(method => {
        const radio = method.querySelector('input[type="radio"]');
        if (radio && radio.checked) {
            method.classList.add('active');
        } else {
            method.classList.remove('active');
        }
    });
}

function updatePaymentMethod() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        const radio = method.querySelector('input[type="radio"]');
        if (radio && radio.checked) {
            method.classList.add('active');
        } else {
            method.classList.remove('active');
        }
    });
}

function updatePlaceOrderButton() {
    const termsCheckbox = document.getElementById('agreeTerms');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (termsCheckbox && placeOrderBtn) {
        placeOrderBtn.disabled = !termsCheckbox.checked;
    }
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
        showCheckoutPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_ENDPOINTS.checkout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=calculate-total&promoCode=${encodeURIComponent(promoCode)}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && !data.error) {
            orderSummary.subtotal = parseFloat(data.subtotal || 0);
            orderSummary.discount = parseFloat(data.discountAmount || 0);
            orderSummary.total = parseFloat(data.finalTotal || 0);
            
            appliedPromoCode = promoCode;
            
            renderOrderSummary();
            renderOrderReview(); // Update review with new totals
            
            if (data.promoMessage) {
                showCheckoutPromoMessage(data.promoMessage, orderSummary.discount > 0 ? 'success' : 'error');
            }
            
            if (orderSummary.discount > 0) {
                promoInput.disabled = true;
                
                // Change apply button to remove button
                const applyButton = promoInput.nextElementSibling;
                if (applyButton) {
                    applyButton.innerHTML = '<i class="fas fa-times"></i>';
                    applyButton.onclick = clearCheckoutPromo;
                    applyButton.classList.add('remove-promo');
                }
            }
        } else {
            showCheckoutPromoMessage(data.message || 'Invalid promo code', 'error');
        }
        
    } catch (error) {
        console.error('Promo validation failed:', error);
        showCheckoutPromoMessage('Failed to validate promo code', 'error');
    }
}

function clearCheckoutPromo() {
    const promoInput = document.getElementById('checkoutPromoCode');
    const applyButton = document.querySelector('.btn-apply-promo');
    
    appliedPromoCode = null;
    orderSummary.discount = 0;
    orderSummary.total = orderSummary.subtotal + orderSummary.shipping;
    
    if (promoInput) {
        promoInput.value = '';
        promoInput.disabled = false;
    }
    
    if (applyButton) {
        applyButton.innerHTML = '<i class="fas fa-tag"></i>';
        applyButton.onclick = applyCheckoutPromo;
        applyButton.classList.remove('remove-promo');
    }
    
    renderOrderSummary();
    renderOrderReview();
    showCheckoutPromoMessage('Promo code removed', 'info');
}

function showCheckoutPromoMessage(message, type) {
    const promoMessage = document.getElementById('checkoutPromoMessage');
    if (!promoMessage) return;
    
    promoMessage.textContent = message;
    promoMessage.className = `promo-message ${type}`;
    promoMessage.style.display = 'block';
    
    setTimeout(() => {
        promoMessage.style.display = 'none';
    }, 5000);
}

// =============================================================================
// ORDER PLACEMENT
// =============================================================================

async function placeOrder() {
    if (isProcessingOrder) return;
    
    // Final validation
    if (!validateShippingForm()) {
        showStep(2);
        return;
    }
    
    const termsCheckbox = document.getElementById('agreeTerms');
    if (!termsCheckbox || !termsCheckbox.checked) {
        showNotification('Please agree to the terms and conditions', 'error');
        return;
    }
    
    try {
        isProcessingOrder = true;
        showLoadingOverlay('Processing your order...');
        
        // Collect form data
        const formData = collectOrderData();
        
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
        
        const data = await response.json();
        
        if (data.success) {
            // Order placed successfully
            const orderNumber = data.orderNumber;
            showOrderConfirmation(orderNumber);
            showStep(4);
            
            // Clear cart badge in navbar
            if (typeof updateNavbarCartBadges === 'function') {
                updateNavbarCartBadges(0);
            }
            
        } else {
            throw new Error(data.message || 'Failed to place order');
        }
        
    } catch (error) {
        console.error('Order placement failed:', error);
        showNotification(`Order placement failed: ${error.message}`, 'error');
    } finally {
        isProcessingOrder = false;
        hideLoadingOverlay();
    }
}

function collectOrderData() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const shippingAddress = document.getElementById('shippingAddress').value.trim();
    const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    const params = new URLSearchParams();
    params.append('action', 'place-order');
    params.append('customerName', customerName);
    params.append('customerEmail', customerEmail);
    params.append('customerPhone', customerPhone);
    params.append('shippingAddress', shippingAddress);
    params.append('shippingMethod', shippingMethod);
    params.append('paymentMethod', paymentMethod);
    
    if (appliedPromoCode) {
        params.append('promoCode', appliedPromoCode);
    }
    
    return params.toString();
}

function showOrderConfirmation(orderNumber) {
    const confirmationOrderNumber = document.getElementById('confirmationOrderNumber');
    if (confirmationOrderNumber) {
        confirmationOrderNumber.textContent = orderNumber;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showLoadingOverlay(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const messageElement = overlay.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
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
// GLOBAL FUNCTION EXPORTS
// =============================================================================

window.nextStep = nextStep;
window.previousStep = previousStep;
window.placeOrder = placeOrder;
window.applyCheckoutPromo = applyCheckoutPromo;
window.clearCheckoutPromo = clearCheckoutPromo;

// =============================================================================
// KEYBOARD SHORTCUTS & EVENT HANDLERS
// =============================================================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any modals or overlays
        hideLoadingOverlay();
    }
    
    // Allow Enter key navigation in forms
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const currentStepElement = document.getElementById(`step${currentStep}`);
        if (currentStepElement) {
            const nextButton = currentStepElement.querySelector('.btn-next, .btn-place-order');
            if (nextButton && !nextButton.disabled) {
                e.preventDefault();
                nextButton.click();
            }
        }
    }
});

// Handle page unload warning if order is being processed
window.addEventListener('beforeunload', function(e) {
    if (isProcessingOrder) {
        e.preventDefault();
        e.returnValue = 'Your order is being processed. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Initialize step indicators on load
document.addEventListener('DOMContentLoaded', function() {
    updateStepIndicators(1);
});
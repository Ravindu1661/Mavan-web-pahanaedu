/**
 * PAHANA EDU - CUSTOMER CART JAVASCRIPT
 * Enhanced shopping cart functionality with modern UI
 * Works with CustomerController cart endpoints
 */

// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

let cart = [];
let appliedPromoCode = null;
let currentPromoData = null;
let pendingAction = null;

// API endpoints - Match CustomerController URLs
const API_ENDPOINTS = {
    cart: 'customer/cart',
    promo: 'customer/promo-validate',
    checkout: 'customer/checkout',
    products: 'customer/products'
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
});

async function initializeCart() {
    try {
        showLoadingState();
        
        // Initialize scroll animations
        initializeScrollAnimations();
        
        // Load cart data
        await loadCartData();
        
        // Load suggested products
        await loadSuggestedProducts();
        
        // Initialize event listeners
        initializeEventListeners();
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Failed to initialize cart:', error);
        showNotification('Failed to load cart data. Please refresh the page.', 'error');
        hideLoadingState();
    }
}

function initializeEventListeners() {
    // Quantity controls
    document.addEventListener('click', handleQuantityControls);
    
    // Remove item buttons
    document.addEventListener('click', handleRemoveItem);
    
    // Promo code input
    const promoInput = document.getElementById('promoCodeInput');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }
    
    // Clear cart confirmation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-clear-cart') || e.target.closest('.btn-clear-cart')) {
            e.preventDefault();
            showConfirmationModal(
                'Clear Cart',
                'Are you sure you want to remove all items from your cart?',
                clearEntireCart
            );
        }
    });
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

async function loadCartData() {
    try {
        const response = await fetch(API_ENDPOINTS.cart, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=get'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.items) {
            cart = data.items;
            renderCartItems();
            updateCartSummary();
            
            // Update navbar cart badge if function exists
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (typeof updateNavbarCartBadges === 'function') {
                updateNavbarCartBadges(totalItems);
            }
        } else if (data && data.error) {
            console.warn('Cart loading issue:', data.message);
            cart = [];
            renderCartItems();
            updateCartSummary();
        }
        
    } catch (error) {
        console.error('Failed to load cart:', error);
        showNotification('Failed to load cart data', 'error');
        cart = [];
        renderCartItems();
        updateCartSummary();
    }
}

async function loadSuggestedProducts() {
    try {
        const response = await fetch(API_ENDPOINTS.products, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=list'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            // Get random 4 products that are not in cart
            const cartProductIds = cart.map(item => item.productId);
            const availableProducts = data.filter(product => 
                !cartProductIds.includes(product.id) && 
                product.status === 'active' && 
                product.stockQuantity > 0
            );
            
            const suggestedProducts = availableProducts
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
            
            renderSuggestedProducts(suggestedProducts);
        }
        
    } catch (error) {
        console.error('Failed to load suggested products:', error);
    }
}

// =============================================================================
// RENDERING FUNCTIONS
// =============================================================================

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartLoadingState = document.getElementById('cartLoadingState');
    const emptyCartState = document.getElementById('emptyCartState');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSummaryCard = document.getElementById('cartSummaryCard');
    
    if (!cartItemsContainer) return;
    
    // Hide loading state
    if (cartLoadingState) {
        cartLoadingState.style.display = 'none';
    }
    
    if (cart.length === 0) {
        // Show empty cart state
        if (emptyCartState) emptyCartState.style.display = 'block';
        if (cartItemsList) cartItemsList.style.display = 'none';
        if (cartSummaryCard) cartSummaryCard.style.display = 'none';
    } else {
        // Show cart items
        if (emptyCartState) emptyCartState.style.display = 'none';
        if (cartItemsList) cartItemsList.style.display = 'block';
        if (cartSummaryCard) cartSummaryCard.style.display = 'block';
        
        const cartItemsHTML = cart.map(item => createCartItemHTML(item)).join('');
        cartItemsList.innerHTML = cartItemsHTML;
    }
}

function createCartItemHTML(item) {
    const totalPrice = parseFloat(item.totalPrice || 0);
    const unitPrice = parseFloat(item.unitPrice || 0);
    
    return `
        <div class="cart-item-card fade-in" data-product-id="${item.productId}">
            <div class="item-image">
                <img src="${item.productImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}" 
                     alt="${escapeHtml(item.productTitle)}"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
            </div>
            
            <div class="item-details">
                <div class="item-info">
                    <h3 class="item-title">${escapeHtml(item.productTitle)}</h3>
                    <div class="item-price">
                        <span class="current-price">Rs. ${unitPrice.toFixed(2)}</span>
                        <span class="stock-status">In Stock</span>
                    </div>
                </div>
                
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn decrease" data-product-id="${item.productId}" data-action="decrease">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" readonly>
                        <button class="qty-btn increase" data-product-id="${item.productId}" data-action="increase">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="item-actions">
                        <button class="btn-remove-item" data-product-id="${item.productId}">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="item-total">
                <span class="total-label">Total</span>
                <span class="total-price">Rs. ${totalPrice.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function renderSuggestedProducts(products) {
    const suggestedContainer = document.getElementById('suggestedProducts');
    if (!suggestedContainer || products.length === 0) return;
    
    const html = products.map(product => {
        const displayPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
        const isOnOffer = product.offerPrice && product.offerPrice > 0;
        
        return `
            <div class="suggested-item" onclick="viewProduct(${product.id})">
                <div class="suggested-image">
                    <img src="${product.imagePath || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}" 
                         alt="${escapeHtml(product.title)}"
                         onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'">
                    ${isOnOffer ? '<div class="offer-badge">SALE</div>' : ''}
                </div>
                <div class="suggested-info">
                    <h4>${escapeHtml(product.title)}</h4>
                    <div class="suggested-price">
                        <span class="price">Rs. ${parseFloat(displayPrice).toFixed(2)}</span>
                        ${isOnOffer ? `<span class="original-price">Rs. ${parseFloat(product.price).toFixed(2)}</span>` : ''}
                    </div>
                    <button class="btn-add-suggested" onclick="event.stopPropagation(); addToCartFromSuggested(${product.id})">
                        <i class="fas fa-plus"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    suggestedContainer.innerHTML = html;
}

function updateCartSummary() {
    const totalItemsCount = document.getElementById('totalItemsCount');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmount = document.getElementById('totalAmount');
    const discountAmount = document.getElementById('discountAmount');
    const appliedPromo = document.getElementById('appliedPromo');
    
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);
    
    let discount = 0;
    let finalTotal = subtotal;
    
    // Apply promo discount if available
    if (currentPromoData && appliedPromoCode) {
        if (currentPromoData.discountType === 'percentage') {
            discount = (subtotal * currentPromoData.discountValue) / 100;
        } else if (currentPromoData.discountType === 'fixed') {
            discount = Math.min(currentPromoData.discountValue, subtotal);
        }
        finalTotal = Math.max(0, subtotal - discount);
        
        if (appliedPromo) appliedPromo.style.display = 'block';
        if (discountAmount) discountAmount.textContent = discount.toFixed(2);
    } else {
        if (appliedPromo) appliedPromo.style.display = 'none';
    }
    
    if (totalItemsCount) totalItemsCount.textContent = itemCount;
    if (subtotalAmount) subtotalAmount.textContent = subtotal.toFixed(2);
    if (totalAmount) totalAmount.textContent = finalTotal.toFixed(2);
}

// =============================================================================
// CART OPERATIONS
// =============================================================================

function handleQuantityControls(e) {
    if (e.target.classList.contains('qty-btn') || e.target.closest('.qty-btn')) {
        const button = e.target.classList.contains('qty-btn') ? e.target : e.target.closest('.qty-btn');
        const productId = button.dataset.productId;
        const action = button.dataset.action;
        
        if (productId && action) {
            updateQuantity(productId, action);
        }
    }
}

function handleRemoveItem(e) {
    if (e.target.classList.contains('btn-remove-item') || e.target.closest('.btn-remove-item')) {
        const button = e.target.classList.contains('btn-remove-item') ? e.target : e.target.closest('.btn-remove-item');
        const productId = button.dataset.productId;
        
        if (productId) {
            showConfirmationModal(
                'Remove Item',
                'Are you sure you want to remove this item from your cart?',
                () => removeItem(productId)
            );
        }
    }
}

async function updateQuantity(productId, action) {
    try {
        const cartItem = cart.find(item => item.productId == productId);
        if (!cartItem) return;
        
        let newQuantity = cartItem.quantity;
        if (action === 'increase') {
            newQuantity++;
        } else if (action === 'decrease' && newQuantity > 1) {
            newQuantity--;
        } else if (action === 'decrease' && newQuantity === 1) {
            // If trying to decrease below 1, show confirmation to remove
            showConfirmationModal(
                'Remove Item',
                'This will remove the item from your cart. Continue?',
                () => removeItem(productId)
            );
            return;
        }
        
        const response = await fetch(API_ENDPOINTS.cart, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=update&productId=${productId}&quantity=${newQuantity}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            await loadCartData();
            showNotification('Cart updated successfully', 'success');
        } else {
            showNotification(data.message || 'Failed to update cart', 'error');
        }
        
    } catch (error) {
        console.error('Update quantity failed:', error);
        showNotification('Failed to update cart', 'error');
    }
}

async function removeItem(productId) {
    try {
        const response = await fetch(API_ENDPOINTS.cart, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=remove&productId=${productId}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            await loadCartData();
            await loadSuggestedProducts(); // Refresh suggestions
            showNotification('Item removed from cart', 'info');
        } else {
            showNotification(data.message || 'Failed to remove item', 'error');
        }
        
    } catch (error) {
        console.error('Remove item failed:', error);
        showNotification('Failed to remove item', 'error');
    }
}

async function clearEntireCart() {
    try {
        const response = await fetch(API_ENDPOINTS.cart, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=clear'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            cart = [];
            appliedPromoCode = null;
            currentPromoData = null;
            renderCartItems();
            updateCartSummary();
            clearPromoCode();
            await loadSuggestedProducts();
            showNotification('Cart cleared successfully', 'info');
        } else {
            showNotification(data.message || 'Failed to clear cart', 'error');
        }
        
    } catch (error) {
        console.error('Clear cart failed:', error);
        showNotification('Failed to clear cart', 'error');
    }
}

async function addToCartFromSuggested(productId) {
    try {
        const response = await fetch(API_ENDPOINTS.cart, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add&productId=${productId}&quantity=1`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            await loadCartData();
            await loadSuggestedProducts();
            showNotification('Product added to cart', 'success');
        } else {
            showNotification(data.message || 'Failed to add product', 'error');
        }
        
    } catch (error) {
        console.error('Add to cart failed:', error);
        showNotification('Failed to add product to cart', 'error');
    }
}

// =============================================================================
// PROMO CODE FUNCTIONALITY
// =============================================================================

async function applyPromoCode() {
    const promoInput = document.getElementById('promoCodeInput');
    const promoMessage = document.getElementById('promoMessage');
    
    if (!promoInput || !promoMessage) return;
    
    const promoCode = promoInput.value.trim();
    if (!promoCode) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_ENDPOINTS.promo, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `code=${encodeURIComponent(promoCode)}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.valid) {
            appliedPromoCode = promoCode;
            currentPromoData = data;
            updateCartSummary();
            showPromoMessage(`${data.message} - ${data.description}`, 'success');
            promoInput.disabled = true;
            
            // Change apply button to remove button
            const applyButton = document.querySelector('.btn-apply-promo');
            if (applyButton) {
                applyButton.innerHTML = '<i class="fas fa-times"></i> Remove';
                applyButton.onclick = clearPromoCode;
                applyButton.classList.add('remove-promo');
            }
        } else {
            showPromoMessage(data.message || 'Invalid promo code', 'error');
        }
        
    } catch (error) {
        console.error('Promo validation failed:', error);
        showPromoMessage('Failed to validate promo code', 'error');
    }
}

function clearPromoCode() {
    const promoInput = document.getElementById('promoCodeInput');
    const applyButton = document.querySelector('.btn-apply-promo');
    
    appliedPromoCode = null;
    currentPromoData = null;
    
    if (promoInput) {
        promoInput.value = '';
        promoInput.disabled = false;
    }
    
    if (applyButton) {
        applyButton.innerHTML = '<i class="fas fa-tag"></i> Apply';
        applyButton.onclick = applyPromoCode;
        applyButton.classList.remove('remove-promo');
    }
    
    updateCartSummary();
    showPromoMessage('Promo code removed', 'info');
}

function showPromoMessage(message, type) {
    const promoMessage = document.getElementById('promoMessage');
    if (!promoMessage) return;
    
    promoMessage.textContent = message;
    promoMessage.className = `promo-message ${type}`;
    promoMessage.style.display = 'block';
    
    setTimeout(() => {
        promoMessage.style.display = 'none';
    }, 5000);
}

// =============================================================================
// CHECKOUT FUNCTIONALITY
// =============================================================================

async function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    try {
        // Validate cart before proceeding
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
        
        if (data.valid) {
            // Cart is valid, proceed to checkout
            window.location.href = 'customer/checkout';
        } else {
            // Show validation issues
            const issues = data.issues || [];
            if (issues.length > 0) {
                showNotification(`Cart validation failed: ${issues.join(', ')}`, 'error');
                // Reload cart to reflect changes
                await loadCartData();
            } else {
                showNotification('Cart validation failed', 'error');
            }
        }
        
    } catch (error) {
        console.error('Checkout validation failed:', error);
        showNotification('Failed to validate cart. Please try again.', 'error');
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function viewProduct(productId) {
    window.location.href = `customer/product-details?id=${productId}`;
}

function showLoadingState() {
    const cartLoadingState = document.getElementById('cartLoadingState');
    if (cartLoadingState) {
        cartLoadingState.style.display = 'block';
    }
}

function hideLoadingState() {
    const cartLoadingState = document.getElementById('cartLoadingState');
    if (cartLoadingState) {
        cartLoadingState.style.display = 'none';
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

function showConfirmationModal(title, message, confirmCallback) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmButton = document.getElementById('confirmButton');
    
    if (!modal || !modalTitle || !modalMessage || !confirmButton) return;
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    pendingAction = confirmCallback;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        pendingAction = null;
    }
}

function confirmAction() {
    if (pendingAction && typeof pendingAction === 'function') {
        pendingAction();
    }
    closeConfirmationModal();
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

window.applyPromoCode = applyPromoCode;
window.clearPromoCode = clearPromoCode;
window.proceedToCheckout = proceedToCheckout;
window.clearEntireCart = clearEntireCart;
window.viewProduct = viewProduct;
window.addToCartFromSuggested = addToCartFromSuggested;
window.closeConfirmationModal = closeConfirmationModal;
window.confirmAction = confirmAction;

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeConfirmationModal();
    }
});/**
 * 
 */
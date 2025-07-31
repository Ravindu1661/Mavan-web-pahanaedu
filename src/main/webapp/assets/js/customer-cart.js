/**
 * PAHANA EDU - NEW CUSTOMER CART JAVASCRIPT
 * Modern cart functionality with enhanced UI/UX
 * No promo code functionality - simplified cart experience
 */

// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

let cart = [];
let isLoading = false;
let pendingAction = null;

// API endpoints
const API_ENDPOINTS = {
    cart: 'customer/cart',
    products: 'customer/products'
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    console.log('Initializing new cart page...'); // Debug log
    
    try {
        // Initialize animations and event listeners
        initializeScrollAnimations();
        initializeEventListeners();
        
        // Load cart data
        loadCart();
        
    } catch (error) {
        console.error('Failed to initialize cart page:', error);
        showNotification('Failed to load cart. Please refresh the page.', 'error');
    }
}

function initializeEventListeners() {
    // Quantity controls
    document.addEventListener('click', handleQuantityControls);
    
    // Remove item controls
    document.addEventListener('click', handleRemoveControls);
    
    // Clear cart confirmation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-clear') || e.target.closest('.btn-clear')) {
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

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// =============================================================================
// CART LOADING AND DISPLAY
// =============================================================================

async function loadCart() {
    try {
        isLoading = true;
        console.log('Loading cart...'); // Debug log
        
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
        console.log('Cart data received:', data); // Debug log
        
        // Handle different possible data structures
        let cartItems = [];
        
        if (data && data.items && Array.isArray(data.items)) {
            cartItems = data.items;
        } else if (data && Array.isArray(data)) {
            cartItems = data;
        } else if (data && data.error) {
            console.warn('Cart loading issue:', data.message);
            cartItems = [];
        } else {
            console.log('Unexpected cart data structure:', data);
            cartItems = [];
        }
        
        cart = cartItems;
        console.log('Processed cart items:', cart); // Debug log
        
        displayCart();
        updateCartSummary();
        
        // Update navbar cart badge if function exists
        const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        console.log('Total cart items:', totalItems); // Debug log
        
        if (typeof updateNavbarCartBadges === 'function') {
            updateNavbarCartBadges(totalItems);
        }
        
    } catch (error) {
        console.error('Failed to load cart:', error);
        showNotification('Failed to load cart', 'error');
        cart = [];
        displayCart();
        updateCartSummary();
    } finally {
        isLoading = false;
    }
}

function displayCart() {
    console.log('Displaying cart with items:', cart); // Debug log
    
    const loadingState = document.getElementById('cartLoadingState');
    const emptyCartState = document.getElementById('emptyCartState');
    const cartItemsList = document.getElementById('cartItemsList');
    const orderSummary = document.getElementById('orderSummary');
    
    // Hide loading state
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (!cart || cart.length === 0) {
        console.log('Cart is empty, showing empty state');
        // Show empty cart state
        if (emptyCartState) {
            emptyCartState.style.display = 'block';
        }
        if (cartItemsList) {
            cartItemsList.style.display = 'none';
        }
        if (orderSummary) {
            orderSummary.style.display = 'none';
        }
        return; // Important: exit function here for empty cart
    }
    
    console.log('Cart has items, displaying them');
    
    // Hide empty state, show cart items and summary
    if (emptyCartState) {
        emptyCartState.style.display = 'none';
    }
    if (cartItemsList) {
        cartItemsList.style.display = 'block';
        const itemsHTML = cart.map(item => createCartItemHTML(item)).join('');
        console.log('Generated HTML for cart items'); // Debug log
        cartItemsList.innerHTML = itemsHTML;
    }
    if (orderSummary) {
        orderSummary.style.display = 'block';
    }
}

function createCartItemHTML(item) {
    console.log('Creating HTML for cart item:', item); // Debug log
    
    if (!item) {
        console.error('Cart item is null or undefined');
        return '';
    }
    
    const subtotal = (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)).toFixed(2);
    
    // FIXED: Handle image path properly (matching dashboard logic)
    let imageSrc = item.productImage;
    
    // Check if imageSrc exists and is not empty
    if (imageSrc && imageSrc.trim() !== '') {
        // Only add 'uploads/' if it's not already there and doesn't start with http/https
        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('uploads/')) {
            imageSrc = 'uploads/' + imageSrc;
        }
    } else {
        // Use default image if no image path
        imageSrc = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
    }
    
    console.log('Final image source for cart item:', imageSrc); // Debug log
    
    return `
        <div class="cart-item fade-in" data-product-id="${item.productId || ''}">
            <div class="item-image">
                <img src="${imageSrc}" 
                     alt="${escapeHtml(item.productTitle || 'Product')}"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'"
                     onload="console.log('Cart image loaded successfully:', this.src)">
            </div>
            
            <div class="item-details">
                <div class="item-info">
                    <h3>${escapeHtml(item.productTitle || 'Unknown Product')}</h3>
                    <div class="item-price">Rs. ${parseFloat(item.unitPrice || 0).toFixed(2)}</div>
                    <div class="item-meta">
                        <span><i class="fas fa-check-circle"></i> In Stock</span>
                        <span><i class="fas fa-truck"></i> Free Shipping</span>
                    </div>
                </div>
                
                <div class="quantity-controls">
                    <button class="qty-btn" data-product-id="${item.productId || ''}" data-action="decrease">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="qty-input" value="${item.quantity || 0}" 
                           min="1" max="99" data-product-id="${item.productId || ''}" readonly>
                    <button class="qty-btn" data-product-id="${item.productId || ''}" data-action="increase">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            
            <div class="item-total">
                <div class="item-subtotal">Rs. ${subtotal}</div>
                <button class="btn-remove" data-product-id="${item.productId || ''}">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
        </div>
    `;
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
    
    // Handle direct input changes
    if (e.target.classList.contains('qty-input')) {
        const input = e.target;
        const productId = input.dataset.productId;
        const newQuantity = parseInt(input.value) || 1;
        
        if (productId) {
            updateQuantityDirect(productId, newQuantity);
        }
    }
}

function handleRemoveControls(e) {
    if (e.target.classList.contains('btn-remove') || e.target.closest('.btn-remove')) {
        const button = e.target.classList.contains('btn-remove') ? e.target : e.target.closest('.btn-remove');
        const productId = button.dataset.productId;
        
        if (productId) {
            const item = cart.find(item => item.productId == productId);
            const itemTitle = item ? item.productTitle : 'this item';
            
            showConfirmationModal(
                'Remove Item',
                `Are you sure you want to remove "${itemTitle}" from your cart?`,
                () => removeFromCart(productId)
            );
        }
    }
}

async function updateQuantity(productId, action) {
    try {
        const cartItem = cart.find(item => item.productId == productId);
        if (!cartItem) return;
        
        let newQuantity = parseInt(cartItem.quantity) || 1;
        if (action === 'increase') {
            newQuantity++;
        } else if (action === 'decrease' && newQuantity > 1) {
            newQuantity--;
        }
        
        if (newQuantity === parseInt(cartItem.quantity)) return;
        
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
            await loadCart();
            showNotification('Cart updated successfully', 'success');
        } else {
            showNotification(data.message || 'Failed to update cart', 'error');
        }
        
    } catch (error) {
        console.error('Update quantity failed:', error);
        showNotification('Failed to update quantity', 'error');
    }
}

async function updateQuantityDirect(productId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;
    
    try {
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
            await loadCart();
        } else {
            showNotification(data.message || 'Failed to update cart', 'error');
            await loadCart(); // Reload to reset the input value
        }
        
    } catch (error) {
        console.error('Update quantity failed:', error);
        showNotification('Failed to update quantity', 'error');
        await loadCart(); // Reload to reset the input value
    }
}

async function removeFromCart(productId) {
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
            await loadCart();
            showNotification('Item removed from cart', 'info');
        } else {
            showNotification(data.message || 'Failed to remove item', 'error');
        }
        
    } catch (error) {
        console.error('Remove from cart failed:', error);
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
            await loadCart();
            showNotification('Cart cleared successfully', 'info');
        } else {
            showNotification(data.message || 'Failed to clear cart', 'error');
        }
        
    } catch (error) {
        console.error('Clear cart failed:', error);
        showNotification('Failed to clear cart', 'error');
    }
}

// =============================================================================
// CART SUMMARY
// =============================================================================

function updateCartSummary() {
    console.log('Updating cart summary with cart:', cart); // Debug log
    
    const totalItemsCount = document.getElementById('totalItemsCount');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    if (!cart || cart.length === 0) {
        console.log('Cart is empty, setting summary to zero');
        if (totalItemsCount) totalItemsCount.textContent = '0';
        if (subtotalAmount) subtotalAmount.textContent = '0.00';
        if (totalAmount) totalAmount.textContent = '0.00';
        return;
    }
    
    const itemCount = cart.reduce((sum, item) => {
        const qty = parseInt(item.quantity) || 0;
        console.log(`Item ${item.productTitle}: quantity = ${qty}`);
        return sum + qty;
    }, 0);
    
    const subtotal = cart.reduce((sum, item) => {
        const total = parseFloat(item.totalPrice) || 0;
        console.log(`Item ${item.productTitle}: totalPrice = ${total}`);
        return sum + total;
    }, 0);
    
    console.log(`Summary - Items: ${itemCount}, Subtotal: ${subtotal}`); // Debug log
    
    if (totalItemsCount) totalItemsCount.textContent = itemCount.toString();
    if (subtotalAmount) subtotalAmount.textContent = subtotal.toFixed(2);
    if (totalAmount) totalAmount.textContent = subtotal.toFixed(2); // No discount in new design
}

// =============================================================================
// CHECKOUT NAVIGATION
// =============================================================================

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'customer/checkout';
}

// =============================================================================
// CONFIRMATION MODAL
// =============================================================================

function showConfirmationModal(title, message, confirmCallback) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmButton = document.getElementById('confirmButton');
    
    if (modal && modalTitle && modalMessage && confirmButton) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        pendingAction = confirmCallback;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add modal styles if not present
        if (!document.querySelector('#modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .modal-content {
                    background: var(--white);
                    border-radius: var(--border-radius);
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-lg);
                }
                
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--gradient-primary);
                    color: var(--white);
                    border-radius: var(--border-radius) var(--border-radius) 0 0;
                }
                
                .modal-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--white);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: var(--transition);
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .modal-body {
                    padding: 2rem 1.5rem;
                    text-align: center;
                }
                
                .modal-body p {
                    margin: 0;
                    color: var(--text-primary);
                    line-height: 1.5;
                }
                
                .modal-footer {
                    padding: 1rem 1.5rem 1.5rem;
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    border-top: 1px solid var(--border-light);
                }
                
                .btn-cancel {
                    padding: 0.75rem 1.5rem;
                    border: 2px solid var(--border-light);
                    background: var(--white);
                    color: var(--text-primary);
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    font-weight: 600;
                    transition: var(--transition);
                }
                
                .btn-cancel:hover {
                    border-color: var(--text-primary);
                }
                
                .btn-confirm {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    background: var(--danger-color);
                    color: var(--white);
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    font-weight: 600;
                    transition: var(--transition);
                }
                
                .btn-confirm:hover {
                    background: #d61355;
                    transform: translateY(-1px);
                }
            `;
            document.head.appendChild(styles);
        }
    }
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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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
// KEYBOARD SHORTCUTS
// =============================================================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeConfirmationModal();
    }
});

// =============================================================================
// EXPORT FOR GLOBAL ACCESS
// =============================================================================

window.clearEntireCart = clearEntireCart;
window.proceedToCheckout = proceedToCheckout;
window.closeConfirmationModal = closeConfirmationModal;
window.confirmAction = confirmAction;
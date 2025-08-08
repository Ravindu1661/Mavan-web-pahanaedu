/**
 * PAHANA EDU - CUSTOMER ORDERS JAVASCRIPT (UPDATED VERSION)
 * Complete order management without shipped/delivered status
 * Confirmed orders count instead of completed orders
 */

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
let ordersPerPage = 10;
let isLoading = false;
let selectedOrderId = null;

// API endpoints
const API_ENDPOINTS = {
    orders: 'customer/orders'
};

// Order status configurations - REMOVED shipped and delivered
const ORDER_STATUS_CONFIG = {
    pending: { icon: 'fas fa-clock', color: '#FF9800', label: 'Pending' },
    confirmed: { icon: 'fas fa-check', color: '#17A2B8', label: 'Confirmed' },
    processing: { icon: 'fas fa-cogs', color: '#0077B6', label: 'Processing' },
    completed: { icon: 'fas fa-check-circle', color: '#38B000', label: 'Completed' },
    cancelled: { icon: 'fas fa-times-circle', color: '#D00000', label: 'Cancelled' }
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeOrdersPage();
});

async function initializeOrdersPage() {
    try {
        console.log('Initializing orders page...');
        
        initializeScrollAnimations();
        initializeEventListeners();
        await loadOrders();
        
    } catch (error) {
        console.error('Failed to initialize orders page:', error);
        showNotification('Failed to load orders. Please refresh the page.', 'error');
    }
}

function initializeEventListeners() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchOrder = document.getElementById('searchOrder');
    
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
    if (searchOrder) {
        let searchTimeout;
        searchOrder.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });
    }
    
    // Modal event listeners
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeOrderModal();
            closeCancelModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeOrderModal();
            closeCancelModal();
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

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// =============================================================================
// DATA LOADING
// =============================================================================

async function loadOrders() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoadingState();
        
        const response = await fetch(API_ENDPOINTS.orders, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=list'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Orders data received:', data);
        
        if (Array.isArray(data)) {
            allOrders = data;
            filteredOrders = [...allOrders];
            updateOrdersStats();
            displayOrders();
            updatePagination();
        } else if (data?.error) {
            throw new Error(data.message || 'Failed to load orders');
        } else {
            allOrders = [];
            filteredOrders = [];
            displayOrders();
        }
        
    } catch (error) {
        console.error('Failed to load orders:', error);
        showNotification(`Failed to load orders: ${error.message}`, 'error');
        showErrorState();
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// =============================================================================
// DISPLAY FUNCTIONS
// =============================================================================

function showLoadingState() {
    const loadingState = document.getElementById('ordersLoadingState');
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyOrdersState');
    const pagination = document.getElementById('paginationContainer');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (ordersList) ordersList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
}

function hideLoadingState() {
    const loadingState = document.getElementById('ordersLoadingState');
    if (loadingState) loadingState.style.display = 'none';
}

function showErrorState() {
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyOrdersState');
    const pagination = document.getElementById('paginationContainer');
    
    if (ordersList) ordersList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    if (pagination) pagination.style.display = 'none';
}

// UPDATED STATS CALCULATION - Confirmed Orders instead of Completed
function updateOrdersStats() {
    const totalOrdersEl = document.getElementById('totalOrders');
    const pendingOrdersEl = document.getElementById('pendingOrders');
    const confirmedOrdersEl = document.getElementById('confirmedOrders'); // Changed from completedOrders
    const totalSpentEl = document.getElementById('totalSpent');
    
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
    const confirmedOrders = allOrders.filter(order => 
        ['confirmed', 'processing', 'completed'].includes(order.status) // Updated logic
    ).length;
    const totalSpent = allOrders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + parseFloat(order.finalAmount || 0), 0);
    
    if (totalOrdersEl) animateCounter(totalOrdersEl, totalOrders);
    if (pendingOrdersEl) animateCounter(pendingOrdersEl, pendingOrders);
    if (confirmedOrdersEl) animateCounter(confirmedOrdersEl, confirmedOrders);
    if (totalSpentEl) animateCounter(totalSpentEl, totalSpent, 'Rs. ', '.00');
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyOrdersState');
    const pagination = document.getElementById('paginationContainer');
    
    if (!ordersList) return;
    
    if (filteredOrders.length === 0) {
        ordersList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToDisplay = filteredOrders.slice(startIndex, endIndex);
    
    ordersList.innerHTML = ordersToDisplay.map(order => createOrderCardHTML(order)).join('');
    ordersList.style.display = 'flex';
    
    if (filteredOrders.length > ordersPerPage) {
        if (pagination) pagination.style.display = 'block';
        updatePagination();
    } else {
        if (pagination) pagination.style.display = 'none';
    }
    
    setTimeout(() => initializeScrollAnimations(), 100);
}

function createOrderCardHTML(order) {
    const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
    const orderDate = formatDate(order.createdAt);
    const canCancel = ['pending', 'confirmed'].includes(order.status);
    
    console.log('Creating order card for:', order);
    
    // Get order items with proper fallback
    let orderItems = [];
    let totalItems = 0;
    
    if (Array.isArray(order.orderItems)) {
        orderItems = order.orderItems.slice(0, 2);
        totalItems = order.orderItems.length;
    } else if (Array.isArray(order.items)) {
        orderItems = order.items.slice(0, 2);
        totalItems = order.items.length;
    } else {
        orderItems = [];
        totalItems = 0;
    }
    
    const hasMoreItems = totalItems > 2;
    
    console.log('Order items count:', totalItems, 'Preview items:', orderItems.length);
    
    return `
        <div class="order-card fade-in">
            <div class="order-header">
                <div class="order-info">
                    <div class="order-number">#${escapeHtml(order.orderNumber)}</div>
                    <div class="order-date">${orderDate}</div>
                    <div class="customer-info">
                        <i class="fas fa-user"></i>
                        ${escapeHtml(order.customerName || 'Customer')}
                    </div>
                </div>
                <div class="order-status ${order.status}">
                    <i class="${statusConfig.icon}"></i>
                    ${statusConfig.label}
                </div>
            </div>
            
            <div class="order-body">
                ${orderItems.length > 0 ? `
                    <div class="order-items-preview">
                        <h4><i class="fas fa-box"></i> Order Items</h4>
                        <div class="order-items">
                            ${orderItems.map(item => createOrderItemHTML(item)).join('')}
                            ${hasMoreItems ? `
                                <div class="more-items-indicator">
                                    <i class="fas fa-plus-circle"></i>
                                    <span>+${totalItems - 2} more items</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : `
                    <div class="no-items-message">
                        <i class="fas fa-info-circle"></i>
                        <p>No item details available</p>
                    </div>
                `}
                
                <div class="order-summary">
                    <div class="summary-details">
                        <div class="summary-row">
                            <span><i class="fas fa-shopping-bag"></i> Items:</span>
                            <span>${totalItems} item${totalItems !== 1 ? 's' : ''}</span>
                        </div>
                        
                        ${order.discountAmount && parseFloat(order.discountAmount) > 0 ? `
                            <div class="summary-row discount">
                                <span><i class="fas fa-tag"></i> Discount:</span>
                                <span>-Rs. ${parseFloat(order.discountAmount).toFixed(2)}</span>
                            </div>
                        ` : ''}
                        
                        <div class="summary-row total">
                            <span><i class="fas fa-calculator"></i> Total:</span>
                            <span class="order-total">Rs. ${parseFloat(order.finalAmount).toFixed(2)}</span>
                        </div>
                        
                        ${order.shippingAddress ? `
                            <div class="summary-row address">
                                <span><i class="fas fa-map-marker-alt"></i> Ship to:</span>
                                <span class="shipping-preview">${escapeHtml(order.shippingAddress.substring(0, 30))}${order.shippingAddress.length > 30 ? '...' : ''}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn-view-details" onclick="viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        
                        ${canCancel ? `
                            <button class="btn-cancel-order" onclick="showCancelOrderModal(${order.id})">
                                <i class="fas fa-times"></i>
                                Cancel Order
                            </button>
                        ` : ''}
                        
                        ${order.status === 'completed' ? `
                            <button class="btn-reorder" onclick="reorderItems(${order.id})">
                                <i class="fas fa-redo"></i>
                                Reorder
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createOrderItemHTML(item) {
    console.log('Creating order item HTML for:', item);
    
    // Fixed image path handling
    let imageSrc = item.productImage || item.imagePath || item.image || '';
    
    if (imageSrc && imageSrc.trim() !== '') {
        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('uploads/')) {
            imageSrc = 'uploads/' + imageSrc;
        }
    } else {
        imageSrc = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
    }
    
    console.log('Final image source for order item:', imageSrc);
    
    return `
        <div class="order-item">
            <div class="item-image">
                <img src="${imageSrc}" 
                     alt="${escapeHtml(item.productTitle || item.title || 'Product')}"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'"
                     onload="console.log('Order item image loaded successfully:', this.src)"
                     loading="lazy">
            </div>
            <div class="item-details">
                <div class="item-title">${escapeHtml(item.productTitle || item.title || 'Unknown Product')}</div>
                ${(item.productAuthor || item.author) ? `<div class="item-author">by ${escapeHtml(item.productAuthor || item.author)}</div>` : ''}
                <div class="item-meta">
                    <span class="item-quantity"><i class="fas fa-cube"></i> Qty: ${item.quantity}</span>
                    <span class="item-unit-price"><i class="fas fa-tag"></i> Rs. ${parseFloat(item.unitPrice || item.price || 0).toFixed(2)}</span>
                </div>
            </div>
            <div class="item-price">
                <div class="price-label">Total</div>
                <div class="price-value">Rs. ${parseFloat(item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0))).toFixed(2)}</div>
            </div>
        </div>
    `;
}

// =============================================================================
// FILTERING AND PAGINATION
// =============================================================================

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    const searchQuery = document.getElementById('searchOrder')?.value.toLowerCase().trim() || '';
    
    console.log('Applying filters:', { statusFilter, dateFilter, searchQuery });
    
    filteredOrders = allOrders.filter(order => {
        // Status filter
        if (statusFilter && order.status !== statusFilter) return false;
        
        // Search filter
        if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery)) return false;
        
        // Date filter
        if (dateFilter && !matchesDateFilter(order.createdAt, dateFilter)) return false;
        
        return true;
    });
    
    currentPage = 1;
    displayOrders();
    updatePagination();
    
    console.log(`Filtered ${filteredOrders.length} orders from ${allOrders.length} total`);
}

function matchesDateFilter(orderDate, filter) {
    const now = new Date();
    const orderDateObj = new Date(orderDate);
    
    switch (filter) {
        case 'last7days':
            return (now - orderDateObj) <= (7 * 24 * 60 * 60 * 1000);
        case 'last30days':
            return (now - orderDateObj) <= (30 * 24 * 60 * 60 * 1000);
        case 'last3months':
            return (now - orderDateObj) <= (90 * 24 * 60 * 60 * 1000);
        case 'lastyear':
            return (now - orderDateObj) <= (365 * 24 * 60 * 60 * 1000);
        default:
            return true;
    }
}

function clearFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchOrder = document.getElementById('searchOrder');
    
    if (statusFilter) statusFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    if (searchOrder) searchOrder.value = '';
    
    filteredOrders = [...allOrders];
    currentPage = 1;
    
    displayOrders();
    updatePagination();
    
    showNotification('Filters cleared', 'info');
}

function updatePagination() {
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayOrders();
        updatePagination();
        
        const ordersSection = document.querySelector('.orders-section');
        if (ordersSection) ordersSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// =============================================================================
// ORDER DETAILS MODAL - UPDATED TIMELINE
// =============================================================================

async function viewOrderDetails(orderId) {
    try {
        console.log('Loading order details for:', orderId);
        
        const response = await fetch(API_ENDPOINTS.orders, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=details&orderId=${orderId}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Order details received:', data);
        
        if (data && !data.error) {
            displayOrderDetailsModal(data);
        } else {
            throw new Error(data.message || 'Failed to load order details');
        }
        
    } catch (error) {
        console.error('Failed to load order details:', error);
        showNotification(`Failed to load order details: ${error.message}`, 'error');
    }
}

function displayOrderDetailsModal(order) {
    const modal = document.getElementById('orderDetailsModal');
    const modalTitle = document.getElementById('orderModalTitle');
    const modalBody = document.getElementById('orderModalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.innerHTML = `
        <i class="fas fa-receipt"></i>
        Order #${order.orderNumber}
    `;
    
    const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
    const orderDate = formatDate(order.createdAt);
    
    let orderItems = order.orderItems || order.items || [];
    console.log('Order items for modal:', orderItems);
    
    modalBody.innerHTML = `
        <div class="order-details-header">
            <div class="order-details-info">
                <h4><i class="fas fa-shopping-cart"></i> Order #${escapeHtml(order.orderNumber)}</h4>
                <div class="order-meta">
                    <p><i class="fas fa-calendar-alt"></i> <strong>Placed on:</strong> ${orderDate}</p>
                    <p><i class="fas fa-user"></i> <strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
                    <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${escapeHtml(order.customerEmail)}</p>
                    ${order.customerPhone ? `<p><i class="fas fa-phone"></i> <strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</p>` : ''}
                </div>
            </div>
            <div class="order-details-status">
                <div class="order-status ${order.status}">
                    <i class="${statusConfig.icon}"></i>
                    ${statusConfig.label}
                </div>
            </div>
        </div>
        
        <div class="order-details-items">
            <h5><i class="fas fa-box"></i> Order Items (${orderItems.length} item${orderItems.length !== 1 ? 's' : ''})</h5>
            <div class="order-details-list">
                ${orderItems.length > 0 ? orderItems.map(item => createOrderDetailsItemHTML(item)).join('') : `
                    <div class="no-items">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>No item details available</p>
                    </div>
                `}
            </div>
        </div>
        
        <div class="order-pricing-breakdown">
            <h5><i class="fas fa-calculator"></i> Pricing Breakdown</h5>
            <div class="pricing-details">
                <div class="pricing-row">
                    <span><i class="fas fa-shopping-bag"></i> Items Subtotal:</span>
                    <span>Rs. ${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                
                ${order.discountAmount && parseFloat(order.discountAmount) > 0 ? `
                    <div class="pricing-row discount">
                        <span><i class="fas fa-tag"></i> Discount Applied:</span>
                        <span>-Rs. ${parseFloat(order.discountAmount).toFixed(2)}</span>
                    </div>
                ` : ''}
                
                <div class="pricing-row shipping">
                    <span><i class="fas fa-truck"></i> Shipping:</span>
                    <span>Free</span>
                </div>
                
                <div class="pricing-divider"></div>
                
                <div class="pricing-row total">
                    <span><i class="fas fa-receipt"></i> <strong>Final Total:</strong></span>
                    <span class="total-amount"><strong>Rs. ${parseFloat(order.finalAmount || 0).toFixed(2)}</strong></span>
                </div>
            </div>
        </div>
        
        <div class="order-details-shipping">
            <h5><i class="fas fa-truck"></i> Order Progress & Delivery Information</h5>
            <div class="shipping-info-card">
                <div class="shipping-address">
                    <div class="address-header">
                        <i class="fas fa-map-marker-alt"></i>
                        <strong>Delivery Address</strong>
                    </div>
                    <div class="address-content">
                        <p><strong>${escapeHtml(order.customerName)}</strong></p>
                        <p>${escapeHtml(order.shippingAddress || 'Address not provided')}</p>
                        ${order.customerPhone ? `<p><i class="fas fa-phone"></i> ${escapeHtml(order.customerPhone)}</p>` : ''}
                        <p><i class="fas fa-envelope"></i> ${escapeHtml(order.customerEmail)}</p>
                    </div>
                </div>
                
				<div class="delivery-timeline">
				    <div class="timeline-header">
				        <i class="fas fa-clock"></i>
				        <strong>Order Timeline</strong>
				    </div>
				    <div class="timeline-content">
				        <!-- Order Placed - Always completed -->
				        <div class="timeline-item completed">
				            <i class="fas fa-check-circle"></i>
				            <span>Order Placed - ${orderDate}</span>
				        </div>
				        
				        <!-- Order Confirmed -->
				        ${['confirmed', 'processing', 'completed'].includes(order.status) ? `
				            <div class="timeline-item completed">
				                <i class="fas fa-check-circle"></i>
				                <span>Order Confirmed</span>
				            </div>
				        ` : order.status === 'pending' ? `
				            <div class="timeline-item pending">
				                <i class="fas fa-clock"></i>
				                <span>Awaiting Confirmation</span>
				            </div>
				        ` : ''}
				        
				        <!-- Processing - Auto color when confirmed -->
				        ${['processing', 'completed'].includes(order.status) ? `
				            <div class="timeline-item completed">
				                <i class="fas fa-cogs"></i>
				                <span>Processing Your Order</span>
				            </div>
				        ` : ['confirmed'].includes(order.status) ? `
				            <div class="timeline-item completed">
				                <i class="fas fa-cogs"></i>
				                <span>Processing Your Order</span>
				            </div>
				        ` : !['cancelled'].includes(order.status) ? `
				            <div class="timeline-item future">
				                <i class="fas fa-circle"></i>
				                <span>Processing Your Order</span>
				            </div>
				        ` : ''}
				        
				        <!-- Completed - Shows delivery message -->
				        ${order.status === 'completed' ? `
				            <div class="timeline-item completed">
				                <i class="fas fa-truck-fast"></i>
				                <span>Your order will be delivered soon!</span>
				            </div>
				        ` : !['cancelled', 'pending'].includes(order.status) ? `
				            <div class="timeline-item future">
				                <i class="fas fa-truck"></i>
				                <span>Your order will be delivered soon!</span>
				            </div>
				        ` : ''}
				        
				        <!-- Cancelled -->
				        ${order.status === 'cancelled' ? `
				            <div class="timeline-item cancelled">
				                <i class="fas fa-times-circle"></i>
				                <span>Order Cancelled</span>
				            </div>
				        ` : ''}
				    </div>
				</div>
            </div>
        </div>
        
        ${order.promoCode ? `
            <div class="promo-info">
                <h5><i class="fas fa-tag"></i> Promo Code Applied</h5>
                <div class="promo-details">
                    <span class="promo-code">${escapeHtml(order.promoCode)}</span>
                    <span class="promo-savings">Saved Rs. ${parseFloat(order.discountAmount || 0).toFixed(2)}</span>
                </div>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    console.log('Order details modal displayed');
}

function createOrderDetailsItemHTML(item) {
    console.log('Creating detailed order item HTML for:', item);
    
    // Fixed image path handling
    let imageSrc = item.productImage || item.imagePath || item.image || '';
    
    if (imageSrc && imageSrc.trim() !== '') {
        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('uploads/')) {
            imageSrc = 'uploads/' + imageSrc;
        }
    } else {
        imageSrc = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
    }
    
    console.log('Final detailed image source:', imageSrc);
    
    return `
        <div class="order-details-item">
            <div class="details-item-image">
                <img src="${imageSrc}" 
                     alt="${escapeHtml(item.productTitle || item.title || 'Product')}"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'"
                     onload="console.log('Order details image loaded successfully:', this.src)"
                     loading="lazy">
                <div class="image-overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
            <div class="details-item-info">
                <div class="details-item-title">${escapeHtml(item.productTitle || item.title || 'Unknown Product')}</div>
                ${(item.productAuthor || item.author) ? `
                    <div class="details-item-author">
                        <i class="fas fa-user-edit"></i>
                        by ${escapeHtml(item.productAuthor || item.author)}
                    </div>
                ` : ''}
                
                ${(item.isbn || item.productIsbn) ? `
                    <div class="details-item-isbn">
                        <i class="fas fa-barcode"></i>
                        ISBN: ${escapeHtml(item.isbn || item.productIsbn)}
                    </div>
                ` : ''}
                
                <div class="details-item-meta">
                    <div class="meta-item">
                        <i class="fas fa-cube"></i>
                        <span><strong>Quantity:</strong> ${item.quantity}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span><strong>Unit Price:</strong> Rs. ${parseFloat(item.unitPrice || item.price || 0).toFixed(2)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-check-circle"></i>
                        <span class="stock-status">In Stock</span>
                    </div>
                </div>
                
                ${(item.description || item.productDescription) ? `
                    <div class="details-item-description">
                        <i class="fas fa-info-circle"></i>
                        <p>${escapeHtml((item.description || item.productDescription).substring(0, 120))}${(item.description || item.productDescription).length > 120 ? '...' : ''}</p>
                    </div>
                ` : ''}
            </div>
            <div class="details-item-pricing">
                <div class="pricing-breakdown">
                    <div class="unit-pricing">
                        <span class="label">Unit Price:</span>
                        <span class="value">Rs. ${parseFloat(item.unitPrice || item.price || 0).toFixed(2)}</span>
                    </div>
                    <div class="quantity-pricing">
                        <span class="label">× ${item.quantity}</span>
                        <span class="calculation">=</span>
                    </div>
                    <div class="total-pricing">
                        <span class="label">Total:</span>
                        <span class="details-total-price">Rs. ${parseFloat(item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0))).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function closeOrderModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// =============================================================================
// ORDER CANCELLATION
// =============================================================================

function showCancelOrderModal(orderId) {
    selectedOrderId = orderId;
    const modal = document.getElementById('cancelOrderModal');
    
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCancelModal() {
    const modal = document.getElementById('cancelOrderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        selectedOrderId = null;
    }
}

async function confirmCancelOrder() {
    if (!selectedOrderId) {
        showNotification('No order selected', 'error');
        return;
    }
    
    try {
        console.log('Cancelling order:', selectedOrderId);
        
        // Show loading state
        const cancelBtn = document.querySelector('.cancel-confirm');
        if (cancelBtn) {
            cancelBtn.disabled = true;
            cancelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
        }
        
        const response = await fetch(API_ENDPOINTS.orders, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=cancel&orderId=${selectedOrderId}`
        });
        
        console.log('Cancel response status:', response.status);
        
        const data = await response.json();
        console.log('Cancel response data:', data);
        
        if (data.success) {
            closeCancelModal();
            showNotification('Order cancelled successfully', 'success');
            await loadOrders(); // Reload orders to reflect changes
        } else {
            throw new Error(data.message || 'Failed to cancel order');
        }
        
    } catch (error) {
        console.error('Failed to cancel order:', error);
        showNotification(`Failed to cancel order: ${error.message}`, 'error');
    } finally {
        // Reset button state
        const cancelBtn = document.querySelector('.cancel-confirm');
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.innerHTML = 'Yes, Cancel Order';
        }
    }
}

// =============================================================================
// REORDER FUNCTIONALITY
// =============================================================================

async function reorderItems(orderId) {
    try {
        console.log('Reordering from order:', orderId);
        
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        
        let orderItems = order.orderItems || order.items || [];
        if (orderItems.length === 0) {
            throw new Error('No items found in this order');
        }
        
        let addedCount = 0;
        let failedItems = [];
        
        for (const item of orderItems) {
            try {
                const response = await fetch('customer/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=add&productId=${item.productId}&quantity=${item.quantity}`
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        addedCount++;
                    } else {
                        failedItems.push(item.productTitle || item.title || 'Unknown Product');
                    }
                } else {
                    failedItems.push(item.productTitle || item.title || 'Unknown Product');
                }
            } catch (itemError) {
                console.warn('Failed to add item to cart:', item.productTitle, itemError);
                failedItems.push(item.productTitle || item.title || 'Unknown Product');
            }
        }
        
        if (addedCount > 0) {
            let message = `${addedCount} item${addedCount > 1 ? 's' : ''} added to cart`;
            if (failedItems.length > 0) {
                message += `. ${failedItems.length} item${failedItems.length > 1 ? 's' : ''} could not be added.`;
            }
            showNotification(message, addedCount === orderItems.length ? 'success' : 'warning');
            
            // Update cart badge if function exists
            if (typeof updateNavbarCartBadges === 'function') {
                setTimeout(updateCartBadge, 500);
            }
        } else {
            throw new Error('No items could be added to cart. They may be out of stock or unavailable.');
        }
        
    } catch (error) {
        console.error('Failed to reorder:', error);
        showNotification(`Failed to reorder: ${error.message}`, 'error');
    }
}

async function updateCartBadge() {
    try {
        const response = await fetch('customer/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=get'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data?.items) {
                const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
                if (typeof updateNavbarCartBadges === 'function') {
                    updateNavbarCartBadges(totalItems);
                }
            }
        }
    } catch (error) {
        console.warn('Failed to update cart badge:', error);
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function animateCounter(element, targetValue, prefix = '', suffix = '') {
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        if (typeof targetValue === 'number' && targetValue % 1 !== 0) {
            const currentDecimal = startValue + (targetValue - startValue) * easeOutQuart;
            element.textContent = prefix + currentDecimal.toFixed(2) + suffix;
        } else {
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            element.textContent = prefix + currentValue + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            if (typeof targetValue === 'number' && targetValue % 1 !== 0) {
                element.textContent = prefix + targetValue.toFixed(2) + suffix;
            } else {
                element.textContent = prefix + targetValue + suffix;
            }
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.warn('Error formatting date:', dateString, error);
        return dateString || 'Unknown Date';
    }
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

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${iconMap[type] || iconMap.info}"></i>
            <span class="notification-text">${escapeHtml(message)}</span>
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
                border-radius: var(--border-radius-sm);
                box-shadow: var(--shadow-lg);
                z-index: 9999;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                border-left: 4px solid var(--primary-color);
                max-width: 400px;
                min-width: 300px;
            }
            
            .notification.success {
                border-left-color: var(--success-color);
            }
            
            .notification.error {
                border-left-color: var(--alert-color);
            }
            
            .notification.warning {
                border-left-color: var(--warning-color);
            }
            
            .notification.info {
                border-left-color: var(--primary-color);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-content i {
                font-size: 18px;
            }
            
            .notification.success i {
                color: var(--success-color);
            }
            
            .notification.error i {
                color: var(--alert-color);
            }
            
            .notification.warning i {
                color: var(--warning-color);
            }
            
            .notification.info i {
                color: var(--primary-color);
            }
            
            .notification-text {
                flex: 1;
                font-size: 14px;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Network error. Please check your connection.', 'error');
});

// =============================================================================
// GLOBAL FUNCTION EXPORTS
// =============================================================================

window.viewOrderDetails = viewOrderDetails;
window.showCancelOrderModal = showCancelOrderModal;
window.confirmCancelOrder = confirmCancelOrder;
window.closeCancelModal = closeCancelModal;
window.closeOrderModal = closeOrderModal;
window.reorderItems = reorderItems;
window.clearFilters = clearFilters;
window.changePage = changePage;
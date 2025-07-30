/**
 * PAHANA EDU - CUSTOMER DASHBOARD JAVASCRIPT
 * Enhanced e-commerce functionality with modern UI interactions
 * Updated to work with CustomerController endpoints
 */

// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

let currentPage = 1;
let productsPerPage = 12;
let allProducts = [];
let filteredProducts = [];
let categories = [];
let cart = [];
let isLoading = false;
let currentView = 'grid';

// API endpoints - Updated to match CustomerController URLs
const API_ENDPOINTS = {
    dashboard: 'customer/dashboard',
    products: 'customer/products',
    productDetails: 'customer/product-details',
    cart: 'customer/cart',
    checkout: 'customer/checkout',
    orders: 'customer/orders',
    profile: 'customer/profile',
    promo: 'customer/promo-validate'
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        showLoadingState();
        
        // Initialize scroll animations
        initializeScrollAnimations();
        
        // Load initial data
        await Promise.all([
            loadDashboardStats(),
            loadCategories(),
            loadProducts(),
            loadFeaturedBooks(),
            loadCart()
        ]);
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Initialize view mode
        initializeViewMode();
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('Failed to load page data. Please refresh the page.', 'error');
    }
}

function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch();
            }, 300);
        });
    }
    
    // Filter controls
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    if (categoryFilter) categoryFilter.addEventListener('change', handleCategoryFilter);
    if (sortFilter) sortFilter.addEventListener('change', handleSort);
    if (minPrice) minPrice.addEventListener('input', debounce(applyFilters, 500));
    if (maxPrice) maxPrice.addEventListener('input', debounce(applyFilters, 500));
    
    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            toggleView(view);
        });
    });
    
    // Cart functionality
    document.addEventListener('click', handleCartActions);
    
    // Category cards
    document.addEventListener('click', handleCategoryClick);
    
    // Product details button click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-view-details') || e.target.closest('.btn-view-details')) {
            const button = e.target.classList.contains('btn-view-details') ? e.target : e.target.closest('.btn-view-details');
            const productId = button.dataset.productId;
            if (productId) {
                showProductDetails(productId);
            }
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// =============================================================================
// SCROLL ANIMATIONS
// =============================================================================

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
    
    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (header) {
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        lastScrollTop = scrollTop;
    });
}

// =============================================================================
// DATA LOADING FUNCTIONS
// =============================================================================

async function loadDashboardStats() {
    try {
        const response = await fetch(API_ENDPOINTS.dashboard, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=stats'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && !data.error) {
            updateDashboardStats(data);
        } else if (data && data.error) {
            console.error('Dashboard stats error:', data.message);
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch(API_ENDPOINTS.dashboard, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=categories'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            categories = data;
            populateCategoryFilter();
            renderCategories();
        } else if (data && data.error) {
            console.error('Categories error:', data.message);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadProducts(append = false) {
    if (isLoading) return;
    
    try {
        isLoading = true;
        
        if (!append) {
            showLoadingState('productsGrid');
        }
        
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
            if (append) {
                allProducts = [...allProducts, ...data];
            } else {
                allProducts = data;
            }
            
            filteredProducts = [...allProducts];
            renderProducts();
            updateProductsCount();
        } else if (data && data.error) {
            throw new Error(data.message || 'Failed to load products');
        } else {
            if (!append) {
                allProducts = [];
                filteredProducts = [];
                renderProducts();
                updateProductsCount();
            }
        }
        
    } catch (error) {
        console.error('Failed to load products:', error);
        showNotification(`Failed to load products: ${error.message}`, 'error');
        
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid && !append) {
            productsGrid.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: var(--alert-color);"></i>
                    <p>Unable to load products</p>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-top: 8px;">Please check if the server is running and try again.</p>
                    <button class="btn-filter" onclick="loadProducts()" style="margin-top: 16px;">
                        <i class="fas fa-refresh"></i>
                        Try Again
                    </button>
                </div>
            `;
        }
    } finally {
        isLoading = false;
        hideLoadingState('productsGrid');
    }
}

async function loadFeaturedBooks() {
    try {
        const response = await fetch(API_ENDPOINTS.dashboard, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=featured-products'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            renderFeaturedBooks(data);
        } else if (data && data.error) {
            console.error('Featured books error:', data.message);
        }
    } catch (error) {
        console.error('Failed to load featured books:', error);
    }
}

async function loadCart() {
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
            updateCartUI();
            
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (typeof updateNavbarCartBadges === 'function') {
                updateNavbarCartBadges(totalItems);
            }
        } else if (data && data.error) {
            console.warn('Cart loading issue:', data.message);
            cart = [];
            updateCartUI();
        }
    } catch (error) {
        console.error('Failed to load cart:', error);
        cart = [];
        updateCartUI();
    }
}

// =============================================================================
// RENDERING FUNCTIONS
// =============================================================================

function updateDashboardStats(stats) {
    const totalBooksEl = document.getElementById('totalBooks');
    const totalCategoriesEl = document.getElementById('totalCategories');
    
    if (totalBooksEl && stats.activeProducts) {
        animateCounter(totalBooksEl, stats.activeProducts, '+');
    }
    
    if (totalCategoriesEl && stats.totalCategories) {
        animateCounter(totalCategoriesEl, stats.totalCategories, '+');
    }
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

function renderCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    if (categories.length === 0) {
        categoriesGrid.innerHTML = '<div class="loading-state"><p>No categories available</p></div>';
        return;
    }
    
    const categoryIcons = {
        'academic': 'fas fa-graduation-cap',
        'textbook': 'fas fa-book',
        'novel': 'fas fa-book-open',
        'reference': 'fas fa-bookmark',
        'children': 'fas fa-child',
        'science': 'fas fa-flask',
        'literature': 'fas fa-pen-fancy',
        'technology': 'fas fa-laptop-code',
        'default': 'fas fa-book'
    };
    
    const html = categories.map(category => {
        const iconClass = categoryIcons[category.name.toLowerCase()] || categoryIcons.default;
        
        return `
            <div class="category-card fade-in" data-category-id="${category.id}">
                <div class="category-icon">
                    <i class="${iconClass}"></i>
                </div>
                <h3 class="category-name">${escapeHtml(category.name)}</h3>
                <p class="category-description">${escapeHtml(category.description || 'Browse books in this category')}</p>
            </div>
        `;
    }).join('');
    
    categoriesGrid.innerHTML = html;
    
    setTimeout(() => {
        initializeScrollAnimations();
    }, 100);
}

function renderProducts(products = filteredProducts) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; color: var(--background-color);"></i>
                <p>No books found matching your criteria</p>
                <button class="btn-clear-filters" onclick="clearFilters()" style="margin-top: 16px;">
                    <i class="fas fa-times"></i>
                    Clear Filters
                </button>
            </div>
        `;
        return;
    }
    
    const html = products.map(product => createProductCard(product)).join('');
    productsGrid.innerHTML = html;
}

function createProductCard(product) {
    const isOnOffer = product.offerPrice && product.offerPrice > 0;
    const displayPrice = isOnOffer ? product.offerPrice : product.price;
    const savings = isOnOffer ? (product.price - product.offerPrice).toFixed(2) : 0;
    const discountPercent = isOnOffer ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0;
    
    const stockStatus = product.stockQuantity <= 0 ? 'out-of-stock' : 
                       product.stockQuantity <= 5 ? 'low-stock' : 'in-stock';
    
    const stockText = product.stockQuantity <= 0 ? 'Out of Stock' :
                     product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : 'In Stock';
    
    return `
        <div class="product-card fade-in" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.imagePath || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}" 
                     alt="${escapeHtml(product.title)}" 
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                
                ${isOnOffer ? `<div class="offer-badge">${discountPercent}% OFF</div>` : ''}
                <div class="stock-badge ${stockStatus}">${stockText}</div>
            </div>
            
            <div class="product-info">
                <div class="product-category">${escapeHtml(product.categoryName || 'Books')}</div>
                <h3 class="product-title">${escapeHtml(product.title)}</h3>
                ${product.author ? `<div class="product-author">by ${escapeHtml(product.author)}</div>` : ''}
                ${product.description ? `<p class="product-description">${escapeHtml(product.description.substring(0, 100))}${product.description.length > 100 ? '...' : ''}</p>` : ''}
                
                <div class="product-pricing">
                    <span class="current-price">Rs. ${parseFloat(displayPrice).toFixed(2)}</span>
                    ${isOnOffer ? `
                        <span class="original-price">Rs. ${parseFloat(product.price).toFixed(2)}</span>
                        <span class="savings">Save Rs. ${savings}</span>
                    ` : ''}
                </div>
                
                <div class="product-actions">
                    <button class="btn-add-cart" 
                            data-product-id="${product.id}"
                            ${product.stockQuantity <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="btn-view-details" data-product-id="${product.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedBooks(books) {
    const featuredGrid = document.getElementById('featuredGrid');
    if (!featuredGrid) return;
    
    if (books.length === 0) {
        featuredGrid.innerHTML = '<div class="loading-state"><p>No featured books available</p></div>';
        return;
    }
    
    const html = books.slice(0, 8).map(book => createProductCard(book)).join('');
    featuredGrid.innerHTML = html;
}

// =============================================================================
// SEARCH AND FILTER FUNCTIONALITY
// =============================================================================

async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput ? searchInput.value.trim() : '';
    
    try {
        showLoadingState('productsGrid');
        
        let action = 'list';
        let body = `action=${action}`;
        
        if (keyword) {
            action = 'search';
            body = `action=${action}&keyword=${encodeURIComponent(keyword)}`;
        }
        
        const response = await fetch(API_ENDPOINTS.products, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            allProducts = data;
            applyFilters();
        } else if (data && data.error) {
            throw new Error(data.message || 'Search failed');
        }
        
    } catch (error) {
        console.error('Search failed:', error);
        showNotification(`Search failed: ${error.message}`, 'error');
    } finally {
        hideLoadingState('productsGrid');
    }
}

function handleCategoryFilter() {
    applyFilters();
}

function handleSort() {
    applyFilters();
}

async function applyFilters() {
    try {
        showLoadingState('productsGrid');
        
        const categoryId = document.getElementById('categoryFilter')?.value || '';
        const sortBy = document.getElementById('sortFilter')?.value || '';
        const minPrice = document.getElementById('minPrice')?.value || '';
        const maxPrice = document.getElementById('maxPrice')?.value || '';
        
        const params = new URLSearchParams();
        params.append('action', 'filter');
        if (categoryId) params.append('categoryId', categoryId);
        if (sortBy) params.append('sortBy', sortBy);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        
        const response = await fetch(API_ENDPOINTS.products, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            filteredProducts = data;
            renderProducts();
            updateProductsCount();
        } else if (data && data.error) {
            throw new Error(data.message || 'Filter failed');
        }
        
    } catch (error) {
        console.error('Filter failed:', error);
        showNotification(`Filter failed: ${error.message}`, 'error');
    } finally {
        hideLoadingState('productsGrid');
    }
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (sortFilter) sortFilter.value = '';
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    filteredProducts = [...allProducts];
    renderProducts();
    updateProductsCount();
}

// =============================================================================
// VIEW MODE FUNCTIONALITY
// =============================================================================

function initializeViewMode() {
    const savedView = localStorage.getItem('preferredView') || 'grid';
    toggleView(savedView);
}

function toggleView(view) {
    currentView = view;
    
    const productsGrid = document.getElementById('productsGrid');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    if (productsGrid) {
        if (view === 'list') {
            productsGrid.classList.add('list-view');
        } else {
            productsGrid.classList.remove('list-view');
        }
    }
    
    viewButtons.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    localStorage.setItem('preferredView', view);
}

// =============================================================================
// CART FUNCTIONALITY
// =============================================================================

function handleCartActions(e) {
    const target = e.target;
    
    if (target.classList.contains('btn-add-cart') || target.closest('.btn-add-cart')) {
        const button = target.classList.contains('btn-add-cart') ? target : target.closest('.btn-add-cart');
        const productId = button.dataset.productId;
        if (productId) {
            addToCart(productId);
        }
    }
    
    if (target.classList.contains('qty-btn')) {
        const productId = target.dataset.productId;
        const action = target.dataset.action;
        updateCartQuantity(productId, action);
    }
    
    if (target.classList.contains('remove-item')) {
        const productId = target.dataset.productId;
        removeFromCart(productId);
    }
}

async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch(API_ENDPOINTS.cart, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add&productId=${productId}&quantity=${quantity}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Product added to cart successfully!', 'success');
            await loadCart();
        } else {
            showNotification(data.message || 'Failed to add product to cart', 'error');
        }
        
    } catch (error) {
        console.error('Add to cart failed:', error);
        showNotification('Failed to add product to cart', 'error');
    }
}

async function updateCartQuantity(productId, action) {
    try {
        const cartItem = cart.find(item => item.productId == productId);
        if (!cartItem) return;
        
        let newQuantity = cartItem.quantity;
        if (action === 'increase') {
            newQuantity++;
        } else if (action === 'decrease' && newQuantity > 1) {
            newQuantity--;
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
            await loadCart();
        } else {
            showNotification(data.message || 'Failed to update cart', 'error');
        }
        
    } catch (error) {
        console.error('Update cart failed:', error);
        showNotification('Failed to update cart', 'error');
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
            showNotification('Product removed from cart', 'info');
            await loadCart();
        } else {
            showNotification(data.message || 'Failed to remove product', 'error');
        }
        
    } catch (error) {
        console.error('Remove from cart failed:', error);
        showNotification('Failed to remove product', 'error');
    }
}

function updateCartUI() {
    const cartBadge = document.getElementById('cartBadge');
    const cartContent = document.getElementById('cartContent');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        if (totalItems > 0) {
            cartBadge.classList.add('show');
        } else {
            cartBadge.classList.remove('show');
        }
    }
    
    if (typeof updateNavbarCartBadges === 'function') {
        updateNavbarCartBadges(totalItems);
    }
    
    if (cartContent) {
        if (cart.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <span>Add some books to get started</span>
                </div>
            `;
        } else {
            cartContent.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
        }
    }
    
    if (cartFooter && cartTotal) {
        if (cart.length > 0) {
            const total = cart.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
            cartTotal.textContent = total.toFixed(2);
            cartFooter.style.display = 'block';
        } else {
            cartFooter.style.display = 'none';
        }
    }
}

function createCartItemHTML(item) {
    return `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.productImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}" 
                     alt="${escapeHtml(item.productTitle)}"
                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${escapeHtml(item.productTitle)}</div>
                <div class="cart-item-price">Rs. ${parseFloat(item.unitPrice).toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-product-id="${item.productId}" data-action="decrease">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="qty-input" value="${item.quantity}" readonly>
                    <button class="qty-btn" data-product-id="${item.productId}" data-action="increase">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item" data-product-id="${item.productId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        const isOpen = cartSidebar.classList.contains('open');
        
        if (isOpen) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

// =============================================================================
// CATEGORY CLICK HANDLER
// =============================================================================

function handleCategoryClick(e) {
    const categoryCard = e.target.closest('.category-card');
    if (categoryCard) {
        const categoryId = categoryCard.dataset.categoryId;
        if (categoryId) {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = categoryId;
                applyFilters();
            }
            
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
}

// =============================================================================
// PRODUCT DETAILS MODAL
// =============================================================================

async function showProductDetails(productId) {
    try {
        const response = await fetch(API_ENDPOINTS.productDetails, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${productId}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            showNotification(data.message || 'Failed to load product details', 'error');
            return;
        }
        
        const product = data.product;
        const relatedProducts = data.relatedProducts || [];
        
        const modalHTML = `
            <div class="product-modal-overlay" onclick="closeProductModal()">
                <div class="product-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>${escapeHtml(product.title)}</h2>
                        <button class="modal-close" onclick="closeProductModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="product-details-grid">
                            <div class="product-image-section">
                                <img src="${product.imagePath || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}" 
                                     alt="${escapeHtml(product.title)}"
                                     onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
                            </div>
                            
                            <div class="product-info-section">
                                ${product.author ? `<p class="product-author">by ${escapeHtml(product.author)}</p>` : ''}
                                ${product.isbn ? `<p class="product-isbn">ISBN: ${escapeHtml(product.isbn)}</p>` : ''}
                                <p class="product-category">Category: ${escapeHtml(product.categoryName || 'Books')}</p>
                                
                                <div class="product-pricing-large">
                                    <span class="current-price">Rs. ${formatPrice(product.displayPrice)}</span>
                                    ${product.isOnOffer ? `
                                        <span class="original-price">Rs. ${formatPrice(product.price)}</span>
                                        <span class="savings">Save Rs. ${formatPrice(product.savings)}</span>
                                    ` : ''}
                                </div>
                                
                                <div class="stock-info">
                                    <span class="stock-status ${product.stockQuantity <= 0 ? 'out-of-stock' : product.stockQuantity <= 5 ? 'low-stock' : 'in-stock'}">
                                        ${product.stockQuantity <= 0 ? 'Out of Stock' : 
                                          product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : 'In Stock'}
                                    </span>
                                </div>
                                
                                <div class="product-description-full">
                                    <h4>Description</h4>
                                    <p>${escapeHtml(product.description || 'No description available')}</p>
                                </div>
                                
                                <div class="product-actions-large">
                                    <div class="quantity-selector">
                                        <button type="button" onclick="updateModalQuantity(-1)">-</button>
                                        <input type="number" id="modalQuantity" value="1" min="1" max="${product.stockQuantity}">
                                        <button type="button" onclick="updateModalQuantity(1)">+</button>
                                    </div>
                                    <button class="btn-add-cart-large" 
                                            data-product-id="${product.id}"
                                            ${product.stockQuantity <= 0 ? 'disabled' : ''}
                                            onclick="addToCartFromModal()">
                                        <i class="fas fa-shopping-cart"></i>
                                        ${product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        ${relatedProducts.length > 0 ? `
                            <div class="related-products">
                                <h3>Related Books</h3>
                                <div class="related-grid">
                                    ${relatedProducts.map(related => `
                                        <div class="related-item" onclick="showProductDetails(${related.id})">
                                            <img src="${related.imagePath || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}" 
                                                 alt="${escapeHtml(related.title)}"
                                                 onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'">
                                            <h4>${escapeHtml(related.title)}</h4>
                                            <p>Rs. ${formatPrice(related.displayPrice)}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.querySelector('.product-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        if (!document.querySelector('#product-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'product-modal-styles';
            styles.textContent = `
                .product-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .product-modal {
                    background: var(--white);
                    border-radius: var(--border-radius);
                    max-width: 900px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                }
                
                .modal-header {
                    padding: 24px;
                    border-bottom: 2px solid var(--background-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--primary-color);
                    color: var(--white);
                    border-radius: var(--border-radius) var(--border-radius) 0 0;
                }
                
                .modal-close {
                    background: transparent;
                    border: none;
                    color: var(--white);
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: var(--border-radius-small);
                    transition: all 0.3s ease;
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .modal-content {
                    padding: 24px;
                }
                
                .product-details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                    margin-bottom: 32px;
                }
                
                .product-image-section img {
                    width: 100%;
                    height: auto;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-light);
                }
                
                .product-info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .product-pricing-large .current-price {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--primary-color);
                }
                
                .product-actions-large {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    margin-top: 24px;
                }
                
                .quantity-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 2px solid var(--background-color);
                    border-radius: var(--border-radius-small);
                    padding: 4px;
                }
                
                .quantity-selector button {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: var(--background-color);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .quantity-selector button:hover {
                    background: var(--primary-color);
                    color: var(--white);
                }
                
                .quantity-selector input {
                    width: 60px;
                    text-align: center;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .btn-add-cart-large {
                    flex: 1;
                    padding: 16px 32px;
                    background: var(--primary-color);
                    color: var(--white);
                    border: none;
                    border-radius: var(--border-radius-small);
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .btn-add-cart-large:hover:not(:disabled) {
                    background: var(--accent-color);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 119, 182, 0.2);
                }
                
                .related-products {
                    border-top: 2px solid var(--background-color);
                    padding-top: 24px;
                }
                
                .related-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 16px;
                }
                
                .related-item {
                    text-align: center;
                    cursor: pointer;
                    padding: 16px;
                    border-radius: var(--border-radius);
                    transition: all 0.3s ease;
                }
                
                .related-item:hover {
                    background: var(--background-color);
                    transform: translateY(-4px);
                }
                
                .related-item img {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    border-radius: var(--border-radius-small);
                    margin-bottom: 8px;
                }
                
                @media (max-width: 768px) {
                    .product-details-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .product-actions-large {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .related-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
    } catch (error) {
        console.error('Failed to load product details:', error);
        showNotification('Failed to load product details', 'error');
    }
}

function closeProductModal() {
    const modal = document.querySelector('.product-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function updateModalQuantity(change) {
    const quantityInput = document.getElementById('modalQuantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const maxValue = parseInt(quantityInput.max) || 999;
        const newValue = Math.max(1, Math.min(maxValue, currentValue + change));
        quantityInput.value = newValue;
    }
}

async function addToCartFromModal() {
    const quantityInput = document.getElementById('modalQuantity');
    const addButton = document.querySelector('.btn-add-cart-large');
    
    if (quantityInput && addButton) {
        const productId = addButton.dataset.productId;
        const quantity = parseInt(quantityInput.value) || 1;
        
        await addToCart(productId, quantity);
        closeProductModal();
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function updateProductsCount() {
    const productsCount = document.getElementById('productsCount');
    if (productsCount) {
        const count = filteredProducts.length;
        const totalCount = allProducts.length;
        
        if (count === totalCount) {
            productsCount.textContent = `Showing ${count} books`;
        } else {
            productsCount.textContent = `Showing ${count} of ${totalCount} books`;
        }
    }
}

function showLoadingState(elementId = null) {
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading amazing books...</p>
                </div>
            `;
        }
    }
}

function hideLoadingState(elementId = null) {
    // Loading state will be replaced by actual content
}

function showNotification(message, type = 'info') {
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

function animateCounter(element, targetValue, suffix = '') {
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue + suffix;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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

function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// =============================================================================
// LOAD MORE FUNCTIONALITY
// =============================================================================

function loadMoreProducts() {
    currentPage++;
    loadProducts(true);
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
        
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && cartSidebar.classList.contains('open')) {
            toggleCart();
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

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
// EXPORT FOR GLOBAL ACCESS
// =============================================================================

window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.toggleCart = toggleCart;
window.loadMoreProducts = loadMoreProducts;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.updateModalQuantity = updateModalQuantity;
window.addToCartFromModal = addToCartFromModal;

// Global Variables
let currentSection = 'dashboard';
let allProducts = [];
let allCustomers = [];
let allOrders = [];
let editingItem = null;

// POS Variables
let posProducts = [];
let posCustomers = [];
let selectedCustomer = null;
let cartItems = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff Dashboard initializing...');
    initializeDashboard();
});

function initializeDashboard() {
    try {
        loadDashboardStats();
        setupEventListeners();
        console.log('Staff Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to initialize dashboard');
    }
}

function setupEventListeners() {
    // Product search
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(() => filterProducts(), 300));
    }

    // Customer search
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', debounce(() => filterCustomers(), 300));
    }

    // Order search
    const orderSearch = document.getElementById('orderSearch');
    if (orderSearch) {
        orderSearch.addEventListener('input', debounce(() => filterOrders(), 300));
    }

    // POS product search
    const posProductSearch = document.getElementById('posProductSearch');
    if (posProductSearch) {
        posProductSearch.addEventListener('input', debounce(() => searchPOSProducts(), 300));
    }

    // Discount input change
    const discountAmount = document.getElementById('discountAmount');
    if (discountAmount) {
        discountAmount.addEventListener('input', updateCartTotals);
    }

    // Cash received input change
    const cashReceived = document.getElementById('cashReceived');
    if (cashReceived) {
        cashReceived.addEventListener('input', calculateChange);
    }

    // Payment method change
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', handlePaymentMethodChange);
    }
}

// Section Navigation
function showSection(sectionName) {
    try {
        // Remove active class from all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
            currentSection = sectionName;

            // Add active class to nav link
            const navLink = document.getElementById(`nav-${sectionName}`);
            if (navLink) {
                navLink.classList.add('active');
            }

            // Update section title
            updateSectionTitle(sectionName);
            
            // Load section data
            loadSectionData(sectionName);
        }
    } catch (error) {
        console.error(`Error showing section ${sectionName}:`, error);
        showError('Failed to load section');
    }
}

function updateSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Staff Dashboard',
        'pos': 'POS Terminal',
        'products': 'Product Management',
        'customers': 'Customer Management',
        'orders': 'Order Management'
    };
    
    const titleElement = document.getElementById('sectionTitle');
    if (titleElement) {
        titleElement.textContent = titles[sectionName] || 'Staff Dashboard';
    }
}

function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'pos':
            initializePOS().then(() => {
                // After POS is initialized, update customer info if customer is selected
                if (selectedCustomer) {
                    setTimeout(() => {
                        updateCustomerInfo();
                    }, 100);
                }
            });
            break;
        case 'products':
            loadProducts();
            loadCategoriesForFilter();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

// Dashboard Stats Functions
async function loadDashboardStats() {
    try {
        const response = await fetch('staff/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.ok) {
            const stats = await response.json();
            updateDashboardStats(stats);
        } else {
            throw new Error('Failed to load dashboard stats');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showError('Failed to load dashboard statistics');
    }
}

function updateDashboardStats(stats) {
    const elements = {
        'totalProducts': stats.totalProducts || 0,
        'activeProducts': stats.activeProducts || 0,
        'totalOrders': stats.totalOrders || 0,
        'pendingOrders': stats.pendingOrders || 0,
        'todayOrders': stats.todayOrders || 0,
        'totalCustomers': stats.totalCustomers || 0,
        'todayRevenue': 'Rs. ' + formatCurrency(stats.todayRevenue || 0)
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// POS System Functions
// Enhanced POS initialization
async function initializePOS() {
    try {
        await loadPOSProducts();
        await loadPOSCustomers();
        clearCart();

        // Set default payment method and update UI
        const paymentMethodSelect = document.getElementById('paymentMethod');
        const cashReceivedContainer = document.getElementById('cashReceivedContainer');
        if (paymentMethodSelect && cashReceivedContainer) {
            paymentMethodSelect.value = 'cash';
            cashReceivedContainer.style.display = 'block';
            const changeContainer = document.getElementById('changeAmount');
            if (changeContainer) {
                changeContainer.textContent = 'Rs. 0.00';
                changeContainer.className = 'text-success fw-bold';
            }
        }
        
        console.log('POS initialized successfully');
        return Promise.resolve(); // Return resolved promise
        
    } catch (error) {
        console.error('Error initializing POS:', error);
        showPOSError('Failed to initialize POS');
        return Promise.reject(error);
    }
}

async function loadPOSProducts(keyword = '') {
    try {
        const formData = new FormData();
        formData.append('action', 'search-pos');
        if (keyword) formData.append('keyword', keyword);

        const response = await fetch('staff/products', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            posProducts = await response.json();
            displayPOSProducts(posProducts);
        } else {
            throw new Error('Failed to load POS products');
        }
    } catch (error) {
        console.error('Error loading POS products:', error);
        showPOSError('Failed to load products');
    }
}

function displayPOSProducts(products) {
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="text-center text-muted p-5">
                <i class="fas fa-search fa-3x mb-3"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }

    // Create table structure for products - Remove offer price display
    grid.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-success">
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => {
                        // Use offer price if available, otherwise regular price
                        const displayPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
                        
                        return `
                            <tr style="cursor: pointer;" onclick="addToCart(${product.id})">
                                <td>
                                    ${product.imagePath ? 
                                        `<img src="${escapeHtml(product.imagePath)}" alt="Product" style="width: 50px; height: 60px; object-fit: cover; border-radius: 5px;">` :
                                        '<div style="width: 50px; height: 60px; background: #f8f9fa; border-radius: 5px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-book text-muted"></i></div>'
                                    }
                                </td>
                                <td>
                                    <strong>${escapeHtml(product.title)}</strong><br>
                                    <small class="text-muted">${escapeHtml(product.author || '')}</small>
                                </td>
                                <td>
                                    <span class="text-success">Rs. ${formatCurrency(displayPrice)}</span>
                                </td>
                                <td>
                                    <span class="badge ${product.stockQuantity > 0 ? 'bg-success' : 'bg-danger'}">${product.stockQuantity}</span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); addToCart(${product.id})" ${product.stockQuantity <= 0 ? 'disabled' : ''}>
                                        <i class="fas fa-plus"></i> Add
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function searchPOSProducts() {
    const keyword = document.getElementById('posProductSearch')?.value || '';
    await loadPOSProducts(keyword);
}

async function loadPOSCustomers() {
    try {
        const response = await fetch('staff/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=search-pos'
        });

        if (response.ok) {
            posCustomers = await response.json();
        } else {
            throw new Error('Failed to load customers');
        }
    } catch (error) {
        console.error('Error loading POS customers:', error);
    }
}

// Customer Selection Modal
function showCustomerSearchModal() {
    const modalHtml = `
        <div class="modal fade" id="customerSearchModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-search"></i> Select Customer
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="customerSearchInput" 
                                   placeholder="Search by name, email, or phone..." 
                                   onkeyup="filterPOSCustomers()">
                        </div>
                        
                        <div class="row">
                            <div class="col-md-8">
                                <h6>Existing Customers</h6>
                                <div class="table-responsive" style="max-height: 400px; override-y: auto;">
                                    <table class="table table-hover table-sm">
                                        <thead class="table-light sticky-top">
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="customerTableList">
                                            ${posCustomers.map(customer => `
                                                <tr>
                                                    <td><strong>${escapeHtml(customer.name)}</strong></td>
                                                    <td><small class="text-muted">${escapeHtml(customer.email)}</small></td>
                                                    <td><small class="text-muted">${escapeHtml(customer.phone || 'No phone')}</small></td>
                                                    <td>
                                                        <button class="btn btn-sm btn-success" onclick="selectCustomer(${customer.id}, '${escapeHtml(customer.name)}', '${escapeHtml(customer.email)}')">
                                                            <i class="fas fa-check"></i> Select
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h6>Create Guest Customer</h6>
                                <form id="guestCustomerForm">
                                    <div class="mb-2">
                                        <input type="text" class="form-control form-control-sm" 
                                               id="guestFirstName" placeholder="First Name" required>
                                    </div>
                                    <div class="mb-2">
                                        <input type="text" class="form-control form-control-sm" 
                                               id="guestLastName" placeholder="Last Name" required>
                                    </div>
                                    <div class="mb-2">
                                        <input type="tel" class="form-control form-control-sm" 
                                               id="guestPhone" placeholder="Phone (optional)">
                                    </div>
                                    <button type="button" class="btn btn-success btn-sm w-100" onclick="createGuestCustomer()">
                                        <i class="fas fa-plus"></i> Create Guest
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}

function filterPOSCustomers() {
    const keyword = document.getElementById('customerSearchInput')?.value.toLowerCase() || '';
    const customerList = document.getElementById('customerTableList');
    if (!customerList) return;

    const filteredCustomers = posCustomers.filter(customer => 
        customer.name.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword) ||
        (customer.phone && customer.phone.includes(keyword))
    );

    customerList.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td><strong>${escapeHtml(customer.name)}</strong></td>
            <td><small class="text-muted">${escapeHtml(customer.email)}</small></td>
            <td><small class="text-muted">${escapeHtml(customer.phone || 'No phone')}</small></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="selectCustomer(${customer.id}, '${escapeHtml(customer.name)}', '${escapeHtml(customer.email)}')">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        </tr>
    `).join('');
}

async function createGuestCustomer() {
    try {
        const form = document.getElementById('guestCustomerForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData();
        formData.append('action', 'create-guest');
        formData.append('firstName', document.getElementById('guestFirstName').value.trim());
        formData.append('lastName', document.getElementById('guestLastName').value.trim());
        formData.append('phone', document.getElementById('guestPhone').value.trim());

        const response = await fetch('staff/customers', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const customer = await response.json();
            selectCustomer(customer.id, customer.name, customer.email);
            hideModal('customerSearchModal');
            showSuccess('Guest customer created successfully');
        } else {
            throw new Error('Failed to create guest customer');
        }
    } catch (error) {
        console.error('Error creating guest customer:', error);
        showError('Failed to create guest customer');
    }
}

function selectCustomer(customerId, customerName, customerEmail) {
    selectedCustomer = {
        id: customerId,
        name: customerName,
        email: customerEmail
    };

    // Update selected customer info
    updateCustomerInfo();
    
    hideModal('customerSearchModal');
}

// Cart Management Functions
function addToCart(productId) {
    const product = posProducts.find(p => p.id === productId);
    if (!product) return;

    if (product.stockQuantity <= 0) {
        showError('Product is out of stock');
        return;
    }

    // Check if product already in cart
    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stockQuantity) {
            showError('Cannot add more items than available stock');
            return;
        }
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
    } else {
        // Use offer price if available, otherwise regular price
        const unitPrice = product.offerPrice && product.offerPrice > 0 ? parseFloat(product.offerPrice) : parseFloat(product.price);
        cartItems.push({
            productId: product.id,
            productTitle: product.title,
            quantity: 1,
            unitPrice: unitPrice,
            totalPrice: unitPrice
        });
    }

    updateCartDisplay();
    updateCartTotals();
    updateCheckoutButton();
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.productId !== productId);
    updateCartDisplay();
    updateCartTotals();
    updateCheckoutButton();
}

function updateCartQuantity(productId, newQuantity) {
    const item = cartItems.find(item => item.productId === productId);
    const product = posProducts.find(p => p.id === productId);
    
    if (!item || !product) return;

    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > product.stockQuantity) {
        showError('Cannot add more items than available stock');
        return;
    }

    item.quantity = newQuantity;
    item.totalPrice = item.unitPrice * newQuantity;
    
    updateCartDisplay();
    updateCartTotals();
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                <p>Cart is empty</p>
            </div>
        `;
        return;
    }

    cartContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="flex-grow-1">
                <strong>${escapeHtml(item.productTitle)}</strong><br>
                <small class="text-muted">Rs. ${formatCurrency(item.unitPrice)} each</small>
            </div>
            <div class="quantity-controls">
                <button onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="mx-2">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="text-end">
                <strong>Rs. ${formatCurrency(item.totalPrice)}</strong><br>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.productId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateCartTotals() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = parseFloat(document.getElementById('discountAmount')?.value || 0);
    const total = Math.max(0, subtotal - discountAmount);

    document.getElementById('cartSubtotal').textContent = 'Rs. ' + formatCurrency(subtotal);
    document.getElementById('cartDiscount').textContent = 'Rs. ' + formatCurrency(discountAmount);
    document.getElementById('cartTotal').textContent = 'Rs. ' + formatCurrency(total);

    // Update change calculation if cash payment
    calculateChange();
}

// Payment Management Functions
function handlePaymentMethodChange() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const cashReceivedContainer = document.getElementById('cashReceivedContainer');
    
    if (paymentMethod === 'cash') {
        if (cashReceivedContainer) {
            cashReceivedContainer.style.display = 'block';
        }
    } else {
        if (cashReceivedContainer) {
            cashReceivedContainer.style.display = 'none';
        }
        const changeContainer = document.getElementById('changeAmount');
        if (changeContainer) {
            changeContainer.textContent = 'Rs. 0.00';
        }
    }
}

function calculateChange() {
    const paymentMethod = document.getElementById('paymentMethod')?.value;
    if (paymentMethod !== 'cash') return;

    const cashReceived = parseFloat(document.getElementById('cashReceived')?.value || 0);
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0) - parseFloat(document.getElementById('discountAmount')?.value || 0);
    const change = Math.max(0, cashReceived - total);

    const changeContainer = document.getElementById('changeAmount');
    if (changeContainer) {
        changeContainer.textContent = 'Rs. ' + formatCurrency(change);
        
        // Change color based on amount
        if (cashReceived < total) {
            changeContainer.className = 'text-danger fw-bold';
        } else {
            changeContainer.className = 'text-success fw-bold';
        }
    }
}

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        const canCheckout = cartItems.length > 0 && selectedCustomer;
        checkoutBtn.disabled = !canCheckout;
    }
}

function clearCart() {
    cartItems = [];
    // Don't clear selectedCustomer here if we want to keep customer selected
    // selectedCustomer = null; // Comment this out
    
    // Only reset cart display, not customer info
    const discountInput = document.getElementById('discountAmount');
    if (discountInput) {
        discountInput.value = '0';
    }

    const cashReceivedInput = document.getElementById('cashReceived');
    if (cashReceivedInput) {
        cashReceivedInput.value = '';
    }

    updateCartDisplay();
    updateCartTotals();
    updateCheckoutButton();
}
// Order Processing Functions
async function processOrder() {
    if (!selectedCustomer || cartItems.length === 0) {
        showError('Please select a customer and add items to cart');
        return;
    }

    const paymentMethod = document.getElementById('paymentMethod').value;
    if (paymentMethod === 'cash') {
        const cashReceived = parseFloat(document.getElementById('cashReceived')?.value || 0);
        const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0) - parseFloat(document.getElementById('discountAmount')?.value || 0);
        
        if (cashReceived < total) {
            showError('Cash received is less than total amount');
            return;
        }
    }

    try {
        const formData = new FormData();
        formData.append('action', 'create-pos');
        formData.append('customerId', selectedCustomer.id);
        formData.append('orderItems', JSON.stringify(cartItems));
        formData.append('discount', document.getElementById('discountAmount').value || '0');
        formData.append('paymentMethod', paymentMethod);
        if (paymentMethod === 'cash') {
            formData.append('cashReceived', document.getElementById('cashReceived').value || '0');
        }

        const response = await fetch('staff/orders', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const order = await response.json();
            showSuccess('Order created successfully!');
            
            // Ask if user wants to print bill
            Swal.fire({
                title: 'Order Created!',
                text: `Order ${order.orderNumber} has been created successfully. Would you like to print the bill?`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Print Bill',
                cancelButtonText: 'Continue'
            }).then((result) => {
                if (result.isConfirmed) {
                    printBill(order.id);
                }
            });

            clearCart();
            loadDashboardStats();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('Error processing order:', error);
        showError('Failed to process order: ' + error.message);
    }
}

// Product Management Functions
async function loadProducts() {
    try {
        showTableLoading('productsTableBody');

        const response = await fetch('staff/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=list'
        });

        if (response.ok) {
            allProducts = await response.json();
            displayProducts(allProducts);
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showTableError('productsTableBody', 'Failed to load products');
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        // Price display logic with offer price
        let priceDisplay = `<span class="text-success">Rs. ${formatCurrency(product.price)}</span>`;
        
        if (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price) {
            priceDisplay = `
                <span class="text-muted text-decoration-line-through">Rs. ${formatCurrency(product.price)}</span><br>
                <span class="text-danger fw-bold">Rs. ${formatCurrency(product.offerPrice)}</span>
            `;
        }

        return `
            <tr>
                <td>${product.id}</td>
                <td>
                    ${product.imagePath ? 
                        `<img src="${escapeHtml(product.imagePath)}" alt="Product" style="width: 50px; height: 60px; object-fit: cover; border-radius: 5px;">` :
                        '<div style="width: 50px; height: 60px; background: #f8f9fa; border-radius: 5px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image text-muted"></i></div>'
                    }
                </td>
                <td><strong>${escapeHtml(product.title)}</strong></td>
                <td>${escapeHtml(product.author || 'N/A')}</td>
                <td>${priceDisplay}</td>
                <td><span class="badge ${product.stockQuantity > 0 ? 'bg-success' : 'bg-danger'}">${product.stockQuantity}</span></td>
                <td><span class="badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}">${product.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                            (product.author && product.author.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || product.categoryId.toString() === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

function showProductModal(productId = null) {
    editingItem = productId;
    const isEdit = productId !== null;
    const product = isEdit ? allProducts.find(p => p.id === productId) : null;

    const modalHtml = `
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-book"></i> ${isEdit ? 'Edit Product' : 'Add New Product'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm" enctype="multipart/form-data">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label class="form-label">Book Title *</label>
                                        <input type="text" class="form-control" id="productTitle" required
                                               value="${isEdit ? escapeHtml(product.title) : ''}">
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Author</label>
                                                <input type="text" class="form-control" id="productAuthor"
                                                       value="${isEdit ? escapeHtml(product.author || '') : ''}">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">ISBN</label>
                                                <input type="text" class="form-control" id="productIsbn"
                                                       value="${isEdit ? escapeHtml(product.isbn || '') : ''}">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Category *</label>
                                        <select class="form-select" id="productCategory" required>
                                            <option value="">Select Category</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Description</label>
                                        <textarea class="form-control" id="productDescription" rows="3">${isEdit ? escapeHtml(product.description || '') : ''}</textarea>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Product Image</label>
                                        <div class="text-center mb-2">
                                            <div id="imagePreview" class="border rounded p-3" style="min-height: 150px; display: flex; align-items: center; justify-content: center; background: #f8f9fa;">
                                                ${isEdit && product.imagePath ? 
                                                    `<img src="${escapeHtml(product.imagePath)}" alt="Current Image" style="max-width: 100%; max-height: 150px; object-fit: cover;">` :
                                                    '<i class="fas fa-image fa-3x text-muted"></i>'
                                                }
                                            </div>
                                        </div>
                                        <input type="file" class="form-control" id="productImage" accept="image/*" onchange="previewImage(this)">
                                        <small class="text-muted">Upload JPG, PNG, or GIF (Max: 5MB)</small>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Price (Rs.) *</label>
                                        <input type="number" class="form-control" id="productPrice" required step="0.01" min="0"
                                               value="${isEdit ? product.price : ''}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Offer Price (Rs.)</label>
                                        <input type="number" class="form-control" id="productOfferPrice" step="0.01" min="0"
                                               value="${isEdit && product.offerPrice ? product.offerPrice : ''}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Stock Quantity *</label>
                                        <input type="number" class="form-control" id="productStock" required min="0"
                                               value="${isEdit ? product.stockQuantity : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Status *</label>
                                        <select class="form-select" id="productStatus" required>
                                            <option value="active" ${isEdit && product.status === 'active' ? 'selected' : ''}>Active</option>
                                            <option value="inactive" ${isEdit && product.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveProduct()">
                            <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
    loadCategoriesForProductModal(isEdit ? product.categoryId : null);
}

async function loadCategoriesForFilter() {
    try {
        const response = await fetch('admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=list'
        });

        if (response.ok) {
            const categories = await response.json();
            const select = document.getElementById('categoryFilter');
            if (select) {
                select.innerHTML = '<option value="">All Categories</option>' +
                    categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadCategoriesForProductModal(selectedCategoryId = null) {
    try {
        const response = await fetch('admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=list'
        });

        if (response.ok) {
            const categories = await response.json();
            const select = document.getElementById('productCategory');
            if (select) {
                select.innerHTML = '<option value="">Select Category</option>' +
                    categories.filter(cat => cat.status === 'active')
                             .map(cat => `<option value="${cat.id}" ${selectedCategoryId == cat.id ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`)
                             .join('');
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (file.size > 5 * 1024 * 1024) {
            showError('Image size must be less than 5MB');
            input.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 150px; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<i class="fas fa-image fa-3x text-muted"></i>';
    }
}

async function saveProduct() {
    try {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData();
        formData.append('action', editingItem ? 'update' : 'create');
        if (editingItem) formData.append('id', editingItem);
        formData.append('title', document.getElementById('productTitle').value.trim());
        formData.append('author', document.getElementById('productAuthor').value.trim());
        formData.append('isbn', document.getElementById('productIsbn').value.trim());
        formData.append('categoryId', document.getElementById('productCategory').value);
        formData.append('description', document.getElementById('productDescription').value.trim());
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('offerPrice', document.getElementById('productOfferPrice').value || '');
        formData.append('stockQuantity', document.getElementById('productStock').value);
        formData.append('status', document.getElementById('productStatus').value);

        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            formData.append('productImage', imageFile);
        }

        const response = await fetch('staff/products', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            hideModal('productModal');
            showSuccess(result.message);
            loadProducts();
            if (!editingItem) loadDashboardStats();
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Failed to save product');
    }
}

function editProduct(productId) {
    showProductModal(productId);
}

async function deleteProduct(productId) {
    try {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        const result = await Swal.fire({
            title: 'Delete Product',
            text: `Are you sure you want to delete "${product.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33'
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id', productId);

            const response = await fetch('staff/products', {
                method: 'POST',
                body: formData
            });

            const responseData = await response.json();

            if (responseData.success) {
                showSuccess(responseData.message);
                loadProducts();
                loadDashboardStats();
            } else {
                showError(responseData.message);
            }
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
}

// Customer Management Functions
async function loadCustomers() {
    try {
        showTableLoading('customersTableBody');

        const response = await fetch('staff/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=list'
        });

        if (response.ok) {
            allCustomers = await response.json();
            displayCustomers(allCustomers);
        } else {
            throw new Error('Failed to load customers');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showTableError('customersTableBody', 'Failed to load customers');
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No customers found</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.id}</td>
            <td>${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone || 'N/A')}</td>
            <td><span class="badge ${customer.status === 'active' ? 'bg-success' : 'bg-secondary'}">${customer.status}</span></td>
            <td>${formatDate(customer.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="selectCustomerForOrder(${customer.id})" title="Create Order">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterCustomers() {
    const searchTerm = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    
    const filteredCustomers = allCustomers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm))
    );

    displayCustomers(filteredCustomers);
}

// Fixed selectCustomerForOrder function
function selectCustomerForOrder(customerId) {
    const customer = allCustomers.find(c => c.id === customerId);
    if (!customer) {
        showError('Customer not found');
        console.error('Customer not found for ID:', customerId);
        return;
    }

    // Set the customer
    selectedCustomer = {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email
    };

    // Switch to POS section first
    showSection('pos');
    
    // Wait for DOM to be fully updated before updating customer info
    setTimeout(() => {
        // Check if we're in POS section and update customer info
        if (currentSection === 'pos') {
            updateCustomerInfo();
            showSuccess(`Customer ${selectedCustomer.name} selected for order`);
        }
    }, 200); // Increased timeout to 200ms
}
// Enhanced updateCustomerInfo function
function updateCustomerInfo() {
    const customerInfo = document.getElementById('selectedCustomerInfo');
    
    if (!customerInfo) {
        console.error('selectedCustomerInfo element not found');
        // Try to find it again after a short delay
        setTimeout(() => {
            const retryCustomerInfo = document.getElementById('selectedCustomerInfo');
            if (retryCustomerInfo && selectedCustomer) {
                retryCustomerInfo.innerHTML = `
                    <i class="fas fa-user text-success"></i>
                    <strong>${escapeHtml(selectedCustomer.name)}</strong>
                    <small class="text-muted">(${escapeHtml(selectedCustomer.email)})</small>
                `;
            }
        }, 100);
        return;
    }

    if (selectedCustomer) {
        customerInfo.innerHTML = `
            <i class="fas fa-user text-success"></i>
            <strong>${escapeHtml(selectedCustomer.name)}</strong>
            <small class="text-muted">(${escapeHtml(selectedCustomer.email)})</small>
        `;
        console.log('Customer info updated successfully:', selectedCustomer.name);
    } else {
        customerInfo.textContent = 'No customer selected';
    }

    // Update checkout button
    updateCheckoutButton();
}
function showCustomerModal() {
    const modalHtml = `
        <div class="modal fade" id="customerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-plus"></i> Add New Customer
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="customerForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">First Name *</label>
                                        <input type="text" class="form-control" id="customerFirstName" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Last Name *</label>
                                        <input type="text" class="form-control" id="customerLastName" required>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" id="customerEmail" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-control" id="customerPhone">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password *</label>
                                <input type="password" class="form-control" id="customerPassword" required minlength="6">
                                <small class="text-muted">Minimum 6 characters</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveCustomer()">
                            <i class="fas fa-save"></i> Create Customer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}

async function saveCustomer() {
    try {
        const form = document.getElementById('customerForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData();
        formData.append('action', 'create');
        formData.append('firstName', document.getElementById('customerFirstName').value.trim());
        formData.append('lastName', document.getElementById('customerLastName').value.trim());
        formData.append('email', document.getElementById('customerEmail').value.trim());
        formData.append('phone', document.getElementById('customerPhone').value.trim());
        formData.append('password', document.getElementById('customerPassword').value);

        const response = await fetch('staff/customers', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            hideModal('customerModal');
            showSuccess(result.message);
            loadCustomers();
            loadDashboardStats();
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        showError('Failed to save customer');
    }
}

// Order Management Functions
async function loadOrders() {
    try {
        showTableLoading('ordersTableBody');

        const response = await fetch('staff/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=list'
        });

        if (response.ok) {
            allOrders = await response.json();
            displayOrders(allOrders);
        } else {
            throw new Error('Failed to load orders');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showTableError('ordersTableBody', 'Failed to load orders');
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${escapeHtml(order.orderNumber)}</strong></td>
            <td>${escapeHtml(order.customerName)}</td>
            <td>${escapeHtml(order.customerEmail)}</td>
            <td>Rs. ${formatCurrency(order.finalAmount)}</td>
            <td><span class="badge bg-info">${escapeHtml(order.paymentMethod || 'Cash')}</span></td>
            <td><span class="badge ${getOrderStatusBadge(order.status)}">${order.status}</span></td>
            <td>${formatDateTime(order.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="viewOrderDetails(${order.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success btn-action" onclick="printBill(${order.id})" title="Print">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterOrders() {
    const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
    
    const filteredOrders = allOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm) ||
        order.id.toString().includes(searchTerm)
    );

    displayOrders(filteredOrders);
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch('staff/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=view&id=${orderId}`
        });

        if (response.ok) {
            const order = await response.json();
            showOrderDetailsModal(order);
        } else {
            throw new Error('Failed to load order details');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('Failed to load order details');
    }
}

function showOrderDetailsModal(order) {
    const modalHtml = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-receipt"></i> Order Details - ${escapeHtml(order.orderNumber)}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Order Information</h6>
                                <table class="table table-sm">
                                    <tr><td><strong>Order Number:</strong></td><td>${escapeHtml(order.orderNumber)}</td></tr>
                                    <tr><td><strong>Status:</strong></td><td><span class="badge ${getOrderStatusBadge(order.status)}">${order.status}</span></td></tr>
                                    <tr><td><strong>Date:</strong></td><td>${formatDateTime(order.createdAt)}</td></tr>
                                    <tr><td><strong>Payment:</strong></td><td>${escapeHtml(order.paymentMethod || 'Cash')}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6>Customer Information</h6>
                                <table class="table table-sm">
                                    <tr><td><strong>Name:</strong></td><td>${escapeHtml(order.customerName)}</td></tr>
                                    <tr><td><strong>Email:</strong></td><td>${escapeHtml(order.customerEmail)}</td></tr>
                                </table>
                            </div>
                        </div>
                        
                        <h6 class="mt-3">Order Items</h6>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.orderItems.map(item => `
                                        <tr>
                                            <td><strong>${escapeHtml(item.productTitle)}</strong></td>
                                            <td>${item.quantity}</td>
                                            <td>Rs. ${formatCurrency(item.unitPrice)}</td>
                                            <td><strong>Rs. ${formatCurrency(item.totalPrice)}</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-md-6 offset-md-6">
                                <table class="table table-sm">
                                    <tr><td><strong>Subtotal:</strong></td><td>Rs. ${formatCurrency(order.subtotal)}</td></tr>
                                    ${order.discount > 0 ? `<tr><td><strong>Discount:</strong></td><td>Rs. ${formatCurrency(order.discount)}</td></tr>` : ''}
                                    <tr class="table-success"><td><strong>Total:</strong></td><td><strong>Rs. ${formatCurrency(order.finalAmount)}</strong></td></tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" onclick="printBill(${order.id})">
                            <i class="fas fa-print"></i> Print Bill
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}

async function printBill(orderId) {
    try {
        const response = await fetch('staff/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=print-bill&orderId=${orderId}`
        });

        if (response.ok) {
            const billHtml = await response.text();
            const printWindow = window.open('', '_blank');
            printWindow.document.write(billHtml);
            printWindow.document.close();
        } else {
            throw new Error('Failed to generate bill');
        }
    } catch (error) {
        console.error('Error printing bill:', error);
        showError('Failed to print bill');
    }
}

// Utility Functions
function getOrderStatusBadge(status) {
    const badges = {
        'pending': 'bg-warning',
        'confirmed': 'bg-info',
        'completed': 'bg-success',
        'shipped': 'bg-primary',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
}

function showModal(modalHtml) {
    const container = document.getElementById('modalContainer');
    if (container) {
        container.innerHTML = modalHtml;
        const modal = new bootstrap.Modal(container.querySelector('.modal'));
        modal.show();
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    }
}

function showTableLoading(tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        const colCount = tbody.closest('table')?.querySelector('thead tr')?.children.length || 8;
        tbody.innerHTML = `
            <tr>
                <td colspan="${colCount}" class="text-center">
                    <div class="spinner-border text-success" role="status"></div>
                    <p class="mt-2">Loading data...</p>
                </td>
            </tr>
        `;
    }
}

function showTableError(tableBodyId, message) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        const colCount = tbody.closest('table')?.querySelector('thead tr')?.children.length || 8;
        tbody.innerHTML = `
            <tr>
                <td colspan="${colCount}" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="mt-2">${message}</p>
                    <button class="btn btn-sm btn-outline-success" onclick="location.reload()">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

function showPOSError(message) {
    const grid = document.getElementById('posProductGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="text-center text-danger p-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <p>${message}</p>
                <button class="btn btn-outline-success" onclick="loadPOSProducts()">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: message,
        confirmButtonText: 'OK'
    });
}

function showInfo(message) {
    Swal.fire({
        icon: 'info',
        title: 'Information',
        text: message,
        confirmButtonText: 'OK'
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '0.00';
    return parseFloat(amount).toFixed(2);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
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

// Additional POS Helper Functions
function showPOSLoading() {
    const grid = document.getElementById('posProductGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-success" role="status"></div>
                <p class="mt-2">Loading products...</p>
            </div>
        `;
    }
}

// Keyboard shortcuts for POS
document.addEventListener('keydown', function(event) {
    if (currentSection === 'pos') {
        // F1 - Customer search
        if (event.key === 'F1') {
            event.preventDefault();
            showCustomerSearchModal();
        }
        // F2 - Product search focus
        else if (event.key === 'F2') {
            event.preventDefault();
            const searchInput = document.getElementById('posProductSearch');
            if (searchInput) searchInput.focus();
        }
        // F3 - Clear cart
        else if (event.key === 'F3') {
            event.preventDefault();
            if (cartItems.length > 0) {
                Swal.fire({
                    title: 'Clear Cart?',
                    text: 'Are you sure you want to clear the cart?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, clear it',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        clearCart();
                    }
                });
            }
        }
        // Enter - Process order (when focused on discount or payment)
        else if (event.key === 'Enter' && (
            event.target.id === 'discountAmount' || 
            event.target.id === 'paymentMethod' ||
            event.target.id === 'cashReceived'
        )) {
            event.preventDefault();
            if (!document.getElementById('checkoutBtn').disabled) {
                processOrder();
            }
        }
    }
});

// Auto-refresh dashboard stats every 5 minutes
setInterval(() => {
    if (currentSection === 'dashboard') {
        loadDashboardStats();
    }
}, 5 * 60 * 1000);

// Network status monitoring
window.addEventListener('online', function() {
    showSuccess('Connection restored');
});

window.addEventListener('offline', function() {
    showError('Connection lost - some features may not work');
});

// Initialize tooltips for better UX
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Call tooltip initialization after DOM updates
function updateTooltips() {
    // Dispose existing tooltips
    const existingTooltips = document.querySelectorAll('.tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
    
    // Reinitialize
    setTimeout(initializeTooltips, 100);
}

// Enhanced error handling for fetch requests
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('Fetch error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Network error - please check your connection');
        } else {
            showError('Server error - please try again');
        }
        
        throw error;
    }
}

// Export functionality for reports (if needed)
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length - 1; j++) { // Exclude actions column
            let cellText = cols[j].innerText.replace(/"/g, '""');
            row.push('"' + cellText + '"');
        }
        
        csv.push(row.join(','));
    }

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Cache management for better performance
const cache = {
    categories: null,
    cacheTime: null,
    
    setCategories: function(data) {
        this.categories = data;
        this.cacheTime = Date.now();
    },
    
    getCategories: function() {
        const fiveMinutes = 5 * 60 * 1000;
        if (this.categories && (Date.now() - this.cacheTime) < fiveMinutes) {
            return this.categories;
        }
        return null;
    },
    
    clear: function() {
        this.categories = null;
        this.cacheTime = null;
    }
};

// Enhanced category loading with cache
async function loadCategoriesWithCache() {
    const cached = cache.getCategories();
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch('admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=list'
        });

        if (response.ok) {
            const categories = await response.json();
            cache.setCategories(categories);
            return categories;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
    
    return [];
}

// Session management
function checkSession() {
    // This would typically check if the session is still valid
    // For now, we'll just log it
    console.log('Session check - Staff dashboard active');
}

// Check session every 10 minutes
setInterval(checkSession, 10 * 60 * 1000);

// Cleanup function for when page is unloaded
window.addEventListener('beforeunload', function() {
    // Clear any intervals or cleanup resources
    cache.clear();
});

// Performance monitoring
const performanceMonitor = {
    startTime: null,
    
    start: function(operation) {
        this.startTime = performance.now();
        console.log(`Starting: ${operation}`);
    },
    
    end: function(operation) {
        if (this.startTime) {
            const duration = performance.now() - this.startTime;
            console.log(`Completed: ${operation} in ${duration.toFixed(2)}ms`);
            this.startTime = null;
        }
    }
};

// Add performance monitoring to key operations
const originalLoadProducts = loadProducts;
loadProducts = async function() {
    performanceMonitor.start('Load Products');
    try {
        await originalLoadProducts();
    } finally {
        performanceMonitor.end('Load Products');
    }
};

const originalProcessOrder = processOrder;
processOrder = async function() {
    performanceMonitor.start('Process Order');
    try {
        await originalProcessOrder();
    } finally {
        performanceMonitor.end('Process Order');
    }
};

// Initialize application
console.log('Staff Dashboard JavaScript fully loaded and initialized');

// Final initialization call
setTimeout(() => {
    updateTooltips();
    console.log('Staff Dashboard ready for use');
}, 1000);
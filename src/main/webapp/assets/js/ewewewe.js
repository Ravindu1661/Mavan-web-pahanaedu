/**
 * Staff Dashboard JavaScript
 */

let currentSection = 'dashboard';
let allProducts = [];
let allCustomers = [];
let allOrders = [];
let editingItem = null;
let cartItems = [];
let selectedCustomer = null;

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

    // POS product search
    const posProductSearch = document.getElementById('posProductSearch');
    if (posProductSearch) {
        posProductSearch.addEventListener('input', debounce(() => loadPOSProducts(), 300));
    }

    // Discount input
    const discountInput = document.getElementById('discountAmount');
    if (discountInput) {
        discountInput.addEventListener('input', updateCartSummary);
    }
}

// Show specific section
function showSection(sectionName) {
    try {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
            currentSection = sectionName;

            const navLink = document.getElementById(`nav-${sectionName}`);
            if (navLink) {
                navLink.classList.add('active');
            }

            document.getElementById('sectionTitle').textContent = getSectionTitle(sectionName);
            loadSectionData(sectionName);
        }
    } catch (error) {
        console.error(`Error showing section ${sectionName}:`, error);
        showError('Failed to load section');
    }
}

function getSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Staff Dashboard',
        'pos': 'POS Terminal',
        'products': 'Product Management',
        'customers': 'Customer Management',
        'orders': 'Order Management',
        'search-orders': 'Search Orders'
    };
    return titles[sectionName] || 'Staff Dashboard';
}

function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            loadDashboardStats();
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
        case 'pos':
            loadPOSProducts();
            clearCart();
            selectedCustomer = null;
            updateCustomerInfo();
            break;
        case 'search-orders':
            clearSearchResults();
            break;
    }
}

// Dashboard Stats
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
        'todayRevenue': `Rs. ${formatCurrency(stats.todayRevenue)}`
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Product Management
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

    tbody.innerHTML = products.map(product => `
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
            <td>Rs. ${formatCurrency(product.offerPrice || product.price)}</td>
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
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                            (product.author && product.author.toLowerCase().includes(searchTerm)) ||
                            (product.isbn && product.isbn.toLowerCase().includes(searchTerm));
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
                                <div class="col-md-4">
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

// Customer Management
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

// Order Management
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
            <td>${escapeHtml(order.paymentMethod)}</td>
            <td><span class="badge ${getOrderStatusBadge(order.status)}">${order.status}</span></td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="viewOrder(${order.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success btn-action" onclick="printOrder(${order.id})" title="Print">
                    <i class="fas fa-print"></i>
                </button>
                ${order.status === 'pending' ? `
                <button class="btn btn-sm btn-outline-success btn-action" onclick="updateOrderStatus(${order.id}, 'delivered')" title="Complete">
                    <i class="fas fa-check"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(orderId, status) {
    try {
        const formData = new FormData();
        formData.append('action', 'update-status');
        formData.append('id', orderId);
        formData.append('status', status);

        const response = await fetch('staff/orders', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(result.message);
            loadOrders();
            loadDashboardStats();
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Failed to update order status');
    }
}

async function viewOrder(orderId) {
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
                                    <tr><td><strong>Date:</strong></td><td>${formatDate(order.createdAt)}</td></tr>
                                    <tr><td><strong>Payment Method:</strong></td><td>${escapeHtml(order.paymentMethod)}</td></tr>
                                    <tr><td><strong>Amount:</strong></td><td><strong>Rs. ${formatCurrency(order.finalAmount)}</strong></td></tr>
                                    <tr><td><strong>Notes:</strong></td><td>${escapeHtml(order.notes || 'N/A')}</td></tr>
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
                                        <th>Price</th>
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
                        
                        <div class="text-end">
                            <p><strong>Subtotal:</strong> Rs. ${formatCurrency(order.subtotal)}</p>
                            <p><strong>Discount:</strong> Rs. ${formatCurrency(order.discount)}</p>
                            <p><strong>Total:</strong> Rs. ${formatCurrency(order.finalAmount)}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" onclick="printOrder(${order.id})">
                            <i class="fas fa-print"></i> Print Bill
                        </button>
                        ${order.status === 'pending' ? `
                        <button type="button" class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'delivered')">
                            <i class="fas fa-check"></i> Complete Order
                        </button>
                        ` : ''}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}

// POS Terminal Functions
async function loadPOSProducts() {
    try {
        const searchTerm = document.getElementById('posProductSearch')?.value.trim() || '';
        const grid = document.getElementById('posProductGrid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-success" role="status"></div>
                <p class="mt-2">Loading products...</p>
            </div>
        `;

        const formData = new FormData();
        formData.append('action', 'search-pos');
        if (searchTerm) formData.append('keyword', searchTerm);

        const response = await fetch('staff/products', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const products = await response.json();
            displayPOSProducts(products);
        } else {
            throw new Error('Failed to load POS products');
        }
    } catch (error) {
        console.error('Error loading POS products:', error);
        document.getElementById('posProductGrid').innerHTML = `
            <div class="text-center p-5 text-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <p class="mt-2">Failed to load products</p>
            </div>
        `;
    }
}

function displayPOSProducts(products) {
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div class="text-center p-5">No products found</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card position-relative" onclick="addToCart(${product.id})">
            ${product.imagePath ? 
                `<img src="${escapeHtml(product.imagePath)}" alt="${escapeHtml(product.title)}">` :
                `<div style="width: 80px; height: 100px; background: #f8f9fa; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                    <i class="fas fa-image text-muted"></i>
                </div>`
            }
            <span class="badge bg-success stock-badge">${product.stockQuantity}</span>
            <h6 class="mb-1">${escapeHtml(product.title)}</h6>
            <small class="text-muted">${escapeHtml(product.author || 'N/A')}</small>
            <p class="mb-0 text-success"><strong>Rs. ${formatCurrency(product.price)}</strong></p>
        </div>
    `).join('');
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId) || 
        { id: productId, title: 'Loading...', price: 0, stockQuantity: 0 }; // Fallback

    const existingItem = cartItems.find(item => item.productId === productId);
    if (existingItem) {
        if (existingItem.quantity < product.stockQuantity) {
            existingItem.quantity++;
        } else {
            showError('Cannot add more items than available stock');
            return;
        }
    } else {
        if (product.stockQuantity > 0) {
            cartItems.push({
                productId: productId,
                productTitle: product.title,
                unitPrice: product.offerPrice || product.price,
                quantity: 1,
                stockQuantity: product.stockQuantity
            });
        } else {
            showError('Product is out of stock');
            return;
        }
    }

    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!cartItemsDiv) return;

    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                <p>Cart is empty</p>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartItemsDiv.innerHTML = cartItems.map((item, index) => `
            <div class="cart-item">
                <div>
                    <strong>${escapeHtml(item.productTitle)}</strong><br>
                    <small>Rs. ${formatCurrency(item.unitPrice)} × ${item.quantity}</small>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity(${index}, 1)">+</button>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = !selectedCustomer;
    }

    updateCartSummary();
}

function updateCartQuantity(index, change) {
    const item = cartItems[index];
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
        removeFromCart(index);
    } else if (newQuantity <= item.stockQuantity) {
        item.quantity = newQuantity;
        updateCartDisplay();
    } else {
        showError('Cannot add more items than available stock');
    }
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartDisplay();
}

function clearCart() {
    cartItems = [];
    document.getElementById('discountAmount').value = '0';
    updateCartDisplay();
}

function updateCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => 
        sum + (item.unitPrice * item.quantity), 0);
    
    const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const total = Math.max(subtotal - discount, 0);

    document.getElementById('cartSubtotal').textContent = `Rs. ${formatCurrency(subtotal)}`;
    document.getElementById('cartDiscount').textContent = `Rs. ${formatCurrency(discount)}`;
    document.getElementById('cartTotal').textContent = `Rs. ${formatCurrency(total)}`;
}

function showCustomerSearchModal() {
    const modalHtml = `
        <div class="modal fade" id="customerSearchModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-users"></i> Select Customer
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="customerSearchInput" placeholder="Search by name, email, or phone...">
                            </div>
                        </div>
                        <button class="btn btn-outline-success mb-3" onclick="showGuestCustomerForm()">
                            <i class="fas fa-user-plus"></i> Add Guest Customer
                        </button>
                        <div id="customerSearchResults" class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="customerSearchTableBody">
                                    <tr>
                                        <td colspan="4" class="text-center">
                                            <div class="spinner-border text-success" role="status"></div>
                                            <p class="mt-2">Loading customers...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
    loadPOSCustomers();

    const searchInput = document.getElementById('customerSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => loadPOSCustomers(), 300));
    }
}

async function loadPOSCustomers() {
    try {
        const searchTerm = document.getElementById('customerSearchInput')?.value.trim() || '';
        const tbody = document.getElementById('customerSearchTableBody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="spinner-border text-success" role="status"></div>
                    <p class="mt-2">Loading customers...</p>
                </td>
            </tr>
        `;

        const formData = new FormData();
        formData.append('action', 'search-pos');
        if (searchTerm) formData.append('keyword', searchTerm);

        const response = await fetch('staff/customers', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const customers = await response.json();
            displayPOSCustomers(customers);
        } else {
            throw new Error('Failed to load customers');
        }
    } catch (error) {
        console.error('Error loading POS customers:', error);
        document.getElementById('customerSearchTableBody').innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="mt-2">Failed to load customers</p>
                </td>
            </tr>
        `;
    }
}

function displayPOSCustomers(customers) {
    const tbody = document.getElementById('customerSearchTableBody');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No customers found</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${escapeHtml(customer.name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone || 'N/A')}</td>
            <td>
                <button class="btn btn-sm btn-success" onclick="selectCustomer(${customer.id}, '${escapeHtml(customer.name)}', '${escapeHtml(customer.email)}', '${escapeHtml(customer.phone || '')}')">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        </tr>
    `).join('');
}

function selectCustomer(id, name, email, phone) {
    selectedCustomer = { id, name, email, phone };
    updateCustomerInfo();
    hideModal('customerSearchModal');
    updateCartDisplay();
}

function updateCustomerInfo() {
    const infoDiv = document.getElementById('selectedCustomerInfo');
    if (!infoDiv) return;

    if (selectedCustomer) {
        infoDiv.innerHTML = `
            <strong>${escapeHtml(selectedCustomer.name)}</strong><br>
            <small>${escapeHtml(selectedCustomer.email)}</small>
        `;
    } else {
        infoDiv.textContent = 'No customer selected';
    }
}

function showGuestCustomerForm() {
    const modalHtml = `
        <div class="modal fade" id="guestCustomerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user"></i> Add Guest Customer
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="guestCustomerForm">
                            <div class="mb-3">
                                <label class="form-label">First Name *</label>
                                <input type="text" class="form-control" id="guestFirstName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="guestLastName">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-control" id="guestPhone">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="createGuestCustomer()">
                            <i class="fas fa-save"></i> Create Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
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

        const result = await response.json();

        if (result.success) {
            selectCustomer(result.id, result.name, result.email, result.phone);
            hideModal('guestCustomerModal');
            hideModal('customerSearchModal');
            showSuccess('Guest customer created successfully');
            loadCustomers();
            loadDashboardStats();
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error creating guest customer:', error);
        showError('Failed to create guest customer');
    }
}

async function processOrder() {
    try {
        if (!selectedCustomer) {
            showError('Please select a customer');
            return;
        }

        if (cartItems.length === 0) {
            showError('Cart is empty');
            return;
        }

        const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
        const paymentMethod = document.getElementById('paymentMethod').value;

        const orderItems = cartItems.map(item => ({
            productId: item.productId,
            productTitle: item.productTitle,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        }));

        const formData = new FormData();
        formData.append('action', 'create-pos');
        formData.append('customerId', selectedCustomer.id);
        formData.append('orderItems', JSON.stringify(orderItems));
        formData.append('discount', discount);
        formData.append('paymentMethod', paymentMethod);
        formData.append('notes', '');
        formData.append('status', 'pending'); // Explicitly set status to pending

        const response = await fetch('staff/orders', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('Order processed successfully!');
            clearCart();
            selectedCustomer = null;
            updateCustomerInfo();
            loadDashboardStats();
            loadPOSProducts();
            printOrder(result.id);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error processing order:', error);
        showError('Failed to process order');
    }
}

// Order Search Functions
async function searchOrderByNumber() {
    try {
        const orderNumber = document.getElementById('searchOrderNumber').value.trim();
        if (!orderNumber) {
            showError('Please enter an order number');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'search-order');
        formData.append('orderNumber', orderNumber);

        const response = await fetch('staff/orders', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            displaySearchResult(result);
        } else {
            showError(result.message);
            clearSearchResults();
        }
    } catch (error) {
        console.error('Error searching order by number:', error);
        showError('Failed to search order');
    }
}

async function searchOrderById() {
    try {
        const orderId = document.getElementById('searchOrderId').value.trim();
        if (!orderId) {
            showError('Please enter an order ID');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'search-order');
        formData.append('orderId', orderId);

        const response = await fetch('staff/orders', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            displaySearchResult(result);
        } else {
            showError(result.message);
            clearSearchResults();
        }
    } catch (error) {
        console.error('Error searching order by ID:', error);
        showError('Failed to search order');
    }
}

function displaySearchResult(order) {
    const resultsDiv = document.getElementById('searchResults');
    const resultsBody = document.getElementById('searchResultsBody');
    if (!resultsDiv || !resultsBody) return;

    resultsDiv.style.display = 'block';
    document.getElementById('printSearchBtn').setAttribute('onclick', `printOrder(${order.id})`);

    resultsBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Order Information</h6>
                <table class="table table-sm">
                    <tr><td><strong>Order Number:</strong></td><td>${escapeHtml(order.orderNumber)}</td></tr>
                    <tr><td><strong>Status:</strong></td><td><span class="badge ${getOrderStatusBadge(order.status)}">${order.status}</span></td></tr>
                    <tr><td><strong>Date:</strong></td><td>${formatDate(order.createdAt)}</td></tr>
                    <tr><td><strong>Payment Method:</strong></td><td>${escapeHtml(order.paymentMethod)}</td></tr>
                    <tr><td><strong>Amount:</strong></td><td><strong>Rs. ${formatCurrency(order.finalAmount)}</strong></td></tr>
                    <tr><td><strong>Notes:</strong></td><td>${escapeHtml(order.notes || 'N/A')}</td></tr>
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
                        <th>Price</th>
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
        
        <div class="text-end">
            <p><strong>Subtotal:</strong> Rs. ${formatCurrency(order.subtotal)}</p>
            <p><strong>Discount:</strong> Rs. ${formatCurrency(order.discount)}</p>
            <p><strong>Total:</strong> Rs. ${formatCurrency(order.finalAmount)}</p>
        </div>
    `;
}

function clearSearchResults() {
    const resultsDiv = document.getElementById('searchResults');
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
        document.getElementById('searchResultsBody').innerHTML = '';
    }
    document.getElementById('searchOrderNumber').value = '';
    document.getElementById('searchOrderId').value = '';
}

async function printOrder(orderId) {
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
        console.error('Error printing order:', error);
        showError('Failed to print bill');
    }
}

function printSearchedOrder() {
    const printBtn = document.getElementById('printSearchBtn');
    if (printBtn) {
        printBtn.click();
    }
}

// Utility Functions
function selectCustomerForOrder(customerId) {
    const customer = allCustomers.find(c => c.id === customerId);
    if (!customer) return;

    Swal.fire({
        title: 'Create Order',
        text: `Create order for ${customer.firstName} ${customer.lastName}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, create order',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            selectedCustomer = {
                id: customer.id,
                name: `${customer.firstName} ${customer.lastName}`,
                email: customer.email,
                phone: customer.phone
            };
            showSection('pos');
            updateCustomerInfo();
        }
    });
}

function getOrderStatusBadge(status) {
    const badges = {
        'pending': 'bg-warning',
        'confirmed': 'bg-info',
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
        const colCount = tbody.closest('table')?.querySelector('thead tr')?.children.length || 7;
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
        const colCount = tbody.closest('table')?.querySelector('thead tr')?.children.length || 7;
        tbody.innerHTML = `
            <tr>
                <td colspan="${colCount}" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="mt-2">${message}</p>
                    <button class="btn btn-sm btn-outline-success" onclick="loadSectionData('${currentSection}')">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </td>
            </tr>
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

console.log('Staff Dashboard JavaScript loaded successfully');/**
 * 
 */
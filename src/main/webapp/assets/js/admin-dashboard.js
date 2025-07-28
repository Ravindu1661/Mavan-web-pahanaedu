/**
 * Admin Dashboard JavaScript
 * Complete implementation for Pahana Edu Admin Panel
 */

// Global variables
let currentSection = 'dashboard';
let allUsers = [];
let allCategories = [];
let allProducts = [];
let allPromoCodes = [];
let allOrders = [];
let editingItem = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    initializeDashboard();
});

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    try {
        loadDashboardStats();
        setupEventListeners();
        setupSearchFilters();
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to initialize dashboard');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search input listeners
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', debounce(() => filterUsers(), 300));
    }

    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(() => filterProducts(), 300));
    }

    const orderSearch = document.getElementById('orderSearch');
    if (orderSearch) {
        orderSearch.addEventListener('input', debounce(() => filterOrders(), 300));
    }

    // Filter listeners
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }

    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }
}

/**
 * Setup search filters
 */
function setupSearchFilters() {
    // Debounce function for search
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
}

/**
 * Show specific section
 */
function showSection(sectionName) {
    try {
        // Hide all sections
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

            // Update title
            updateSectionTitle(sectionName);

            // Add active class to nav link
            const navLink = document.getElementById(`nav-${sectionName}`);
            if (navLink) {
                navLink.classList.add('active');
            }

            // Load section data
            loadSectionData(sectionName);
        }
    } catch (error) {
        console.error(`Error showing section ${sectionName}:`, error);
        showError('Failed to load section');
    }
}

/**
 * Update section title
 */
function updateSectionTitle(sectionName) {
    const titleElement = document.getElementById('sectionTitle');
    const titles = {
        'dashboard': 'Dashboard',
        'users': 'User Management',
        'categories': 'Category Management',
        'products': 'Product Management',
        'promo-codes': 'Promo Code Management',
        'orders': 'Order Management'
    };

    if (titleElement && titles[sectionName]) {
        titleElement.textContent = titles[sectionName];
    }
}

/**
 * Load section data
 */
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'users':
            loadUsers();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'products':
            loadProducts();
            loadCategoriesForFilter();
            break;
        case 'promo-codes':
            loadPromoCodes();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

// ===================== DASHBOARD SECTION =====================

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        showLoading('dashboard');
        
        const response = await fetch('admin/dashboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
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

/**
 * Update dashboard statistics display
 */
function updateDashboardStats(stats) {
    const elements = {
        'totalUsers': stats.totalUsers || 0,
        'totalCustomers': stats.totalCustomers || 0,
        'totalStaff': stats.totalStaff || 0, // New stat for staff count
        'totalProducts': stats.totalProducts || 0,
        'activeProducts': stats.activeProducts || 0,
        'totalOrders': stats.totalOrders || 0,
        'pendingOrders': stats.pendingOrders || 0,
        'todayOrders': stats.todayOrders || 0,
        'totalCategories': stats.totalCategories || 0,
        'totalPromoCodes': stats.totalPromoCodes || 0,
        'monthlyRevenue': `Rs. ${formatCurrency(stats.monthlyRevenue || 0)}`
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}
// ===================== USER MANAGEMENT =====================

/**
 * Load users
 */
async function loadUsers() {
    try {
        showTableLoading('usersTableBody');

        const response = await fetch('admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=list'
        });

        if (response.ok) {
            allUsers = await response.json();
            displayUsers(allUsers);
        } else {
            throw new Error('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showTableError('usersTableBody', 'Failed to load users');
    }
}

/**
 * Display users in table
 */
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.phone || 'N/A')}</td>
            <td><span class="badge ${getRoleBadgeClass(user.role)}">${user.role}</span></td>
            <td><span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}">${user.status}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editUser(${user.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning btn-action" onclick="toggleUserStatus(${user.id})" title="Toggle Status">
                    <i class="fas fa-toggle-on"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteUser(${user.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
/**
 * Get role badge CSS class - New helper function
 */
function getRoleBadgeClass(role) {
    switch(role) {
        case 'ADMIN':
            return 'bg-danger';
        case 'STAFF':
            return 'bg-warning';
        case 'CUSTOMER':
            return 'bg-primary';
        default:
            return 'bg-secondary';
    }
}
/**
 * Filter users - Updated to handle STAFF role in search
 */
function filterUsers() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    
    const filteredUsers = allUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    displayUsers(filteredUsers);
}


/**
 * Show user modal - Updated with STAFF role support
 */
function showUserModal(userId = null) {
    editingItem = userId;
    const isEdit = userId !== null;
    const user = isEdit ? allUsers.find(u => u.id === userId) : null;

    const modalHtml = `
        <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="userModalLabel">
                            <i class="fas fa-user"></i> ${isEdit ? 'Edit User' : 'Add New User'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="userForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="firstName" class="form-label">First Name *</label>
                                        <input type="text" class="form-control" id="firstName" required
                                               value="${isEdit ? escapeHtml(user.firstName) : ''}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="lastName" class="form-label">Last Name *</label>
                                        <input type="text" class="form-control" id="lastName" required
                                               value="${isEdit ? escapeHtml(user.lastName) : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email *</label>
                                <input type="email" class="form-control" id="email" required
                                       value="${isEdit ? escapeHtml(user.email) : ''}">
                            </div>
                            <div class="mb-3">
                                <label for="phone" class="form-label">Phone</label>
                                <input type="tel" class="form-control" id="phone"
                                       value="${isEdit ? escapeHtml(user.phone || '') : ''}">
                            </div>
                            ${!isEdit ? `
                            <div class="mb-3">
                                <label for="password" class="form-label">Password *</label>
                                <input type="password" class="form-control" id="password" required minlength="6"
                                       placeholder="Enter password (minimum 6 characters)">
                                <small class="text-muted">Password must be at least 6 characters long</small>
                            </div>
                            ` : ''}
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="role" class="form-label">Role *</label>
                                        <select class="form-select" id="role" required ${isEdit ? 'onchange="checkRoleChange()"' : ''}>
                                            <option value="CUSTOMER" ${isEdit && user.role === 'CUSTOMER' ? 'selected' : ''}>Customer</option>
                                            <option value="STAFF" ${isEdit && user.role === 'STAFF' ? 'selected' : ''}>Staff</option>
                                            ${!isEdit || user.role === 'ADMIN' ? '<option value="ADMIN" ' + (isEdit && user.role === 'ADMIN' ? 'selected' : '') + '>Admin</option>' : ''}
                                        </select>
                                        ${isEdit && user.role === 'ADMIN' ? '<small class="text-warning">Admin role can only be changed to Staff</small>' : ''}
                                        ${isEdit && user.role === 'STAFF' ? '<small class="text-info">Staff role can be changed to Customer or Admin</small>' : ''}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="status" class="form-label">Status *</label>
                                        <select class="form-select" id="status" required>
                                            <option value="active" ${isEdit && user.status === 'active' ? 'selected' : ''}>Active</option>
                                            <option value="inactive" ${isEdit && user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            ${isEdit && user.role === 'STAFF' ? `
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>Staff Role:</strong> This user has staff privileges and can access admin functions except user management.
                            </div>
                            ` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveUser()">
                            <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}
/**
 * Check role change and handle STAFF role conversions - Updated
 */
function checkRoleChange() {
    const role = document.getElementById('role').value;
    const user = allUsers.find(u => u.id === editingItem);
    
    if (user) {
        // Allow all role changes for staff and admin
        if (user.role === 'CUSTOMER' && (role === 'ADMIN' || role === 'STAFF')) {
            // Show confirmation for customer to admin/staff conversion
            const roleText = role === 'ADMIN' ? 'Administrator' : 'Staff Member';
            Swal.fire({
                title: 'Role Change Confirmation',
                text: `Are you sure you want to change this customer to ${roleText}? This will give them additional privileges.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, change role',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (!result.isConfirmed) {
                    document.getElementById('role').value = 'CUSTOMER';
                }
            });
        }
        
        if (user.role === 'ADMIN' && role === 'CUSTOMER') {
            // Warn about admin to customer conversion
            Swal.fire({
                title: 'Warning: Admin Demotion',
                text: 'Changing an Admin to Customer will remove all administrative privileges. Are you sure?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, demote to customer',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33'
            }).then((result) => {
                if (!result.isConfirmed) {
                    document.getElementById('role').value = 'ADMIN';
                }
            });
        }
        
        if (user.role === 'STAFF' && role === 'CUSTOMER') {
            // Warn about staff to customer conversion
            Swal.fire({
                title: 'Staff Demotion',
                text: 'Changing a Staff member to Customer will remove their staff privileges. Continue?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, change to customer',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (!result.isConfirmed) {
                    document.getElementById('role').value = 'STAFF';
                }
            });
        }
    }
}


/**
 * Save user
 */
async function saveUser() {
    try {
        const form = document.getElementById('userForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Additional validation for new users
        if (!editingItem) {
            const password = document.getElementById('password').value;
            if (!password || password.length < 6) {
                showError('Password must be at least 6 characters long');
                return;
            }
        }

        const formData = new FormData();
        formData.append('action', editingItem ? 'update' : 'create');
        if (editingItem) formData.append('id', editingItem);
        formData.append('firstName', document.getElementById('firstName').value.trim());
        formData.append('lastName', document.getElementById('lastName').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('phone', document.getElementById('phone').value.trim());
        formData.append('role', document.getElementById('role').value);
        formData.append('status', document.getElementById('status').value);
        
        // Add password for new users
        if (!editingItem) {
            formData.append('password', document.getElementById('password').value);
        }

        const response = await fetch('admin/users', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            hideModal('userModal');
            showSuccess(result.message);
            loadUsers();
            if (!editingItem) loadDashboardStats(); // Refresh stats if new user
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showError('Failed to save user');
    }
}

/**
 * Edit user
 */
function editUser(userId) {
    showUserModal(userId);
}

/**
 * Toggle user status
 */
async function toggleUserStatus(userId) {
    try {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        const result = await Swal.fire({
            title: 'Toggle User Status',
            text: `Are you sure you want to ${user.status === 'active' ? 'deactivate' : 'activate'} this user?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, toggle it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'toggle-status');
            formData.append('id', userId);

            const response = await fetch('admin/users', {
                method: 'POST',
                body: formData
            });

            const responseData = await response.json();

            if (responseData.success) {
                showSuccess(responseData.message);
                loadUsers();
            } else {
                showError(responseData.message);
            }
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        showError('Failed to update user status');
    }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
    try {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        const result = await Swal.fire({
            title: 'Delete User',
            text: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33'
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id', userId);

            const response = await fetch('admin/users', {
                method: 'POST',
                body: formData
            });

            const responseData = await response.json();

            if (responseData.success) {
                showSuccess(responseData.message);
                loadUsers();
                loadDashboardStats(); // Refresh stats
            } else {
                showError(responseData.message);
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Failed to delete user');
    }
}

// ===================== CATEGORY MANAGEMENT =====================

/**
 * Load categories
 */
async function loadCategories() {
    try {
        showTableLoading('categoriesTableBody');

        const response = await fetch('admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=list'
        });

        if (response.ok) {
            allCategories = await response.json();
            displayCategories(allCategories);
        } else {
            throw new Error('Failed to load categories');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showTableError('categoriesTableBody', 'Failed to load categories');
    }
}

/**
 * Display categories in table
 */
function displayCategories(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No categories found</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td><strong>${escapeHtml(category.name)}</strong></td>
            <td>${escapeHtml(category.description || 'N/A')}</td>
            <td><span class="badge ${category.status === 'active' ? 'bg-success' : 'bg-secondary'}">${category.status}</span></td>
            <td><span class="badge bg-info">${category.productCount || 0}</span></td>
            <td>${formatDate(category.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editCategory(${category.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteCategory(${category.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Show category modal
 */
function showCategoryModal(categoryId = null) {
    editingItem = categoryId;
    const isEdit = categoryId !== null;
    const category = isEdit ? allCategories.find(c => c.id === categoryId) : null;

    const modalHtml = `
        <div class="modal fade" id="categoryModal" tabindex="-1" aria-labelledby="categoryModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="categoryModalLabel">
                            <i class="fas fa-tags"></i> ${isEdit ? 'Edit Category' : 'Add New Category'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="categoryForm">
                            <div class="mb-3">
                                <label for="categoryName" class="form-label">Category Name *</label>
                                <input type="text" class="form-control" id="categoryName" required
                                       value="${isEdit ? escapeHtml(category.name) : ''}"
                                       placeholder="Enter category name">
                            </div>
                            <div class="mb-3">
                                <label for="categoryDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="categoryDescription" rows="3"
                                          placeholder="Enter category description">${isEdit ? escapeHtml(category.description || '') : ''}</textarea>
                            </div>
                            ${isEdit ? `
                            <div class="mb-3">
                                <label for="categoryStatus" class="form-label">Status *</label>
                                <select class="form-select" id="categoryStatus" required>
                                    <option value="active" ${category.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${category.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                            ` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveCategory()">
                            <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Category
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}

/**
 * Save category
 */
async function saveCategory() {
    try {
        const form = document.getElementById('categoryForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData();
        formData.append('action', editingItem ? 'update' : 'create');
        if (editingItem) formData.append('id', editingItem);
        formData.append('name', document.getElementById('categoryName').value.trim());
        formData.append('description', document.getElementById('categoryDescription').value.trim());
        if (editingItem) formData.append('status', document.getElementById('categoryStatus').value);

        const response = await fetch('admin/categories', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            hideModal('categoryModal');
            showSuccess(result.message);
            loadCategories();
            loadCategoriesForFilter(); // Update product filter
            if (!editingItem) loadDashboardStats(); // Refresh stats if new category
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showError('Failed to save category');
    }
}

/**
 * Edit category
 */
function editCategory(categoryId) {
    showCategoryModal(categoryId);
}

/**
 * Delete category
 */
async function deleteCategory(categoryId) {
    try {
        const category = allCategories.find(c => c.id === categoryId);
        if (!category) return;

        const result = await Swal.fire({
            title: 'Delete Category',
            text: `Are you sure you want to delete "${category.name}"? This will affect ${category.productCount || 0} products.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33'
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id', categoryId);

            const response = await fetch('admin/categories', {
                method: 'POST',
                body: formData
            });

            const responseData = await response.json();

            if (responseData.success) {
                showSuccess(responseData.message);
                loadCategories();
                loadCategoriesForFilter();
                loadDashboardStats(); // Refresh stats
            } else {
                showError(responseData.message);
            }
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showError('Failed to delete category');
    }
}

/**
 * Load categories for filter dropdown
 */
async function loadCategoriesForFilter() {
    try {
        const response = await fetch('admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
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
        console.error('Error loading categories for filter:', error);
    }
}

// ===================== PRODUCT MANAGEMENT =====================

/**
 * Load products
 */
async function loadProducts() {
    try {
        showTableLoading('productsTableBody');

        const response = await fetch('admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
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

/**
 * Display products in table
 */
function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No products found</td></tr>';
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
            <td><span class="badge bg-secondary">${escapeHtml(product.categoryName || 'N/A')}</span></td>
            <td>
                Rs. ${formatCurrency(product.price)}
                ${product.offerPrice ? `<br><small class="text-success">Offer: Rs. ${formatCurrency(product.offerPrice)}</small>` : ''}
            </td>
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

/**
 * Filter products
 */
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

/**
 * Show product modal
 */
function showProductModal(productId = null) {
    editingItem = productId;
    const isEdit = productId !== null;
    const product = isEdit ? allProducts.find(p => p.id === productId) : null;

    const modalHtml = `
        <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="productModalLabel">
                            <i class="fas fa-book"></i> ${isEdit ? 'Edit Product' : 'Add New Product'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm" enctype="multipart/form-data">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label for="productTitle" class="form-label">Book Title *</label>
                                        <input type="text" class="form-control" id="productTitle" required
                                               value="${isEdit ? escapeHtml(product.title) : ''}"
                                               placeholder="Enter book title">
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="productAuthor" class="form-label">Author</label>
                                                <input type="text" class="form-control" id="productAuthor"
                                                       value="${isEdit ? escapeHtml(product.author || '') : ''}"
                                                       placeholder="Enter author name">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="productIsbn" class="form-label">ISBN</label>
                                                <input type="text" class="form-control" id="productIsbn"
                                                       value="${isEdit ? escapeHtml(product.isbn || '') : ''}"
                                                       placeholder="Enter ISBN">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productCategory" class="form-label">Category *</label>
                                        <select class="form-select" id="productCategory" required>
                                            <option value="">Select Category</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productDescription" class="form-label">Description</label>
                                        <textarea class="form-control" id="productDescription" rows="3"
                                                  placeholder="Enter product description">${isEdit ? escapeHtml(product.description || '') : ''}</textarea>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="productImage" class="form-label">Product Image</label>
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
                                        ${isEdit && product.imagePath ? `<input type="hidden" id="currentImagePath" value="${escapeHtml(product.imagePath)}">` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label for="productPrice" class="form-label">Price (Rs.) *</label>
                                        <input type="number" class="form-control" id="productPrice" required step="0.01" min="0"
                                               value="${isEdit ? product.price : ''}"
                                               placeholder="0.00">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label for="productOfferPrice" class="form-label">Offer Price (Rs.)</label>
                                        <input type="number" class="form-control" id="productOfferPrice" step="0.01" min="0"
                                               value="${isEdit && product.offerPrice ? product.offerPrice : ''}"
                                               placeholder="0.00">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label for="productStock" class="form-label">Stock Quantity *</label>
                                        <input type="number" class="form-control" id="productStock" required min="0"
                                               value="${isEdit ? product.stockQuantity : ''}"
                                               placeholder="0">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label for="productStatus" class="form-label">Status *</label>
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
                        <button type="button" class="btn btn-primary" onclick="saveProduct()">
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

/**
 * Load categories for product modal
 */
async function loadCategoriesForProductModal(selectedCategoryId = null) {
    try {
        const response = await fetch('admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
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
        console.error('Error loading categories for product modal:', error);
    }
}

/**
 * Preview image before upload
 */
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showError('Image size must be less than 5MB');
            input.value = '';
            return;
        }

        // Validate file type
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

/**
 * Save product
 */
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
        formData.append('offerPrice', document.getElementById('productOfferPrice').value);
        formData.append('stockQuantity', document.getElementById('productStock').value);
        formData.append('status', document.getElementById('productStatus').value);

        // Handle image upload
        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            formData.append('productImage', imageFile);
        } else if (editingItem) {
            const currentImagePath = document.getElementById('currentImagePath');
            if (currentImagePath) {
                formData.append('imagePath', currentImagePath.value);
            }
        }

        const response = await fetch('admin/products', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            hideModal('productModal');
            showSuccess(result.message);
            loadProducts();
            if (!editingItem) loadDashboardStats(); // Refresh stats if new product
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Failed to save product');
    }
}

/**
 * Edit product
 */
function editProduct(productId) {
    showProductModal(productId);
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
    try {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        const result = await Swal.fire({
            title: 'Delete Product',
            text: `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
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

            const response = await fetch('admin/products', {
                method: 'POST',
                body: formData
            });

            const responseData = await response.json();

            if (responseData.success) {
                showSuccess(responseData.message);
                loadProducts();
                loadDashboardStats(); // Refresh stats
            } else {
                showError(responseData.message);
            }
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
}

// ===================== PROMO CODE MANAGEMENT =====================

/**
 * Load promo codes
 */
async function loadPromoCodes() {
    try {
        showTableLoading('promoCodesTableBody');

        const response = await fetch('admin/promo-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=list'
        });

        if (response.ok) {
            allPromoCodes = await response.json();
            displayPromoCodes(allPromoCodes);
        } else {
            throw new Error('Failed to load promo codes');
        }
    } catch (error) {
        console.error('Error loading promo codes:', error);
        showTableError('promoCodesTableBody', 'Failed to load promo codes');
    }
}

/**
 * Display promo codes in table
 */
function displayPromoCodes(promoCodes) {
    const tbody = document.getElementById('promoCodesTableBody');
    if (!tbody) return;

    if (promoCodes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No promo codes found</td></tr>';
        return;
    }

    tbody.innerHTML = promoCodes.map(promo => `
        <tr>
            <td>${promo.id}</td>
            <td><strong>${escapeHtml(promo.code)}</strong></td>
            <td>${escapeHtml(promo.description || 'N/A')}</td>
            <td><span class="badge ${promo.discountType === 'percentage' ? 'bg-info' : 'bg-warning'}">${promo.discountType}</span></td>
            <td>${promo.discountType === 'percentage' ? promo.discountValue + '%' : 'Rs. ' + formatCurrency(promo.discountValue)}</td>
            <td><span class="badge bg-secondary">${promo.usedCount || 0}</span></td>
            <td>${formatDate(promo.startDate)} - ${formatDate(promo.endDate)}</td>
            <td><span class="badge ${promo.status === 'active' ? 'bg-success' : 'bg-secondary'}">${promo.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editPromoCode(${promo.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deletePromoCode(${promo.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Show promo code modal
 */
function showPromoModal(promoId = null) {
    editingItem = promoId;
    const isEdit = promoId !== null;
    const promo = isEdit ? allPromoCodes.find(p => p.id === promoId) : null;

    const modalHtml = `
        <div class="modal fade" id="promoModal" tabindex="-1" aria-labelledby="promoModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="promoModalLabel">
                            <i class="fas fa-percent"></i> ${isEdit ? 'Edit Promo Code' : 'Add New Promo Code'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="promoForm">
                            <div class="mb-3">
                                <label for="promoCode" class="form-label">Promo Code *</label>
                                <input type="text" class="form-control" id="promoCode" required
                                       value="${isEdit ? escapeHtml(promo.code) : ''}"
                                       placeholder="Enter promo code (e.g., SAVE20)" style="text-transform: uppercase;">
                            </div>
                            <div class="mb-3">
                                <label for="promoDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="promoDescription" rows="2"
                                          placeholder="Enter promo description">${isEdit ? escapeHtml(promo.description || '') : ''}</textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="discountType" class="form-label">Discount Type *</label>
                                        <select class="form-select" id="discountType" required onchange="updateDiscountValueLabel()">
                                            <option value="percentage" ${isEdit && promo.discountType === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
                                            <option value="fixed" ${isEdit && promo.discountType === 'fixed' ? 'selected' : ''}>Fixed Amount (Rs.)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="discountValue" class="form-label" id="discountValueLabel">Discount Value *</label>
                                        <input type="number" class="form-control" id="discountValue" required step="0.01" min="0"
                                               value="${isEdit ? promo.discountValue : ''}"
                                               placeholder="0">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="startDate" class="form-label">Start Date *</label>
                                        <input type="date" class="form-control" id="startDate" required
                                               value="${isEdit ? promo.startDate : ''}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="endDate" class="form-label">End Date *</label>
                                        <input type="date" class="form-control" id="endDate" required
                                               value="${isEdit ? promo.endDate : ''}">
                                    </div>
                                </div>
                            </div>
                            ${isEdit ? `
                            <div class="mb-3">
                                <label for="promoStatus" class="form-label">Status *</label>
                                <select class="form-select" id="promoStatus" required>
                                    <option value="active" ${promo.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${promo.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                            ` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="savePromoCode()">
                            <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Promo Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
    updateDiscountValueLabel(); // Set initial label
}

/**
 * Update discount value label based on type
 */
function updateDiscountValueLabel() {
    const discountType = document.getElementById('discountType')?.value;
    const label = document.getElementById('discountValueLabel');
    if (label && discountType) {
        label.textContent = discountType === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (Rs.) *';
    }
}

/**
 * Save promo code
 */
async function savePromoCode() {
    try {
        const form = document.getElementById('promoForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Validate dates
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        
        if (endDate <= startDate) {
            showError('End date must be after start date');
            return;
        }

        // Validate discount value
        const discountType = document.getElementById('discountType').value;
        const discountValue = parseFloat(document.getElementById('discountValue').value);
        
        if (discountType === 'percentage' && discountValue > 100) {
            showError('Percentage discount cannot exceed 100%');
            return;
        }

        const formData = new FormData();
        formData.append('action', editingItem ? 'update' : 'create');
        if (editingItem) formData.append('id', editingItem);
        formData.append('code', document.getElementById('promoCode').value.trim().toUpperCase());
        formData.append('description', document.getElementById('promoDescription').value.trim());
        formData.append('discountType', discountType);
        formData.append('discountValue', discountValue);
        formData.append('startDate', document.getElementById('startDate').value);
        formData.append('endDate', document.getElementById('endDate').value);
        if (editingItem) formData.append('status', document.getElementById('promoStatus').value);

        const response = await fetch('admin/promo-codes', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            hideModal('promoModal');
            showSuccess(result.message);
            loadPromoCodes();
            if (!editingItem) loadDashboardStats(); // Refresh stats if new promo
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error saving promo code:', error);
        showError('Failed to save promo code');
    }
}

/**
 * Edit promo code
 */
function editPromoCode(promoId) {
    showPromoModal(promoId);
}

/**
 * Delete promo code
 */
async function deletePromoCode(promoId) {
    try {
        const promo = allPromoCodes.find(p => p.id === promoId);
        if (!promo) return;

        const result = await Swal.fire({
            title: 'Delete Promo Code',
            text: `Are you sure you want to delete "${promo.code}"? Used ${promo.usedCount || 0} times.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33'
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id', promoId);

            const response = await fetch('admin/promo-codes', {
                method: 'POST',
                body: formData
            });

            const responseData = await response.json();

            if (responseData.success) {
                showSuccess(responseData.message);
                loadPromoCodes();
                loadDashboardStats(); // Refresh stats
            } else {
                showError(responseData.message);
            }
        }
    } catch (error) {
        console.error('Error deleting promo code:', error);
        showError('Failed to delete promo code');
    }
}

// ===================== ORDER MANAGEMENT =====================

/**
 * Load orders
 */
async function loadOrders() {
    try {
        showTableLoading('ordersTableBody');

        const response = await fetch('admin/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
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

/**
 * Display orders in table
 */
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
            <td><span class="badge bg-info">${order.itemCount || 0}</span></td>
            <td>Rs. ${formatCurrency(order.finalAmount)}</td>
            <td><span class="badge ${getOrderStatusBadge(order.status)}">${order.status}</span></td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="viewOrder(${order.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${order.status === 'pending' ? `
                <button class="btn btn-sm btn-outline-success btn-action" onclick="confirmOrder(${order.id})" title="Confirm Order">
                    <i class="fas fa-check"></i>
                </button>
                ` : ''}
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="printBill(${order.id})" title="Print Bill">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Get order status badge class
 */
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

/**
 * Filter orders
 */
function filterOrders() {
    const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('orderStatusFilter')?.value || '';
    
    const filteredOrders = allOrders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm) ||
                            order.customerName.toLowerCase().includes(searchTerm) ||
                            order.customerEmail.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    displayOrders(filteredOrders);
}

/**
 * Confirm order (only for pending orders)
 */
async function confirmOrder(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;

        if (order.status !== 'pending') {
            showError('Only pending orders can be confirmed');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Order',
            text: `Are you sure you want to confirm order ${order.orderNumber}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, confirm it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'update-status');
            formData.append('id', orderId);
            formData.append('status', 'confirmed');

            const response = await fetch('admin/orders', {
                method: 'POST',
                body: formData
            });

            const responseData = await response.json();

            if (responseData.success) {
                showSuccess(responseData.message);
                loadOrders();
                loadDashboardStats(); // Refresh stats
            } else {
                showError(responseData.message);
            }
        }
    } catch (error) {
        console.error('Error confirming order:', error);
        showError('Failed to confirm order');
    }
}

/**
 * View order details
 */
async function viewOrder(orderId) {
    try {
        const response = await fetch('admin/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
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

/**
 * Show order details modal
 */
function showOrderDetailsModal(order) {
    const modalHtml = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="orderDetailsModalLabel">
                            <i class="fas fa-receipt"></i> Order Details - ${escapeHtml(order.orderNumber)}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-info-circle"></i> Order Information</h6>
                                <table class="table table-sm">
                                    <tr><td><strong>Order Number:</strong></td><td>${escapeHtml(order.orderNumber)}</td></tr>
                                    <tr><td><strong>Status:</strong></td><td><span class="badge ${getOrderStatusBadge(order.status)}">${order.status}</span></td></tr>
                                    <tr><td><strong>Order Date:</strong></td><td>${formatDate(order.createdAt)}</td></tr>
                                    <tr><td><strong>Total Amount:</strong></td><td>Rs. ${formatCurrency(order.totalAmount)}</td></tr>
                                    ${order.discountAmount ? `<tr><td><strong>Discount:</strong></td><td>Rs. ${formatCurrency(order.discountAmount)}</td></tr>` : ''}
                                    <tr><td><strong>Final Amount:</strong></td><td><strong>Rs. ${formatCurrency(order.finalAmount)}</strong></td></tr>
                                    ${order.promoCode ? `<tr><td><strong>Promo Code:</strong></td><td><span class="badge bg-success">${escapeHtml(order.promoCode)}</span></td></tr>` : ''}
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-user"></i> Customer Information</h6>
                                <table class="table table-sm">
                                    <tr><td><strong>Name:</strong></td><td>${escapeHtml(order.customerName)}</td></tr>
                                    <tr><td><strong>Email:</strong></td><td>${escapeHtml(order.customerEmail)}</td></tr>
                                    <tr><td><strong>Phone:</strong></td><td>${escapeHtml(order.customerPhone || 'N/A')}</td></tr>
                                    ${order.userName ? `<tr><td><strong>Account:</strong></td><td>${escapeHtml(order.userName)}</td></tr>` : ''}
                                </table>
                                ${order.shippingAddress ? `
                                <h6 class="mt-3"><i class="fas fa-truck"></i> Shipping Address</h6>
                                <p class="border p-2 rounded bg-light">${escapeHtml(order.shippingAddress)}</p>
                                ` : ''}
                            </div>
                        </div>
                        
                        <h6 class="mt-4"><i class="fas fa-list"></i> Order Items</h6>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Book Title</th>
                                        <th>Author</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.orderItems.map(item => `
                                        <tr>
                                            <td><strong>${escapeHtml(item.productTitle)}</strong></td>
                                            <td>${escapeHtml(item.productAuthor || 'N/A')}</td>
                                            <td>${item.quantity}</td>
                                            <td>Rs. ${formatCurrency(item.unitPrice)}</td>
                                            <td><strong>Rs. ${formatCurrency(item.totalPrice)}</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="printBill(${order.id})">
                            <i class="fas fa-print"></i> Print Bill
                        </button>
                        ${order.status === 'pending' ? `
                        <button type="button" class="btn btn-success" onclick="confirmOrder(${order.id})">
                            <i class="fas fa-check"></i> Confirm Order
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

/**
 * Print bill
 */
async function printBill(orderId) {
    try {
        const response = await fetch('admin/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=print-bill&id=${orderId}`
        });

        if (response.ok) {
            const billContent = await response.text();
            
            // Open bill in new window
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(billContent);
            printWindow.document.close();
            printWindow.focus();
        } else {
            throw new Error('Failed to generate bill');
        }
    } catch (error) {
        console.error('Error printing bill:', error);
        showError('Failed to print bill');
    }
}

// ===================== EXPORT FUNCTIONS =====================

/**
 * Export users to CSV
 */
function exportUsers() {
    try {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Status', 'Created'];
        const data = allUsers.map(user => [
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.phone || '',
            user.role,
            user.status,
            formatDate(user.createdAt)
        ]);

        downloadCSV('users_export.csv', headers, data);
        showSuccess('Users exported successfully');
    } catch (error) {
        console.error('Error exporting users:', error);
        showError('Failed to export users');
    }
}

/**
 * Export products to CSV
 */
function exportProducts() {
    try {
        const headers = ['ID', 'Title', 'Author', 'ISBN', 'Category', 'Price', 'Offer Price', 'Stock', 'Status', 'Created'];
        const data = allProducts.map(product => [
            product.id,
            product.title,
            product.author || '',
            product.isbn || '',
            product.categoryName || '',
            product.price,
            product.offerPrice || '',
            product.stockQuantity,
            product.status,
            formatDate(product.createdAt)
        ]);

        downloadCSV('products_export.csv', headers, data);
        showSuccess('Products exported successfully');
    } catch (error) {
        console.error('Error exporting products:', error);
        showError('Failed to export products');
    }
}

/**
 * Export orders to CSV
 */
function exportOrders() {
    try {
        const headers = ['Order Number', 'Customer Name', 'Email', 'Phone', 'Total Amount', 'Final Amount', 'Status', 'Date'];
        const data = allOrders.map(order => [
            order.orderNumber,
            order.customerName,
            order.customerEmail,
            order.customerPhone || '',
            order.totalAmount,
            order.finalAmount,
            order.status,
            formatDate(order.createdAt)
        ]);

        downloadCSV('orders_export.csv', headers, data);
        showSuccess('Orders exported successfully');
    } catch (error) {
        console.error('Error exporting orders:', error);
        showError('Failed to export orders');
    }
}

/**
 * Download CSV file
 */
function downloadCSV(filename, headers, data) {
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ===================== UTILITY FUNCTIONS =====================

/**
 * Show modal
 */
function showModal(modalHtml) {
    const container = document.getElementById('modalContainer');
    if (container) {
        container.innerHTML = modalHtml;
        const modal = new bootstrap.Modal(container.querySelector('.modal'));
        modal.show();
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    }
}

/**
 * Show loading in dashboard
 */
function showLoading(section) {
    console.log(`Loading ${section}...`);
}

/**
 * Show table loading
 */
function showTableLoading(tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        const colCount = tbody.closest('table')?.querySelector('thead tr')?.children.length || 8;
        tbody.innerHTML = `
            <tr>
                <td colspan="${colCount}" class="text-center">
                    <div class="loading">
                        <div class="spinner-border" role="status"></div>
                        <p class="mt-2">Loading data...</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Show table error
 */
function showTableError(tableBodyId, message) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        const colCount = tbody.closest('table')?.querySelector('thead tr')?.children.length || 8;
        tbody.innerHTML = `
            <tr>
                <td colspan="${colCount}" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="mt-2">${message}</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

/**
 * Show success message
 */
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

/**
 * Show error message
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: message,
        confirmButtonText: 'OK'
    });
}

/**
 * Show info message
 */
function showInfo(message) {
    Swal.fire({
        icon: 'info',
        title: 'Information',
        text: message,
        confirmButtonText: 'OK'
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '0.00';
    return parseFloat(amount).toFixed(2);
}

/**
 * Format date
 */
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

/**
 * Debounce function for search inputs
 */
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

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    return phoneRegex.test(phone);
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate random string for temp passwords, etc.
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard');
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy to clipboard');
    }
}

/**
 * Convert image to base64
 */
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Validate image file
 */
function validateImageFile(file, maxSizeMB = 5) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

    if (!validTypes.includes(file.type)) {
        throw new Error('Please select a valid image file (JPG, PNG, GIF, WEBP)');
    }

    if (file.size > maxSize) {
        throw new Error(`Image size must be less than ${maxSizeMB}MB`);
    }

    return true;
}

/**
 * Initialize tooltips (if using Bootstrap tooltips)
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Search and highlight text in tables
 */
function highlightSearchTerms(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

window.addEventListener('offline', function() {
    showError('Connection lost. Some features may not work properly.');
});



// Start auto-refresh when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Start auto-refresh after 1 minute of initial load
    setTimeout(() => {
        startAutoRefresh(5); // Refresh every 5 minutes
    }, 60000);
    
    // Initialize tooltips
    initializeTooltips();
});

console.log('Admin Dashboard JavaScript loaded successfully - Version 2.1 - Fixed');
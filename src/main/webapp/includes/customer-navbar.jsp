<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!-- Customer Navigation Bar -->
<header class="header" id="mainHeader">
    <nav class="nav-container">
        <!-- Logo Section -->
        <a href="index.jsp" class="logo">
            <i class="fas fa-graduation-cap"></i>
            <span>Pahana Edu</span>
        </a>

        <!-- Desktop Navigation Menu -->
        <ul class="nav-menu" id="navMenu">
            <li><a href="index.jsp#home">Home</a></li>
            <li><a href="index.jsp#products">Books</a></li>
            <li><a href="index.jsp#categories">Categories</a></li>
            <li><a href="about.jsp">About</a></li>
            <li><a href="contact.jsp">Contact</a></li>
        </ul>

        <!-- User Actions -->
        <div class="nav-actions">
            <c:choose>
                <c:when test="${sessionScope.isLoggedIn}">
                    <!-- Logged In User Menu -->
                    <div class="user-menu">
                        <button class="user-menu-toggle" onclick="toggleUserMenu()">
                            <i class="fas fa-user-circle"></i>
                            <span class="user-name">${sessionScope.userName}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        
                        <div class="user-dropdown" id="userDropdown">
                            <div class="dropdown-header">
                                <div class="user-info">
                                    <div class="user-avatar">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div class="user-details">
                                        <span class="user-display-name">${sessionScope.userName}</span>
                                        <span class="user-email">${sessionScope.userEmail}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="dropdown-menu">
                                <a href="customer/dashboard" class="dropdown-item">
                                    <i class="fas fa-tachometer-alt"></i>
                                    <span>Dashboard</span>
                                </a>
                                <a href="customer/orders" class="dropdown-item">
                                    <i class="fas fa-shopping-bag"></i>
                                    <span>My Orders</span>
                                </a>
                                <a href="customer/profile" class="dropdown-item">
                                    <i class="fas fa-user-edit"></i>
                                    <span>Profile Settings</span>
                                </a>
                                <a href="customer/wishlist" class="dropdown-item">
                                    <i class="fas fa-heart"></i>
                                    <span>Wishlist</span>
                                </a>
                                
                                <div class="dropdown-divider"></div>
                                
                                <a href="javascript:void(0)" onclick="handleLogout()" class="dropdown-item logout">
                                    <i class="fas fa-sign-out-alt"></i>
                                    <span>Logout</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cart Icon -->
                    <button class="cart-icon" onclick="toggleCart()" title="Shopping Cart">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count" id="headerCartBadge">0</span>
                    </button>
                </c:when>
                
                <c:otherwise>
                    <!-- Guest User Actions -->
                    <a href="login-signup.jsp" class="login-btn">
                        <i class="fas fa-sign-in-alt"></i>
                        Login
                    </a>
                    <a href="login-signup.jsp" class="cta-btn">
                        <i class="fas fa-user-plus"></i>
                        Sign Up
                    </a>
                </c:otherwise>
            </c:choose>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" id="mobileMenuToggle" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </nav>

    <!-- Mobile Navigation Menu -->
    <div class="mobile-nav" id="mobileNav">
        <div class="mobile-nav-content">
            <!-- Mobile User Info -->
            <c:if test="${sessionScope.isLoggedIn}">
                <div class="mobile-user-info">
                    <div class="mobile-user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="mobile-user-details">
                        <span class="mobile-user-name">${sessionScope.userName}</span>
                        <span class="mobile-user-email">${sessionScope.userEmail}</span>
                    </div>
                </div>
            </c:if>
            
            <!-- Mobile Menu Items -->
            <ul class="mobile-menu-items">
                <li><a href="index.jsp#home" onclick="closeMobileMenu()">Home</a></li>
                <li><a href="index.jsp#products" onclick="closeMobileMenu()">Books</a></li>
                <li><a href="index.jsp#categories" onclick="closeMobileMenu()">Categories</a></li>
                <li><a href="about.jsp" onclick="closeMobileMenu()">About</a></li>
                <li><a href="contact.jsp" onclick="closeMobileMenu()">Contact</a></li>
                
                <c:if test="${sessionScope.isLoggedIn}">
                    <li class="menu-divider"></li>
                    <li><a href="customer/dashboard" onclick="closeMobileMenu()">Dashboard</a></li>
                    <li><a href="customer/orders" onclick="closeMobileMenu()">My Orders</a></li>
                    <li><a href="customer/profile" onclick="closeMobileMenu()">Profile Settings</a></li>
                    <li><a href="customer/wishlist" onclick="closeMobileMenu()">Wishlist</a></li>
                </c:if>
            </ul>
            
            <!-- Mobile Action Buttons -->
            <div class="mobile-actions">
                <c:choose>
                    <c:when test="${sessionScope.isLoggedIn}">
                        <button class="mobile-cart-btn" onclick="toggleCart(); closeMobileMenu();">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Cart (<span id="mobileCartBadge">0</span>)</span>
                        </button>
                        <button class="mobile-logout-btn" onclick="handleLogout()">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </c:when>
                    <c:otherwise>
                        <a href="login-signup.jsp" class="mobile-login-btn" onclick="closeMobileMenu()">
                            <i class="fas fa-sign-in-alt"></i>
                            Login
                        </a>
                        <a href="login-signup.jsp" class="mobile-signup-btn" onclick="closeMobileMenu()">
                            <i class="fas fa-user-plus"></i>
                            Sign Up
                        </a>
                    </c:otherwise>
                </c:choose>
            </div>
        </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-nav-overlay" id="mobileNavOverlay" onclick="closeMobileMenu()"></div>
</header>

<!-- Navbar Styles -->
<style>
/* User Menu Styles */
.user-menu {
    position: relative;
}

.user-menu-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: transparent;
    border: 2px solid transparent;
    border-radius: var(--border-radius-small);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
}

.user-menu-toggle:hover {
    background: var(--light-blue);
    border-color: var(--secondary-color);
}

.user-menu-toggle.active {
    background: var(--primary-color);
    color: var(--white);
}

.user-name {
    font-size: 16px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 280px;
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-medium);
    border: 2px solid var(--secondary-color);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.user-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-header {
    padding: 20px;
    background: var(--background-color);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 48px;
    height: 48px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-size: 20px;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.user-display-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 16px;
}

.user-email {
    color: var(--text-secondary);
    font-size: 14px;
}

.dropdown-menu {
    padding: 8px 0;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 15px;
}

.dropdown-item:hover {
    background: var(--light-blue);
    color: var(--primary-color);
}

.dropdown-item.logout:hover {
    background: rgba(208, 0, 0, 0.1);
    color: var(--alert-color);
}

.dropdown-item i {
    width: 18px;
    text-align: center;
}

.dropdown-divider {
    height: 1px;
    background: var(--background-color);
    margin: 8px 0;
}

/* Cart Icon */
.cart-icon {
    position: relative;
    background: transparent;
    border: 2px solid var(--background-color);
    border-radius: var(--border-radius-small);
    padding: 12px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 18px;
}

.cart-icon:hover {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
    transform: translateY(-2px);
}

.cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--alert-color);
    color: var(--white);
    border-radius: 50%;
    width: 22px;
    height: 22px;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0);
    transition: transform 0.3s ease;
}

.cart-count.show {
    transform: scale(1);
}

/* Mobile Navigation */
.mobile-nav {
    position: fixed;
    top: 80px;
    left: -100%;
    width: 300px;
    height: calc(100vh - 80px);
    background: var(--white);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
    z-index: 999;
    transition: left 0.3s ease;
    overflow-y: auto;
}

.mobile-nav.open {
    left: 0;
}

.mobile-nav-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.mobile-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: var(--background-color);
    border-radius: var(--border-radius);
    margin-bottom: 20px;
}

.mobile-user-avatar {
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-size: 20px;
}

.mobile-user-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mobile-user-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 16px;
}

.mobile-user-email {
    color: var(--text-secondary);
    font-size: 14px;
}

.mobile-menu-items {
    list-style: none;
    margin-bottom: auto;
}

.mobile-menu-items li {
    margin-bottom: 4px;
}

.mobile-menu-items a {
    display: block;
    padding: 14px 16px;
    color: var(--text-primary);
    text-decoration: none;
    border-radius: var(--border-radius-small);
    transition: all 0.3s ease;
    font-weight: 500;
}

.mobile-menu-items a:hover {
    background: var(--light-blue);
    color: var(--primary-color);
}

.menu-divider {
    height: 1px;
    background: var(--background-color);
    margin: 16px 0;
}

.mobile-actions {
    padding-top: 20px;
    border-top: 2px solid var(--background-color);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mobile-cart-btn,
.mobile-logout-btn,
.mobile-login-btn,
.mobile-signup-btn {
    padding: 14px 20px;
    border-radius: var(--border-radius-small);
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
}

.mobile-cart-btn {
    background: var(--primary-color);
    color: var(--white);
}

.mobile-cart-btn:hover {
    background: var(--accent-color);
}

.mobile-logout-btn {
    background: transparent;
    color: var(--alert-color);
    border: 2px solid var(--alert-color);
}

.mobile-logout-btn:hover {
    background: var(--alert-color);
    color: var(--white);
}

.mobile-login-btn {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
}

.mobile-login-btn:hover {
    background: var(--primary-color);
    color: var(--white);
}

.mobile-signup-btn {
    background: var(--primary-color);
    color: var(--white);
}

.mobile-signup-btn:hover {
    background: var(--accent-color);
}

.mobile-nav-overlay {
    position: fixed;
    top: 80px;
    left: 0;
    width: 100%;
    height: calc(100vh - 80px);
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.mobile-nav-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav-menu,
    .nav-actions {
        display: none;
    }

    .mobile-menu-toggle {
        display: flex;
    }
}

@media (min-width: 769px) {
    .mobile-menu-toggle,
    .mobile-nav {
        display: none;
    }
}

/* Mobile Menu Toggle Animation */
.mobile-menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle.active span:nth-child(2) {
    opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
}
</style>

<!-- Navbar JavaScript -->
<script>
// Global navbar functionality
let userMenuOpen = false;
let mobileMenuOpen = false;

// Toggle user dropdown menu
function toggleUserMenu() {
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuToggle && userDropdown) {
        userMenuOpen = !userMenuOpen;
        
        if (userMenuOpen) {
            userMenuToggle.classList.add('active');
            userDropdown.classList.add('show');
        } else {
            userMenuToggle.classList.remove('active');
            userDropdown.classList.remove('show');
        }
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    mobileMenuOpen = !mobileMenuOpen;
    
    if (mobileMenuOpen) {
        mobileNav.classList.add('open');
        mobileNavOverlay.classList.add('active');
        mobileMenuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        mobileNav.classList.remove('open');
        mobileNavOverlay.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close mobile menu
function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    mobileMenuOpen = false;
    
    if (mobileNav) mobileNav.classList.remove('open');
    if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
    if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            
            if (response.ok) {
                // Clear any local storage
                localStorage.clear();
                sessionStorage.clear();
                
                // Redirect to login page
                window.location.href = 'login-signup.jsp';
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    }
}

// Update cart badges
function updateNavbarCartBadges(count) {
    const headerCartBadge = document.getElementById('headerCartBadge');
    const mobileCartBadge = document.getElementById('mobileCartBadge');
    
    if (headerCartBadge) {
        headerCartBadge.textContent = count;
        if (count > 0) {
            headerCartBadge.classList.add('show');
        } else {
            headerCartBadge.classList.remove('show');
        }
    }
    
    if (mobileCartBadge) {
        mobileCartBadge.textContent = count;
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    // Close user menu
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(e.target) && userMenuOpen) {
        toggleUserMenu();
    }
});

// Close mobile menu on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && mobileMenuOpen) {
        closeMobileMenu();
    }
});

// Initialize navbar cart badge on page load
document.addEventListener('DOMContentLoaded', function() {
    // This will be called from the main dashboard script
    if (typeof loadCart === 'function') {
        loadCart().then(() => {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            updateNavbarCartBadges(totalItems);
        });
    }
});
</script>
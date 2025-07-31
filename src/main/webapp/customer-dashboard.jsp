<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop Books - Pahana Edu</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
      <link href="assets/css/index.css" rel="stylesheet">
    <link href="assets/css/customer-dashboard.css" rel="stylesheet">
</head>
<body>
    <!-- Include Navigation Bar -->
    <jsp:include page="includes/customer-navbar.jsp" />

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="hero-container">
            <div class="hero-content fade-in">
                <div class="hero-badge">
                    <i class="fas fa-star"></i>
                    Sri Lanka's Premier Educational Bookshop
                </div>
                
                <h1 class="hero-title">
                    Discover Amazing Books<br>
                    for <span class="highlight">Every Reader</span>
                </h1>

                <p class="hero-subtitle">
                    Explore our extensive collection of educational books, novels, and academic resources. 
                    Find the perfect books to fuel your learning journey.
                </p>

                <div class="hero-actions">
                    <a href="#products" class="btn-primary">
                        <i class="fas fa-search"></i>
                        Browse Books
                    </a>
                    <c:if test="${not sessionScope.isLoggedIn}">
                        <a href="login-signup.jsp" class="btn-secondary">
                            <i class="fas fa-user"></i>
                            Join Now
                        </a>
                    </c:if>
                </div>

                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-number" id="totalBooks">1000+</span>
                        <span class="stat-label">Books Available</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number" id="totalCategories">25+</span>
                        <span class="stat-label">Categories</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">500+</span>
                        <span class="stat-label">Happy Customers</span>
                    </div>
                </div>
            </div>

            <div class="hero-image fade-in">
                <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Educational Books Collection">
                
                <div class="floating-card card-1">
                    <h4 style="color: var(--text-primary); margin-bottom: 8px; font-size: 16px;">Latest Arrivals</h4>
                    <p style="color: var(--primary-color); font-size: 24px; font-weight: 700;">50+ New Books</p>
                    <span class="hint-text status-online">
                        <i class="fas fa-arrow-up"></i> Updated daily
                    </span>
                </div>

                <div class="floating-card card-2">
                    <h4 style="color: var(--text-primary); margin-bottom: 8px; font-size: 16px;">Special Offers</h4>
                    <p style="color: var(--success-color); font-size: 24px; font-weight: 700;">Up to 30% OFF</p>
                    <span class="hint-text">
                        <i class="fas fa-tag status-online"></i> Limited time offers
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- Products Section -->
    <section class="products" id="products">
        <div class="products-container">
            <div class="section-header fade-in">
                <div class="section-badge">Our Collection</div>
                <h2 class="section-title">Explore Our Book Collection</h2>
                <p class="section-description">
                    Browse through our carefully curated selection of books across various categories.
                    From academic textbooks to inspiring novels - find your next great read.
                </p>
            </div>

            <!-- Filters -->
            <div class="filters-section fade-in">
                <div class="filters-container">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchInput" placeholder="Search books by title or author...">
                    </div>
                    
                    <div class="filter-group">
                        <select id="categoryFilter" class="filter-select">
                            <option value="">All Categories</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <select id="sortFilter" class="filter-select">
                            <option value="">Sort By</option>
                            <option value="name_asc">Name A-Z</option>
                            <option value="name_desc">Name Z-A</option>
                            <option value="price_asc">Price Low to High</option>
                            <option value="price_desc">Price High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>
                    
                    <div class="price-range">
                        <input type="number" id="minPrice" placeholder="Min Price" min="0" step="0.01">
                        <span>-</span>
                        <input type="number" id="maxPrice" placeholder="Max Price" min="0" step="0.01">
                    </div>
                    
                    <button class="btn-filter" onclick="applyFilters()">
                        <i class="fas fa-filter"></i>
                        Filter
                    </button>
                    
                    <button class="btn-clear-filters" onclick="clearFilters()">
                        <i class="fas fa-times"></i>
                        Clear
                    </button>
                </div>
            </div>

            <!-- Products Grid -->
            <div class="products-grid-section fade-in">
                <div class="products-header">
                    <div class="products-count" id="productsCount">Loading books...</div>
                    <div class="view-options">
                        <button class="view-btn active" data-view="grid">
                            <i class="fas fa-th"></i>
                        </button>
                        <button class="view-btn" data-view="list">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>
                
                <div class="products-grid" id="productsGrid">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading amazing books...</p>
                    </div>
                </div>
                
                <!-- Load More Button -->
                <div class="load-more-section" id="loadMoreSection" style="display: none;">
                    <button class="btn-load-more" onclick="loadMoreProducts()">
                        <i class="fas fa-plus"></i>
                        Load More Books
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-showcase" >
        <div class="categories-container" id="categories">
            <div class="section-header fade-in" >
                <div class="section-badge">Browse by Category</div>
                <h2 class="section-title">Find Books by Subject</h2>
            </div>
            
            <div class="categories-grid" id="categoriesGrid">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading categories...</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Books Section -->
    <section class="featured-books">
        <div class="featured-container">
            <div class="section-header fade-in">
                <div class="section-badge">Special Offers</div>
                <h2 class="section-title">Featured Books & Deals</h2>
                <p class="section-description">
                    Don't miss out on these amazing deals and featured books from our collection.
                </p>
            </div>
            
            <div class="featured-grid" id="featuredGrid">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading featured books...</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Shopping Cart Sidebar -->
    <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
            <h3><i class="fas fa-shopping-cart"></i> Shopping Cart</h3>
            <button class="cart-close" onclick="toggleCart()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="cart-content" id="cartContent">
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <span>Add some books to get started</span>
            </div>
        </div>
        
        <div class="cart-footer" id="cartFooter" style="display: none;">
            <div class="cart-total">
                <span>Total: Rs. <span id="cartTotal">0.00</span></span>
            </div>
            <div class="cart-actions">
                <a href="customer/cart" class="btn-view-cart">View Cart</a>
                <a href="customer/checkout" class="btn-checkout">Checkout</a>
            </div>
        </div>
    </div>

    <!-- Cart Overlay -->
    <div class="cart-overlay" id="cartOverlay" onclick="toggleCart()"></div>

    <!-- Floating Cart Button -->
    <button class="floating-cart" onclick="toggleCart()">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-badge" id="cartBadge">0</span>
    </button>

    <!-- Include Footer -->
    <jsp:include page="includes/footer.jsp" />

    <!-- Custom JavaScript -->
    <script src="assets/js/customer-dashboard.js"></script>
</body>
</html>
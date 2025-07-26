<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
// Check if user is logged in and has customer role
if (session.getAttribute("user") == null ||
    !"CUSTOMER".equals(session.getAttribute("userRole"))) {
    response.sendRedirect("login-signup.jsp");
    return;
}
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pahana Edu - Online Bookstore</title>
    <link rel="stylesheet" href="assets/css/customer-style.css">
        <link rel="stylesheet" href="assets/css/products-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <h2>📚 Pahana Edu</h2>
            </div>
            
            <div class="nav-menu">
                <a href="#home" class="nav-link active" data-scroll="home">Home</a>
                <a href="products.jsp" class="nav-link">Products</a>
                <a href="#about" class="nav-link" data-scroll="about">About</a>
                <a href="#contact" class="nav-link" data-scroll="contact">Contact</a>
            </div>
            
            <div class="nav-actions">
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="Search books...">
                    <button id="searchBtn"><i class="fas fa-search"></i></button>
                </div>
                
                <div class="cart-icon" onclick="openCart()">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">0</span>
                </div>
                
                <div class="user-menu">
                    <span class="user-name">Hello, ${sessionScope.userName}</span>
                    <div class="dropdown">
                        <button class="dropdown-btn"><i class="fas fa-user"></i></button>
                        <div class="dropdown-content">
                            <a href="profile.jsp">Profile</a>
                            <a href="orders.jsp">My Orders</a>
                            <a href="logout">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero-section">
        <div class="hero-bg">
            <div class="hero-pattern"></div>
            <div class="hero-gradient"></div>
        </div>
        
        <div class="hero-container">
            <div class="hero-content">
                <div class="hero-badge">
                    <span class="badge-text">🎓 Education Hub</span>
                    <span class="badge-highlight">Since 2020</span>
                </div>
                
                <h1 class="hero-title">
                    Your Gateway to 
                    <span class="title-highlight">Knowledge</span>
                    <br>and Adventure
                </h1>
                
                <p class="hero-subtitle">
                    Discover thousands of carefully selected books that inspire, educate, and entertain. 
                    From academic excellence to literary adventures - your perfect read awaits.
                </p>
                
                <div class="hero-actions">
                    <a href="products.jsp" class="cta-primary">
                        <span>Explore Collection</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <a href="#categories" class="cta-secondary">
                        <i class="fas fa-play"></i>
                        <span>Browse Categories</span>
                    </a>
                </div>
                
                <div class="hero-stats">
                    <div class="stat">
                        <div class="stat-number">10,000+</div>
                        <div class="stat-label">Books Available</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">5,000+</div>
                        <div class="stat-label">Happy Readers</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">50+</div>
                        <div class="stat-label">Categories</div>
                    </div>
                </div>
            </div>
            
            <div class="hero-visual">
                <div class="book-stack">
                    <div class="book book-1">
                        <div class="book-cover">
                            <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Book 1">
                        </div>
                    </div>
                    <div class="book book-2">
                        <div class="book-cover">
                            <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Book 2">
                        </div>
                    </div>
                    <div class="book book-3">
                        <div class="book-cover">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Book 3">
                        </div>
                    </div>
                </div>
                
                <div class="floating-elements">
                    <div class="float-item float-1">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="float-item float-2">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="float-item float-3">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="float-item float-4">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories Section -->
    <section id="categories" class="categories-section">
        <div class="container">
            <div class="section-header">
                <div class="section-tag">Categories</div>
                <h2 class="section-title">Explore Our Collection</h2>
                <p class="section-desc">Find books that match your interests and learning goals</p>
            </div>
            
            <div class="categories-grid">
                <div class="category-card card-large">
                    <div class="category-bg">
                        <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Education">
                    </div>
                    <div class="category-overlay"></div>
                    <div class="category-content">
                        <div class="category-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h3>Educational Books</h3>
                        <p>Academic textbooks and learning resources</p>
                        <div class="category-stats">
                            <span>2,500+ Books</span>
                            <span>All Subjects</span>
                        </div>
                        <a href="products.jsp?category=education" class="category-btn">
                            <span>Explore</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div class="category-card">
                    <div class="category-bg">
                        <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Fiction">
                    </div>
                    <div class="category-overlay"></div>
                    <div class="category-content">
                        <div class="category-icon">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <h3>Fiction</h3>
                        <p>Novels and stories</p>
                        <div class="category-stats">
                            <span>1,800+ Books</span>
                        </div>
                        <a href="products.jsp?category=fiction" class="category-btn">
                            <span>Browse</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div class="category-card">
                    <div class="category-bg">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Children">
                    </div>
                    <div class="category-overlay"></div>
                    <div class="category-content">
                        <div class="category-icon">
                            <i class="fas fa-child"></i>
                        </div>
                        <h3>Children's Books</h3>
                        <p>Fun learning for kids</p>
                        <div class="category-stats">
                            <span>500+ Books</span>
                        </div>
                        <a href="products.jsp?category=children" class="category-btn">
                            <span>Discover</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div class="category-card">
                    <div class="category-bg">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Biography">
                    </div>
                    <div class="category-overlay"></div>
                    <div class="category-content">
                        <div class="category-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <h3>Biography</h3>
                        <p>Life stories & memoirs</p>
                        <div class="category-stats">
                            <span>300+ Books</span>
                        </div>
                        <a href="products.jsp?category=biography" class="category-btn">
                            <span>Read</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Books Section -->
    <section class="featured-section">
        <div class="container">
            <div class="section-header">
                <div class="section-tag featured">Featured</div>
                <h2 class="section-title">Trending This Week</h2>
                <p class="section-desc">Popular books chosen by our community</p>
            </div>
            
            <div class="featured-grid" id="featuredProductsGrid">
                <!-- Featured products will be loaded here by JavaScript -->
            </div>
            
            <div class="section-action">
                <a href="products.jsp" class="view-all-btn">
                    <span>View All Books</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- Recent Arrivals Section -->
    <section class="recent-section" id="recent-products">
        <div class="container">
            <div class="section-header">
                <div class="section-tag new">New Arrivals</div>
                <h2 class="section-title">Latest Additions</h2>
                <p class="section-desc">Fresh books just added to our collection</p>
            </div>
            
            <div class="recent-grid" id="recentProductsGrid">
                <!-- Recent products will be loaded here by JavaScript -->
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
        <div class="container">
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon delivery">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <div class="feature-content">
                        <h3>Fast Delivery</h3>
                        <p>Island-wide delivery within 2-3 days</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon quality">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="feature-content">
                        <h3>Quality Guaranteed</h3>
                        <p>Authentic books from trusted publishers</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon support">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div class="feature-content">
                        <h3>24/7 Support</h3>
                        <p>Always here to help with your queries</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon returns">
                        <i class="fas fa-undo-alt"></i>
                    </div>
                    <div class="feature-content">
                        <h3>Easy Returns</h3>
                        <p>Hassle-free return policy within 7 days</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section">
        <div class="about-hero">
            <div class="container">
                <h1>About Pahana Edu</h1>
                <p>Your trusted partner in educational excellence and literary exploration</p>
            </div>
        </div>

        <div class="about-content">
            <div class="container">
                <div class="about-story">
                    <div class="about-text">
                        <h2>Our Story</h2>
                        <p>Founded with a passion for education and literature, Pahana Edu has been serving book lovers and students across Sri Lanka for years. We believe that books have the power to transform lives, inspire creativity, and open doors to endless possibilities.</p>
                        <p>From academic textbooks to captivating novels, we carefully curate our collection to meet the diverse needs of our customers. Our mission is to make quality books accessible to everyone, fostering a love for reading and learning in our community.</p>
                    </div>
                    <div class="about-image">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Reading">
                    </div>
                </div>

                <div class="features-showcase">
                    <h2>Why Choose Pahana Edu?</h2>
                    <div class="features-grid-large">
                        <div class="feature-card-large">
                            <div class="feature-icon-large">
                                <i class="fas fa-shipping-fast"></i>
                            </div>
                            <h3>Fast Delivery</h3>
                            <p>Quick and reliable delivery across Sri Lanka. Get your books when you need them.</p>
                        </div>
                        <div class="feature-card-large">
                            <div class="feature-icon-large">
                                <i class="fas fa-book-open"></i>
                            </div>
                            <h3>Vast Collection</h3>
                            <p>Thousands of books across all genres and academic subjects to choose from.</p>
                        </div>
                        <div class="feature-card-large">
                            <div class="feature-icon-large">
                                <i class="fas fa-tags"></i>
                            </div>
                            <h3>Best Prices</h3>
                            <p>Competitive pricing with regular discounts and special offers for students.</p>
                        </div>
                        <div class="feature-card-large">
                            <div class="feature-icon-large">
                                <i class="fas fa-headset"></i>
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Our customer service team is always ready to help you with any queries.</p>
                        </div>
                    </div>
                </div>

                <div class="team-section">
                    <h2>Our Team</h2>
                    <div class="team-grid">
                        <div class="team-member">
                            <div class="member-image">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Team Member">
                            </div>
                            <h3>Kasun Perera</h3>
                            <p>Founder & CEO</p>
                            <div class="member-social">
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                            </div>
                        </div>
                        <div class="team-member">
                            <div class="member-image">
                                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Team Member">
                            </div>
                            <h3>Sanduni Silva</h3>
                            <p>Head of Operations</p>
                            <div class="member-social">
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                            </div>
                        </div>
                        <div class="team-member">
                            <div class="member-image">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Team Member">
                            </div>
                            <h3>Nimesh Fernando</h3>
                            <p>Customer Relations Manager</p>
                            <div class="member-social">
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section">
        <div class="contact-hero">
            <div class="container">
                <h1>Get in Touch</h1>
                <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>
        </div>

        <div class="contact-content">
            <div class="container">
                <div class="contact-layout">
                    <div class="contact-form-section">
                        <div class="contact-form-container">
                            <h2>Send us a Message</h2>
                            <form class="contact-form" id="contactForm">
                                <div class="form-group">
                                    <label for="name">Full Name</label>
                                    <input type="text" id="name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email Address</label>
                                    <input type="email" id="email" name="email" required>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Phone Number</label>
                                    <input type="tel" id="phone" name="phone">
                                </div>
                                <div class="form-group">
                                    <label for="subject">Subject</label>
                                    <select id="subject" name="subject" required>
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Related</option>
                                        <option value="support">Technical Support</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="message">Message</label>
                                    <textarea id="message" name="message" rows="5" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Send Message</button>
                            </form>
                        </div>
                    </div>

                    <div class="contact-info-section">
                        <div class="contact-info">
                            <h2>Contact Information</h2>
                            <div class="contact-details">
                                <div class="contact-item">
                                    <div class="contact-icon">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div class="contact-text">
                                        <h3>Address</h3>
                                        <p>123 Education Street<br>Colombo 07, Sri Lanka</p>
                                    </div>
                                </div>
                                <div class="contact-item">
                                    <div class="contact-icon">
                                        <i class="fas fa-phone"></i>
                                    </div>
                                    <div class="contact-text">
                                        <h3>Phone</h3>
                                        <p>+94 11 234 5678<br>+94 77 123 4567</p>
                                    </div>
                                </div>
                                <div class="contact-item">
                                    <div class="contact-icon">
                                        <i class="fas fa-envelope"></i>
                                    </div>
                                    <div class="contact-text">
                                        <h3>Email</h3>
                                        <p>info@pahanaedu.lk<br>support@pahanaedu.lk</p>
                                    </div>
                                </div>
                                <div class="contact-item">
                                    <div class="contact-icon">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                    <div class="contact-text">
                                        <h3>Business Hours</h3>
                                        <p>Mon - Fri: 9:00 AM - 6:00 PM<br>Sat: 9:00 AM - 2:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="contact-map">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798467128214!2d79.85627431477238!3d6.9270786951447055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25963120b1509%3A0x2db2c18a68712863!2sColombo%2007%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1699000000000!5m2!1sen!2sus" 
                                width="100%" 
                                height="300" 
                                style="border:0; border-radius: 12px;" 
                                allowfullscreen="" 
                                loading="lazy" 
                                referrerpolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Cart Sidebar -->
    <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
            <h3>Shopping Cart</h3>
            <button class="close-cart" onclick="closeCart()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="cart-items" id="cartItems">
            <!-- Cart items will be loaded here -->
        </div>
        
        <div class="cart-footer">
            <div class="cart-total">
                <strong>Total: Rs. <span id="cartTotal">0.00</span></strong>
            </div>
            <button class="btn btn-primary cart-checkout" onclick="goToCheckout()">
                Proceed to Checkout
            </button>
        </div>
    </div>

    <!-- Cart Overlay -->
    <div class="cart-overlay" id="cartOverlay" onclick="closeCart()"></div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>📚 Pahana Edu</h3>
                    <p>Your trusted online bookstore for all educational and recreational reading needs.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#home" data-scroll="home">Home</a></li>
                        <li><a href="products.jsp">Products</a></li>
                        <li><a href="#about" data-scroll="about">About Us</a></li>
                        <li><a href="#contact" data-scroll="contact">Contact</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Customer Service</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Shipping Info</a></li>
                        <li><a href="#">Returns</a></li>
                        <li><a href="#">Track Order</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Contact Info</h4>
                    <ul>
                        <li><i class="fas fa-phone"></i> +94 11 234 5678</li>
                        <li><i class="fas fa-envelope"></i> info@pahanaedu.lk</li>
                        <li><i class="fas fa-map-marker-alt"></i> Colombo, Sri Lanka</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 Pahana Edu. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Loading Spinner -->
    <div class="loading-spinner" id="loadingSpinner">
        <div class="spinner"></div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <div class="toast-content">
            <span id="toastMessage"></span>
            <button class="toast-close" onclick="hideToast()">×</button>
        </div>
    </div>

    <script src="assets/js/customer-dashboard.js"></script>
</body>
</html>
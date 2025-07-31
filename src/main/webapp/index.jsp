<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PahanaColombo</title>
    <!-- External CSS Links -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="assets/css/index.css" rel="stylesheet">
</head>
<body>
    <!-- Include Navigation Bar -->
     <jsp:include page="includes/customer-navbar.jsp" />

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="hero-container">
            <div class="hero-content fade-in">
                <div class="hero-badge">
                    <i class="fas fa-award"></i>
                    Trusted by 500+ Customers
                </div>
                
                <h1 class="hero-title">
                    Smart Billing System<br>
                    for <span class="highlight">Modern Bookshops</span>
                </h1>

                <p class="hero-subtitle">
                    Transform your bookshop operations with our professional billing and customer management system. 
                    Designed for reliability, efficiency, and ease of use.
                </p>

                <div class="hero-actions">
                    <a href="login-signup.jsp" class="btn-primary">
                        <i class="fas fa-rocket"></i>
                        Start Free Trial
                    </a>
                    <a href="login-signup.jsp" class="btn-secondary">
                        <i class="fas fa-play"></i>
                        Watch Demo
                    </a>
                </div>

                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-number">500+</span>
                        <span class="stat-label">Active Customers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">50k+</span>
                        <span class="stat-label">Books Sold</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">99.9%</span>
                        <span class="stat-label">System Uptime</span>
                    </div>
                </div>
            </div>

            <div class="hero-image fade-in">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Modern Bookshop Dashboard">
                
                <div class="floating-card card-1">
                    <h4 style="color: var(--text-primary); margin-bottom: 8px; font-size: 16px;">Daily Sales</h4>
                    <p style="color: var(--primary-color); font-size: 24px; font-weight: 700;">₨ 45,230</p>
                    <span class="hint-text status-online">
                        <i class="fas fa-arrow-up"></i> +12% from yesterday
                    </span>
                </div>

                <div class="floating-card card-2">
                    <h4 style="color: var(--text-primary); margin-bottom: 8px; font-size: 16px;">Stock Status</h4>
                    <p style="color: var(--success-color); font-size: 24px; font-weight: 700;">12,847</p>
                    <span class="hint-text">
                        <i class="fas fa-check-circle status-online"></i> All systems operational
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories Section -->
    <section class="categories" id="categories">
        <div class="categories-container">
            <div class="section-header fade-in">
                <div class="section-badge">Book Categories</div>
                <h2 class="section-title">Explore Our Book Categories</h2>
                <p class="section-description">
                    Discover books across various subjects and genres to enhance your knowledge and skills.
                </p>
            </div>

            <div class="categories-grid">
                <div class="category-card fade-in" onclick="goToLogin()">
                    <div class="category-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h3 class="category-title">Educational</h3>
                    <p class="category-description">
                        Textbooks, reference materials, and academic resources for students and educators.
                    </p>
                    <span class="category-count">250+ Books</span>
                </div>

                <div class="category-card fade-in" onclick="goToLogin()">
                    <div class="category-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <h3 class="category-title">Technology</h3>
                    <p class="category-description">
                        Programming, software development, and IT-related books for tech professionals.
                    </p>
                    <span class="category-count">180+ Books</span>
                </div>

                <div class="category-card fade-in" onclick="goToLogin()">
                    <div class="category-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <h3 class="category-title">Business</h3>
                    <p class="category-description">
                        Management, entrepreneurship, and business strategy books for professionals.
                    </p>
                    <span class="category-count">150+ Books</span>
                </div>

                <div class="category-card fade-in" onclick="goToLogin()">
                    <div class="category-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3 class="category-title">Literature</h3>
                    <p class="category-description">
                        Classic and contemporary literature, novels, and poetry collections.
                    </p>
                    <span class="category-count">300+ Books</span>
                </div>

                <div class="category-card fade-in" onclick="goToLogin()">
                    <div class="category-icon">
                        <i class="fas fa-flask"></i>
                    </div>
                    <h3 class="category-title">Science</h3>
                    <p class="category-description">
                        Scientific research, discoveries, and educational science materials.
                    </p>
                    <span class="category-count">200+ Books</span>
                </div>

                <div class="category-card fade-in" onclick="goToLogin()">
                    <div class="category-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h3 class="category-title">Health & Wellness</h3>
                    <p class="category-description">
                        Health guides, fitness books, and wellness resources for better living.
                    </p>
                    <span class="category-count">120+ Books</span>
                </div>
            </div>

            <div class="categories-cta fade-in">
                <a href="login-signup.jsp" class="btn-primary">
                    <i class="fas fa-search"></i>
                    Browse All Categories
                </a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="features-container">
            <div class="section-header fade-in">
                <div class="section-badge">Core Features</div>
                <h2 class="section-title">Professional Tools for Your Business</h2>
                <p class="section-description">
                    Everything you need to manage your bookshop efficiently and professionally, 
                    with medical-grade reliability and security.
                </p>
            </div>

            <div class="features-grid">
                <div class="feature-card fade-in" onclick="goToLogin()">
                    <div class="feature-icon">
                        <i class="fas fa-cash-register"></i>
                    </div>
                    <h3 class="feature-title">Smart Billing System</h3>
                    <p class="feature-description">
                        Process transactions with confidence using our reliable billing interface. 
                        Generate professional invoices and track all sales in real-time.
                    </p>
                    <span class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </span>
                </div>

                <div class="feature-card fade-in" onclick="goToLogin()">
                    <div class="feature-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="feature-title">Customer Management</h3>
                    <p class="feature-description">
                        Maintain comprehensive customer profiles with purchase history and preferences. 
                        Build stronger relationships with personalized service.
                    </p>
                    <span class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </span>
                </div>

                <div class="feature-card fade-in" onclick="goToLogin()">
                    <div class="feature-icon">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <h3 class="feature-title">Inventory Control</h3>
                    <p class="feature-description">
                        Monitor your book inventory with precision. Set automated alerts for low stock 
                        and manage suppliers with ease.
                    </p>
                    <span class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </span>
                </div>

                <div class="feature-card fade-in" onclick="goToLogin()">
                    <div class="feature-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3 class="feature-title">Analytics & Reports</h3>
                    <p class="feature-description">
                        Make data-driven decisions with comprehensive business analytics. 
                        Professional reports for better business insights.
                    </p>
                    <span class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </span>
                </div>

                <div class="feature-card fade-in" onclick="goToLogin()">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="feature-title">Secure & Reliable</h3>
                    <p class="feature-description">
                        Enterprise-grade security with 99.9% uptime guarantee. 
                        Your data is protected with medical-grade encryption standards.
                    </p>
                    <span class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </span>
                </div>

                <div class="feature-card fade-in" onclick="goToLogin()">
                    <div class="feature-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h3 class="feature-title">Mobile Responsive</h3>
                    <p class="feature-description">
                        Access your system anywhere, anytime. Fully responsive design 
                        optimized for desktop, tablet, and mobile devices.
                    </p>
                    <span class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="about" id="about">
        <div class="about-container">
            <div class="about-image fade-in">
                <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Pahana Edu Bookshop">
                <div class="about-badge">Established 2020</div>
            </div>

            <div class="about-content fade-in">
                <h2>Leading Bookshop in Colombo City</h2>
                <p class="about-description">
                    For over three years, Pahana Edu has been the trusted partner for students and book enthusiasts 
                    in Colombo. We combine traditional service excellence with modern technology solutions.
                </p>

                <ul class="about-features">
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Serving 500+ satisfied customers monthly
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        15,000+ books across all categories
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Academic and professional literature
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Competitive pricing with member discounts
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Expert consultation and recommendations
                    </li>
                </ul>

                <a href="#contact" class="btn-primary">
                    <i class="fas fa-phone"></i>
                    Contact Us Today
                </a>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="contact" id="contact">
        <div class="contact-container">
            <h2 class="fade-in">Get Professional Support</h2>
            <p class="contact-description fade-in">
                Ready to upgrade your bookshop operations? Our professional team is here to help you succeed.
            </p>

            <div class="contact-info">
                <div class="contact-item fade-in">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>Visit Our Location</h3>
                    <p>123 Galle Road, Colombo 03<br>Sri Lanka</p>
                </div>

                <div class="contact-item fade-in">
                    <i class="fas fa-phone"></i>
                    <h3>Call Our Support</h3>
                    <p>+94 11 234 5678<br>+94 77 123 4567</p>
                </div>

                <div class="contact-item fade-in">
                    <i class="fas fa-envelope"></i>
                    <h3>Email Support</h3>
                    <p>info@pahanaedu.lk<br>support@pahanaedu.lk</p>
                </div>

                <div class="contact-item fade-in">
                    <i class="fas fa-clock"></i>
                    <h3>Business Hours</h3>
                    <p>Mon - Sat: 9:00 AM - 8:00 PM<br>Sunday: 10:00 AM - 6:00 PM</p>
                </div>
            </div>

            <a href="login-signup.jsp" class="btn-primary">
                <i class="fas fa-calendar-check"></i>
                Schedule Consultation
            </a>
        </div>
    </section>

    <!-- Include Footer -->
    <jsp:include page="includes/footer.jsp" />

    <!-- Custom JavaScript -->
    <script src="assets/js/index.js"></script>
    
    <!-- Login Redirect Script -->
    <script>
        function goToLogin() {
            window.location.href = 'login-signup.jsp';
        }
    </script>
    
    <style>
        /* Categories Section Styles */
        .categories {
            padding: 80px 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .categories-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }

        .category-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid rgba(0, 123, 255, 0.1);
        }

        .category-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0, 123, 255, 0.2);
            border-color: var(--primary-color);
        }

        .category-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }

        .category-card:hover .category-icon {
            transform: scale(1.1);
            box-shadow: 0 10px 25px rgba(0, 123, 255, 0.3);
        }

        .category-title {
            font-size: 22px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 15px;
        }

        .category-description {
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .category-count {
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }

        .categories-cta {
            text-align: center;
            margin-top: 50px;
        }

        /* Feature Cards Click Cursor */
        .feature-card {
            cursor: pointer;
        }

        .feature-link {
            color: var(--primary-color);
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 15px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .categories-grid {
                grid-template-columns: 1fr;
                gap: 20px;
                margin: 30px 0;
            }

            .category-card {
                padding: 25px;
                text-align: center;
            }

            .category-icon {
                margin: 0 auto 20px;
            }

            .categories {
                padding: 60px 0;
            }
        }

        /* Animation for category cards */
        .category-card.fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }

        .category-card.fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</body>
</html>
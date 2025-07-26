-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 26, 2025 at 10:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pahana-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Fiction', 'Fiction books and novels', 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(2, 'Non-Fiction', 'Non-fiction books', 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(3, 'Education', 'Educational and academic books', 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(4, 'Children', 'Children books', 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(5, 'Science', 'Science and technology books', 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(6, 'History', 'History books', 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `final_amount` decimal(10,2) NOT NULL,
  `promo_code_id` int(11) DEFAULT NULL,
  `status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_number`, `total_amount`, `discount_amount`, `final_amount`, `promo_code_id`, `status`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `created_at`, `updated_at`) VALUES
(1, 2, 'ORD1001', 3500.00, 350.00, 3150.00, 1, 'confirmed', 'Jane Smith', 'jane@example.com', '0771234567', '123 Main Street, Colombo', '2025-07-26 19:03:22', '2025-07-26 20:12:23'),
(2, 3, 'ORD1002', 1800.00, 0.00, 1800.00, NULL, 'confirmed', 'Michael Brown', 'michael@example.com', '0759876543', '45 Kandy Road, Kandy', '2025-07-26 19:03:22', '2025-07-26 19:03:22');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
(1, 1, 1, 1, 1500.00, 1500.00, '2025-07-26 19:03:28'),
(2, 1, 2, 1, 2000.00, 2000.00, '2025-07-26 19:03:28'),
(3, 2, 3, 1, 1800.00, 1800.00, '2025-07-26 19:03:28');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(50) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `offer_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `image_path` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `author`, `isbn`, `category_id`, `description`, `price`, `offer_price`, `stock_quantity`, `image_path`, `status`, `created_at`, `updated_at`) VALUES
(1, 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 1, 'Classic American novel', 1500.00, 1200.00, 50, NULL, 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(2, 'To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 1, 'Pulitzer Prize winning novel', 1800.00, NULL, 30, NULL, 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(3, '1984', 'George Orwell', '978-0-452-28423-4', 1, 'Dystopian social science fiction novel', 1600.00, 1400.00, 40, NULL, 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(4, 'Mathematics Grade 10', 'Local Author', '978-955-0000-001', 3, 'Grade 10 Mathematics textbook', 800.00, NULL, 100, NULL, 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(5, 'Science Grade 8', 'Local Author', '978-955-0000-002', 3, 'Grade 8 Science textbook', 750.00, 650.00, 80, NULL, 'active', '2025-07-26 14:25:57', '2025-07-26 14:25:57'),
(8, 'dasd', 'asd', 'asd', 6, 'asd', 500.00, NULL, 10, 'uploads/products/product_5cabf1b4-0b9c-4714-bcd9-faef146eff69.webp', 'active', '2025-07-26 20:12:11', '2025-07-26 20:12:11'),
(9, 'fuck', 'mn', '6767', 4, 'ftyrty', 500.00, 480.00, 40, 'uploads/products/product_78b8559e-f096-49ca-9780-e2cd5544e12f.jpg', 'active', '2025-07-26 20:40:21', '2025-07-26 20:40:21');

-- --------------------------------------------------------

--
-- Table structure for table `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promo_codes`
--

INSERT INTO `promo_codes` (`id`, `code`, `description`, `discount_type`, `discount_value`, `used_count`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME101', 'Welcom', 'percentage', 10.00, 0, '2024-01-01', '2024-12-31', 'active', '2025-07-26 14:25:57', '2025-07-26 20:39:27'),
(2, 'SAVE50', 'Fixe', 'fixed', 50.00, 0, '2024-01-01', '2024-12-31', 'active', '2025-07-26 14:25:57', '2025-07-26 20:39:39'),
(4, 'WELR', 'adad', 'percentage', 10.00, 0, '2025-07-27', '2025-07-30', 'active', '2025-07-26 19:07:01', '2025-07-26 19:07:01');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` enum('ADMIN','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `phone`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'System', 'Administrator', 'admin@pahana.lk', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqyc3Q.7S4j0c/vqPWKKJ/O', '0771234567', 'ADMIN', 'active', '2025-07-26 10:47:48', '2025-07-26 10:47:48'),
(2, 'John', 'Doe', 'customer@pahana.lk', '$2a$12$9XklEG8L3VqCFpL/Dw.Z0OjHK2BcSF9M3YrS5KhQqCgG8Qj4wU2vC', '0771234568', 'CUSTOMER', 'active', '2025-07-26 10:47:48', '2025-07-26 10:47:48'),
(3, 'Jane', 'Smith', 'test@pahana.lk', '$2a$12$8Zv4Gl3YQHD.VQzxfzFSmuQqX4V8.3nxKjHlGzPzQA2Bl.Q8Uq7XK', '0771234569', 'CUSTOMER', 'active', '2025-07-26 10:47:48', '2025-07-26 10:47:48'),
(5, 'kasunqa', 'laka', 'kasun@gmail.com', '$2a$12$HySrL9ZTYinGy3DH.YvNiexj239QyTtAYQMSA.86wWQYVQIIp/LZ2', '0771717599', 'CUSTOMER', 'active', '2025-07-26 11:27:40', '2025-07-26 11:27:40'),
(13, 'Ravindu', 'sas', 'mahe@gmail.com', '$2a$12$8bQa0eOtnCJxJfbf/FiqDODaf5I1l1nQLD21hMlid4D3USyerYVk6', '0771717599', 'CUSTOMER', 'active', '2025-07-26 20:37:20', '2025-07-26 20:38:37'),
(14, 'asasa', 'eaeae', 'admin@pahanaedu.lk', '$2a$12$0lftDFnbrO9atyMTiKfJQ.iehk5oI9uGwH6E8j0xSPtB8ygbD8Kki', '0771717599', 'CUSTOMER', 'active', '2025-07-26 20:40:53', '2025-07-26 20:40:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `promo_code_id` (`promo_code_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_date` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_products_title` (`title`),
  ADD KEY `idx_products_author` (`author`);

--
-- Indexes for table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

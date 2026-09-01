-- =========================================================
-- AJB IMPORTS GHANA
-- XAMPP / MySQL 5.7+ / MariaDB 10.3+ Database Schema
-- =========================================================
-- Database: ajb_imports
-- Engine:   InnoDB
-- Charset:  utf8mb4 (full Unicode incl. emoji)
-- =========================================================

CREATE DATABASE IF NOT EXISTS `ajb_imports`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `ajb_imports`;


-- =========================================================
-- Admins Table
-- =========================================================
-- Stores administrator accounts for the admin dashboard.
-- Supports bcrypt password hashes and password reset tokens.

CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(64) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `passwordHash` TEXT NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `createdAt` DATETIME NOT NULL,
  `resetTokenHash` TEXT NULL,
  `resetTokenExpires` BIGINT NULL,
  `passwordChangedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- Quote Submissions Table
-- =========================================================
-- Stores customer shipment enquiries submitted through
-- the public quote form on the website.

CREATE TABLE IF NOT EXISTS `quote_submissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `createdAt` DATETIME NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NOT NULL,
  `service` VARCHAR(255) NULL,
  `origin` VARCHAR(255) NULL,
  `destination` VARCHAR(255) NULL,
  `cargoType` VARCHAR(255) NULL,
  `cargoWeight` VARCHAR(255) NULL,
  `cargoVolume` VARCHAR(255) NULL,
  `shippingDate` VARCHAR(255) NULL,
  `preferredContact` VARCHAR(255) DEFAULT 'Email / Phone',
  `message` TEXT NULL,
  `status` VARCHAR(50) DEFAULT 'New',
  `adminNotes` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quote_email` (`email`),
  KEY `idx_quote_status` (`status`),
  KEY `idx_quote_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- Blog Posts Table
-- =========================================================
-- Stores blog articles authored by administrators
-- and published on the public blog page.

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `image` TEXT NULL,
  `category` VARCHAR(100) DEFAULT 'company',
  `author` VARCHAR(255) DEFAULT 'AJB Imports',
  `featured` TINYINT(1) DEFAULT 0,
  `published` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `publishedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_blog_slug` (`slug`),
  KEY `idx_blog_published` (`published`),
  KEY `idx_blog_category` (`category`),
  KEY `idx_blog_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS meme_creator_db;

-- Use the database
USE meme_creator_db;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'meme_user'@'%' IDENTIFIED BY 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON meme_creator_db.* TO 'meme_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

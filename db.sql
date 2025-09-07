CREATE DATABASE drsleep;
USE drsleep;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password_hash VARCHAR(255),
    last_checkin DATETIME DEFAULT NOW()
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    recipient VARCHAR(100),
    title VARCHAR(100),
    content TEXT,
    hold_days INT,
    expiration_date DATE,
    status ENUM('pending','sent','expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (username, password_hash) VALUES ("testuser", "dummyhash");

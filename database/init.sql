CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    xianyu_balance INT DEFAULT 0,
    monthly_card_expires_at TIMESTAMP NULL,
    token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin User (Password: 123456)
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', '$2y$10$9ew7AOnjNlk.aB6n35eOI.VcntapoYkwnglM9RHOpVArQfGNnskye', 'admin');

CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_no VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('monthly', 'xianyu') NOT NULL,
    status ENUM('unused', 'used') NOT NULL DEFAULT 'unused',
    used_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (used_by_user_id) REFERENCES users(id)
);

-- Seed Data: Monthly Cards
INSERT IGNORE INTO cards (card_no, type) VALUES 
('M-8888-AAAA', 'monthly'),
('M-8888-BBBB', 'monthly'),
('M-8888-CCCC', 'monthly'),
('M-8888-DDDD', 'monthly'),
('M-8888-EEEE', 'monthly');

-- Seed Data: Xianyu Cards
INSERT IGNORE INTO cards (card_no, type) VALUES 
('X-6666-1111', 'xianyu'),
('X-6666-2222', 'xianyu'),
('X-6666-3333', 'xianyu'),
('X-6666-4444', 'xianyu'),
('X-6666-5555', 'xianyu');

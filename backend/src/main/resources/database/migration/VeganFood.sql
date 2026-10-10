CREATE DATABASE IF NOT EXISTS vegan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vegan;

CREATE TABLE IF NOT EXISTS `user` (
    user_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255),
    role VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at DATETIME(6),
    address VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(255),
    PRIMARY KEY (user_id),
    CONSTRAINT uk_user_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS product (
    product_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    price DOUBLE,
    stock_quantity INT,
    image_url VARCHAR(255),
    category VARCHAR(100),
    total_order INT,
    PRIMARY KEY (product_id)
);

CREATE TABLE IF NOT EXISTS discount (
    discount_id INT NOT NULL AUTO_INCREMENT,
    discount_code VARCHAR(100),
    created_at DATETIME(6),
    status VARCHAR(255),
    quantity INT,
    percentage INT,
    PRIMARY KEY (discount_id),
    CONSTRAINT uk_discount_code UNIQUE (discount_code)
);

CREATE TABLE IF NOT EXISTS `Order` (
    order_id INT NOT NULL AUTO_INCREMENT,
    user_id INT,
    status VARCHAR(255),
    payment_method VARCHAR(255),
    total_amount DECIMAL(10, 2),
    phone_number VARCHAR(20),
    address VARCHAR(100),
    discount_id INT,
    created_at DATETIME(6),
    PRIMARY KEY (order_id),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES `user` (user_id),
    CONSTRAINT fk_order_discount FOREIGN KEY (discount_id) REFERENCES discount (discount_id)
);

CREATE TABLE IF NOT EXISTS order_item (
    order_item_id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_item_id),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES `Order` (order_id),
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_order_item_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
);

CREATE TABLE IF NOT EXISTS cart (
    cart_id INT NOT NULL AUTO_INCREMENT,
    user_id INT,
    PRIMARY KEY (cart_id),
    CONSTRAINT uk_cart_user UNIQUE (user_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
);

CREATE TABLE IF NOT EXISTS cart_item (
    cart_item_id INT NOT NULL AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (cart_item_id),
    CONSTRAINT uk_cart_item_product UNIQUE (cart_id, product_id),
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES cart (cart_id),
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES product (product_id)
);

CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT NOT NULL AUTO_INCREMENT,
    comment TEXT,
    created_at DATETIME(6),
    product_id INT,
    user_id INT,
    PRIMARY KEY (feedback_id),
    CONSTRAINT fk_feedback_product FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
);

CREATE TABLE IF NOT EXISTS support_ticket (
    ticket_id INT NOT NULL AUTO_INCREMENT,
    user_id INT,
    subject VARCHAR(255),
    description TEXT,
    status VARCHAR(255),
    assigned_to INT,
    created_at DATETIME(6),
    responder_id INT,
    reply_message TEXT,
    replied_at DATETIME(6),
    PRIMARY KEY (ticket_id),
    CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES `user` (user_id),
    CONSTRAINT fk_ticket_assigned FOREIGN KEY (assigned_to) REFERENCES `user` (user_id),
    CONSTRAINT fk_ticket_responder FOREIGN KEY (responder_id) REFERENCES `user` (user_id)
);

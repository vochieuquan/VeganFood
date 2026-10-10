-- Run once against a backup of a database created from the original VeganFood.sql.
-- This migrates the existing tables and rows; it does not seed accounts or sample data.
USE vegan;

DROP PROCEDURE IF EXISTS rename_legacy_table;
DELIMITER //
CREATE PROCEDURE rename_legacy_table(IN old_name VARCHAR(64), IN new_name VARCHAR(64))
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = DATABASE() AND BINARY table_name = BINARY old_name)
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables
                       WHERE table_schema = DATABASE() AND BINARY table_name = BINARY new_name) THEN
        SET @rename_sql = CONCAT('RENAME TABLE `', old_name, '` TO `', new_name, '`');
        PREPARE rename_stmt FROM @rename_sql;
        EXECUTE rename_stmt;
        DEALLOCATE PREPARE rename_stmt;
    END IF;
END//
DELIMITER ;

CALL rename_legacy_table('User', 'user');
CALL rename_legacy_table('Product', 'product');
CALL rename_legacy_table('Discount', 'discount');
CALL rename_legacy_table('Cart', 'cart');
CALL rename_legacy_table('CartItem', 'cart_item');
CALL rename_legacy_table('OrderItem', 'order_item');
CALL rename_legacy_table('Feedback', 'feedback');
CALL rename_legacy_table('SupportTicket', 'support_ticket');
DROP PROCEDURE rename_legacy_table;

ALTER TABLE `user`
    ADD COLUMN date_of_birth DATE NULL,
    ADD COLUMN gender VARCHAR(255) NULL,
    MODIFY COLUMN name VARCHAR(100) NULL,
    MODIFY COLUMN email VARCHAR(100) NOT NULL,
    MODIFY COLUMN phone_number VARCHAR(20) NULL,
    MODIFY COLUMN address VARCHAR(100) NULL,
    MODIFY COLUMN role VARCHAR(255) NOT NULL;

ALTER TABLE product
    MODIFY COLUMN name VARCHAR(100) NULL,
    MODIFY COLUMN price DOUBLE NULL,
    MODIFY COLUMN category VARCHAR(100) NULL;

ALTER TABLE discount
    MODIFY COLUMN discount_code VARCHAR(100) NULL,
    MODIFY COLUMN status VARCHAR(255) NULL;

ALTER TABLE `Order`
    ADD COLUMN user_id INT NULL,
    MODIFY COLUMN status VARCHAR(255) NULL,
    MODIFY COLUMN payment_method VARCHAR(255) NULL,
    MODIFY COLUMN phone_number VARCHAR(20) NULL,
    MODIFY COLUMN address VARCHAR(100) NULL;

UPDATE `Order` SET user_id = customer_id WHERE user_id IS NULL;
UPDATE `Order` SET payment_method = 'CASH' WHERE payment_method = 'Cash';

ALTER TABLE `Order`
    ADD CONSTRAINT fk_order_user_current FOREIGN KEY (user_id) REFERENCES `user` (user_id);

ALTER TABLE support_ticket
    MODIFY COLUMN status VARCHAR(255) NULL,
    ADD COLUMN responder_id INT NULL,
    ADD COLUMN reply_message TEXT NULL,
    ADD COLUMN replied_at DATETIME(6) NULL;

ALTER TABLE discount ADD CONSTRAINT uk_discount_code UNIQUE (discount_code);

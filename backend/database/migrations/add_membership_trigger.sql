-- Create a trigger to automatically assign membership numbers to new users
-- This ensures that users created through any method (direct DB insert, scripts, etc.) get a membership number

DELIMITER //

CREATE TRIGGER assign_membership_number_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE new_membership_number VARCHAR(20);
    DECLARE current_year_suffix VARCHAR(2);
    DECLARE next_sequence INT;
    DECLARE last_sequence INT;
    DECLARE last_membership VARCHAR(20);

    -- Only assign if membership_number is NULL and user is not admin/superadmin
    IF NEW.membership_number IS NULL AND NEW.role NOT IN ('admin', 'superadmin') THEN
        -- Get current year suffix
        SET current_year_suffix = YEAR(NOW()) % 100;

        -- Get the highest sequence number for the current year
        SELECT membership_number INTO last_membership
        FROM users
        WHERE membership_number LIKE CONCAT('TRB-', current_year_suffix, '-%')
        ORDER BY membership_number DESC
        LIMIT 1;

        -- Calculate next sequence
        IF last_membership IS NOT NULL THEN
            SET last_sequence = SUBSTRING_INDEX(last_membership, '-', -1);
            SET next_sequence = last_sequence + 1;
        ELSE
            SET next_sequence = 1;
        END IF;

        -- Format as 6-digit zero-padded number
        SET new_membership_number = CONCAT('TRB-', current_year_suffix, '-', LPAD(next_sequence, 6, '0'));

        -- Update the user with the membership number
        UPDATE users
        SET membership_number = new_membership_number
        WHERE id = NEW.id;
    END IF;
END//

DELIMITER ;

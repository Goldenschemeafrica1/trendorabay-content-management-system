const db = require('../../src/config/database');

async function createSecurityEventsTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS security_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        user_id INT,
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        endpoint VARCHAR(255),
        method VARCHAR(10),
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        additional_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_user_id (user_id),
        INDEX idx_ip_address (ip_address),
        INDEX idx_severity (severity),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(createTableQuery);
    console.log('✅ Security events table created successfully');
  } catch (error) {
    console.error('❌ Error creating security events table:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createSecurityEventsTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createSecurityEventsTable };

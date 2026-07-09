const db = require('../src/config/database');

async function addMagazineColumns() {
  try {
    console.log('Adding columns to magazines table...');
    
    // Add missing columns
    const columns = [
      { name: 'price', type: 'DECIMAL(10, 2) DEFAULT 9.99' },
      { name: 'digital_price', type: 'DECIMAL(10, 2) DEFAULT 9.99' },
      { name: 'print_price', type: 'DECIMAL(10, 2) DEFAULT 13.99' },
      { name: 'subscription_price', type: 'DECIMAL(10, 2) DEFAULT 99.99' },
      { name: 'pages', type: 'INT DEFAULT 100' },
      { name: 'language', type: 'VARCHAR(50) DEFAULT "English"' },
      { name: 'publisher', type: 'VARCHAR(255) DEFAULT "Trendorabay"' },
      { name: 'rating', type: 'DECIMAL(3, 2) DEFAULT 4.50' },
      { name: 'review_count', type: 'INT DEFAULT 0' },
      { name: 'table_of_contents', type: 'TEXT' },
      { name: 'contributor_id', type: 'INT' },
      { name: 'preview_pages', type: 'TEXT' }
    ];

    for (const column of columns) {
      try {
        await db.query(`ALTER TABLE magazines ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✓ Added column: ${column.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`- Column ${column.name} already exists, skipping...`);
        } else {
          console.error(`✗ Error adding column ${column.name}:`, error.message);
        }
      }
    }

    // Add foreign key for contributor_id if it doesn't exist
    try {
      await db.query(`ALTER TABLE magazines ADD FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE SET NULL`);
      console.log('✓ Added foreign key for contributor_id');
    } catch (error) {
      if (error.code === 'ER_CANNOT_ADD_FOREIGN') {
        console.log('- Foreign key for contributor_id may already exist or cannot be added, skipping...');
      } else {
        console.error('✗ Error adding foreign key:', error.message);
      }
    }

    console.log('\n✓ All columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addMagazineColumns();

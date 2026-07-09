const db = require('../src/config/database');

async function updateEventsTable() {
  try {
    console.log('Updating events table structure...');
    
    // Add attendees column if it doesn't exist
    try {
      await db.query(`
        ALTER TABLE events 
        ADD COLUMN attendees INT DEFAULT 0
      `);
      console.log('✓ Added attendees column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⊘ attendees column already exists');
      } else {
        throw error;
      }
    }
    
    // Add type column if it doesn't exist
    try {
      await db.query(`
        ALTER TABLE events 
        ADD COLUMN type VARCHAR(100) DEFAULT 'Conference'
      `);
      console.log('✓ Added type column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⊘ type column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('\n✓ Events table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error updating events table:', error.message);
    process.exit(1);
  }
}

updateEventsTable();

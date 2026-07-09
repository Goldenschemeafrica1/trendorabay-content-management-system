const db = require('../src/config/database');

async function addRoleField() {
  try {
    console.log('Adding role field to authors table...');

    const query = 'ALTER TABLE authors ADD COLUMN role VARCHAR(50) DEFAULT "Author"';

    try {
      await db.query(query);
      console.log('Executed:', query);
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('Column already exists, skipping');
      } else {
        console.error('Error executing query:', error.message);
        throw error;
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addRoleField();

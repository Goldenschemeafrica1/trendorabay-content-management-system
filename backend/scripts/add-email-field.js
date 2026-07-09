const db = require('../src/config/database');

async function addEmailField() {
  try {
    console.log('Adding email field to podcast_hosts table...');
    await db.query(`ALTER TABLE podcast_hosts ADD COLUMN email VARCHAR(255) AFTER bio`);
    console.log('Email field added successfully');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Email field already exists');
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

addEmailField();

const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Adding work_type column to opportunities table...');

    await db.query(`
      ALTER TABLE opportunities
      ADD COLUMN work_type ENUM('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Volunteer', 'Remote', 'Hybrid')
      DEFAULT NULL
      AFTER category
    `);

    console.log('✅ Successfully added work_type column to opportunities table');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  work_type column already exists');
      process.exit(0);
    }
    console.error('❌ Error adding work_type column:', error.message);
    process.exit(1);
  }
}

runMigration();

const db = require('../src/config/database');

async function updateWorkTypeValues() {
  try {
    console.log('Updating work_type column with new values...');

    // First, drop the existing column
    await db.query('ALTER TABLE opportunities DROP COLUMN work_type');
    console.log('✅ Dropped existing work_type column');

    // Add it back with the correct enum values
    await db.query(`
      ALTER TABLE opportunities
      ADD COLUMN work_type ENUM('Jobs', 'Internships', 'Scholarships', 'Grants', 'Fellowships', 'Competitions', 'Events', 'Training', 'Courses', 'Volunteering')
      DEFAULT NULL
      AFTER category
    `);

    console.log('✅ Successfully updated work_type column with new values');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating work_type column:', error.message);
    process.exit(1);
  }
}

updateWorkTypeValues();

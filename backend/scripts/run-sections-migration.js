const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running migration to update story sections...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/migrations/update_story_sections.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await db.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log('Skipped (already exists):', statement.substring(0, 50) + '...');
        } else {
          throw error;
        }
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

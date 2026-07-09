const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function updateSchema() {
  try {
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and filter empty statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      try {
        await db.query(statements[i]);
        console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        // Ignore errors for existing tables (IF NOT EXISTS should handle this)
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⊘ Table already exists (statement ${i + 1}/${statements.length})`);
        } else {
          console.log(`✗ Error in statement ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log('\n✓ Schema update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Schema update failed:', error);
    process.exit(1);
  }
}

updateSchema();

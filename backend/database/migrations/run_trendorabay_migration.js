const db = require('../../src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'create_trendorabay_analytics_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('Trendorabay analytics tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

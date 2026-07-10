const mysql = require('mysql2/promise');
require('dotenv').config();

// Local XAMPP database configuration
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trendorabay',
  socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock'
};

// Production database configuration (from current env) with SSL
const prodConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
};

// Tables with data to migrate
const tablesToMigrate = [
  'categories',
  'media',
  'magazines',
  'authors',
  'stories',
  'team',
  'products',
  'events',
  'cms_users',
  'users',
  'contributors',
  'podcasts',
  'orders',
  'pitch_submissions',
  'likes',
  'author_follows',
  'comments',
  'contributor_follows',
  'homepage_config',
  'homepage_featured',
  'partnership_proposals',
  'podcast_guest_applications',
  'shares'
];

async function migrateTable(localConn, prodConn, tableName) {
  try {
    console.log(`\n📋 Migrating table: ${tableName}`);
    
    // Get data from local
    const [localData] = await localConn.execute(`SELECT * FROM ${tableName}`);
    console.log(`  Found ${localData.length} rows in local ${tableName}`);
    
    if (localData.length === 0) {
      console.log(`  ⚠️  No data to migrate for ${tableName}`);
      return { migrated: 0, skipped: 0 };
    }
    
    // Get column names
    const columns = Object.keys(localData[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const columnNames = columns.join(', ');
    
    // Check if table exists in production and get existing data for conflict avoidance
    let existingData = new Set();
    try {
      const [prodData] = await prodConn.execute(`SELECT * FROM ${tableName}`);
      // Use first column as identifier for conflict detection
      if (prodData.length > 0 && columns.length > 0) {
        const idColumn = columns[0];
        existingData = new Set(prodData.map(row => row[idColumn]));
      }
    } catch (err) {
      console.log(`  ℹ️  Table ${tableName} might not exist in production yet`);
    }
    
    let migrated = 0;
    let skipped = 0;
    
    for (const row of localData) {
      const values = columns.map(col => row[col]);
      const idValue = row[columns[0]];
      
      // Skip if already exists (based on first column)
      if (existingData.has(idValue)) {
        skipped++;
        continue;
      }
      
      try {
        await prodConn.execute(
          `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
          values
        );
        migrated++;
      } catch (err) {
        console.log(`  ⚠️  Error inserting row with ${columns[0]}=${idValue}: ${err.message}`);
      }
    }
    
    console.log(`  ✅ Migrated: ${migrated}, Skipped: ${skipped}`);
    return { migrated, skipped };
    
  } catch (error) {
    console.error(`  ❌ Error migrating ${tableName}:`, error.message);
    return { migrated: 0, skipped: 0, error: error.message };
  }
}

async function migrateAll() {
  let localConnection;
  let prodConnection;

  try {
    console.log('Connecting to local XAMPP database...');
    localConnection = await mysql.createConnection(localConfig);
    console.log('✅ Connected to local XAMPP database');

    console.log('Connecting to production database...');
    prodConnection = await mysql.createConnection(prodConfig);
    console.log('✅ Connected to production database');

    console.log('\n' + '='.repeat(60));
    console.log('STARTING DATA MIGRATION FROM XAMPP TO PRODUCTION');
    console.log('='.repeat(60));

    let totalMigrated = 0;
    let totalSkipped = 0;
    const results = {};

    for (const table of tablesToMigrate) {
      const result = await migrateTable(localConnection, prodConnection, table);
      results[table] = result;
      totalMigrated += result.migrated;
      totalSkipped += result.skipped;
    }

    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total migrated: ${totalMigrated} rows`);
    console.log(`Total skipped: ${totalSkipped} rows`);
    console.log('\nDetails:');
    for (const [table, result] of Object.entries(results)) {
      const status = result.error ? '❌' : '✅';
      console.log(`${status} ${table}: ${result.migrated} migrated, ${result.skipped} skipped${result.error ? ' (error: ' + result.error + ')' : ''}`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (localConnection) await localConnection.end();
    if (prodConnection) await prodConnection.end();
    console.log('\n✅ Connections closed');
  }
}

// Run migration
migrateAll();

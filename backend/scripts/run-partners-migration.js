const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running partners table migration...');
    
    // Fix status enum to include 'pending'
    await db.query("ALTER TABLE partners MODIFY COLUMN status ENUM('active', 'inactive', 'pending') DEFAULT 'pending'");
    console.log('✓ Updated status enum to include pending');
    
    // Check if table has data
    const [existingPartners] = await db.query('SELECT COUNT(*) as count FROM partners');
    console.log(`Existing partners count: ${existingPartners[0].count}`);
    
    // Only insert sample data if table is empty
    if (existingPartners[0].count === 0) {
      await db.query(`
        INSERT INTO partners (name, logo_url, website_url, contact_email, status) VALUES
        ('TechCorp Inc', NULL, 'https://techcorp.com', 'partnerships@techcorp.com', 'active'),
        ('MediaHub LLC', NULL, 'https://mediahub.io', 'contact@mediahub.io', 'active'),
        ('Startup Ventures', NULL, 'https://startupventures.co', 'info@startupventures.co', 'pending'),
        ('Digital Solutions', NULL, 'https://digitalsolutions.com', 'sales@digitalsolutions.com', 'inactive')
      `);
      console.log('✓ Inserted sample partners data');
    } else {
      console.log('Table already has data, skipping sample insert');
    }
    
    // Verify the changes
    const [partners] = await db.query('SELECT * FROM partners');
    console.log(`✓ Total partners in database: ${partners.length}`);
    console.log('Partners data:', partners);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

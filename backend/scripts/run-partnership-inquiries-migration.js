const db = require('../src/config/database');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('Running partnership inquiries table migration...');
    const sql = fs.readFileSync('./database/migrations/create_partnership_inquiries_table.sql', 'utf8');
    await db.query(sql);
    console.log('Partnership inquiries table created successfully!');
    
    // Move the mistaken entry from partners to partnership inquiries
    console.log('Moving mistaken partnership entry...');
    const [partners] = await db.query('SELECT * FROM partners WHERE id = 30001');
    if (partners.length > 0) {
      const partner = partners[0];
      await db.query(
        `INSERT INTO partnership_inquiries (contact_name, contact_email, company_name, website_url, message, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [partner.name, partner.contact_email, partner.name, partner.website_url, 'Partnership inquiry from trendorabay website', 'pending']
      );
      console.log('Moved mistaken entry to partnership inquiries');
      
      // Delete from partners
      await db.query('DELETE FROM partners WHERE id = 30001');
      console.log('Deleted mistaken entry from partners table');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runMigration();

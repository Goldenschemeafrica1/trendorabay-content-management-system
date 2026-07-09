const db = require('../src/config/database');

async function checkMediaData() {
  try {
    console.log('Fetching all media from database...');
    const [rows] = await db.query('SELECT * FROM media ORDER BY created_at DESC');
    
    console.log('\n=== Database Media Records ===');
    console.log(`Total records: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('\nFirst record structure:');
      console.log(JSON.stringify(rows[0], null, 2));
      
      console.log('\n=== All Records ===');
      rows.forEach((row, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  ID: ${row.id}`);
        console.log(`  Filename: ${row.filename}`);
        console.log(`  Original Name: ${row.original_name}`);
        console.log(`  File URL: ${row.file_url}`);
        console.log(`  File Type: ${row.file_type}`);
        console.log(`  File Size: ${row.file_size}`);
        console.log(`  Folder: ${row.folder}`);
        console.log(`  Uploaded By: ${row.uploaded_by}`);
        console.log(`  Created At: ${row.created_at}`);
      });
    } else {
      console.log('No media records found in database.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMediaData();

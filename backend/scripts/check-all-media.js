const db = require('../src/config/database');

async function checkAllMedia() {
  try {
    console.log('Fetching all media from database...');
    const [rows] = await db.query('SELECT * FROM media ORDER BY created_at DESC');
    
    console.log('\n=== All Media Records ===');
    console.log(`Total records: ${rows.length}`);
    
    console.log('\n=== Folder Distribution ===');
    const folderCounts = {};
    rows.forEach(row => {
      const folder = row.folder || 'No Folder';
      folderCounts[folder] = (folderCounts[folder] || 0) + 1;
    });
    
    Object.entries(folderCounts).forEach(([folder, count]) => {
      console.log(`  ${folder}: ${count} files`);
    });
    
    console.log('\n=== All Records ===');
    rows.forEach((row, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Filename: ${row.filename}`);
      console.log(`  Original Name: ${row.original_name}`);
      console.log(`  File Type: ${row.file_type}`);
      console.log(`  Folder: ${row.folder}`);
      console.log(`  Created At: ${row.created_at}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllMedia();

const db = require('../src/config/database');

async function fixDisplaySectionValues() {
  try {
    console.log('Checking and fixing display_section values...');

    // Check current values
    const [rows] = await db.query('SELECT id, display_section FROM stories WHERE display_section IS NOT NULL');
    console.log(`Found ${rows.length} stories with display_section values:`);
    rows.forEach(row => {
      console.log(`- Story ${row.id}: ${row.display_section}`);
    });

    // Update old values to 'default'
    const validSections = ['default', 'latest_stories', 'must_read', 'innovation'];

    for (const row of rows) {
      if (!validSections.includes(row.display_section)) {
        console.log(`Updating story ${row.id} from '${row.display_section}' to 'default'`);
        await db.query('UPDATE stories SET display_section = ? WHERE id = ?', ['default', row.id]);
      }
    }

    // Set NULL values to 'default'
    await db.query("UPDATE stories SET display_section = 'default' WHERE display_section IS NULL");
    console.log('Set NULL display_section values to default');

    console.log('Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

fixDisplaySectionValues();

const db = require('../src/config/database');

async function fixDisplaySectionSafe() {
  try {
    console.log('Fixing display_section values safely...');

    // Step 1: Change column to VARCHAR to allow any value
    console.log('Step 1: Changing display_section to VARCHAR...');
    try {
      await db.query("ALTER TABLE stories MODIFY COLUMN display_section VARCHAR(50) DEFAULT 'default'");
      console.log('Changed to VARCHAR successfully');
    } catch (error) {
      console.error('Error changing to VARCHAR:', error.message);
    }

    // Step 2: Update old values to new valid values
    console.log('Step 2: Updating old values...');
    const mapping = {
      'featured': 'latest_stories',
      'horizontal': 'default',
      'must_read': 'must_read',
      'text_only': 'default'
    };

    for (const [oldValue, newValue] of Object.entries(mapping)) {
      const result = await db.query('UPDATE stories SET display_section = ? WHERE display_section = ?', [newValue, oldValue]);
      if (result.affectedRows > 0) {
        console.log(`Updated ${result.affectedRows} stories from '${oldValue}' to '${newValue}'`);
      }
    }

    // Set NULL values to 'default'
    const nullResult = await db.query("UPDATE stories SET display_section = 'default' WHERE display_section IS NULL");
    if (nullResult.affectedRows > 0) {
      console.log(`Set ${nullResult.affectedRows} NULL values to 'default'`);
    }

    // Step 3: Change back to ENUM with valid values
    console.log('Step 3: Changing back to ENUM...');
    try {
      await db.query("ALTER TABLE stories MODIFY COLUMN display_section ENUM('default', 'latest_stories', 'must_read', 'innovation') DEFAULT 'default'");
      console.log('Changed back to ENUM successfully');
    } catch (error) {
      console.error('Error changing back to ENUM:', error.message);
    }

    // Step 4: Verify the changes
    console.log('Step 4: Verifying changes...');
    const [rows] = await db.query('SELECT id, display_section FROM stories');
    console.log(`Total stories: ${rows.length}`);
    const sectionCounts = {};
    rows.forEach(row => {
      sectionCounts[row.display_section] = (sectionCounts[row.display_section] || 0) + 1;
    });
    console.log('Stories by section:', sectionCounts);

    console.log('Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

fixDisplaySectionSafe();

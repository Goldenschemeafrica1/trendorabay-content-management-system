const db = require('../../src/config/database');

async function cleanInvalidSlugs() {
  try {
    console.log('Checking for communities with invalid slugs...');

    // Find communities with invalid slugs
    const [invalidCommunities] = await db.query(`
      SELECT id, name, slug
      FROM communities
      WHERE slug = '?' OR slug = '' OR slug IS NULL
    `);

    console.log('Found invalid communities:', invalidCommunities);

    if (invalidCommunities.length > 0) {
      // Delete or update them
      for (const community of invalidCommunities) {
        const newSlug = `community-${community.id}-${Date.now()}`;
        console.log(`Updating community ${community.id} from slug '${community.slug}' to '${newSlug}'`);

        await db.query(
          'UPDATE communities SET slug = ? WHERE id = ?',
          [newSlug, community.id]
        );
      }
      console.log('Fixed all invalid slugs');
    } else {
      console.log('No invalid slugs found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanInvalidSlugs();

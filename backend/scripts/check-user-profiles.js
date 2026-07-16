const db = require('../src/config/database');

async function checkUserProfiles() {
  try {
    console.log('Checking user profile images...');
    
    const [rows] = await db.query('SELECT id, name, email, profile_image_url FROM cms_users LIMIT 5');
    
    console.log('User profiles:');
    rows.forEach((user, index) => {
      console.log(`\n${index + 1}. ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Profile Image URL: ${user.profile_image_url || 'No image'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user profiles:', error.message);
    process.exit(1);
  }
}

checkUserProfiles();

const db = require('../src/config/database');

async function deleteSuperAdminUser() {
  try {
    console.log('Deleting superadmin user...');
    
    const [result] = await db.query(
      'DELETE FROM cms_users WHERE email = ?',
      ['superadmin@trendorabay.com']
    );
    
    if (result.affectedRows > 0) {
      console.log(`✓ Superadmin user deleted successfully`);
      console.log('Email: superadmin@trendorabay.com');
    } else {
      console.log('Superadmin user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to delete superadmin user:', error.message);
    process.exit(1);
  }
}

deleteSuperAdminUser();

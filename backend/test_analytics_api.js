const db = require('./src/config/database');

async function testAPI() {
  try {
    console.log('Testing traffic_sources query...');
    const [tableExists] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'traffic_sources'
    `);
    console.log('Table exists:', tableExists[0].count);

    const [rows] = await db.query(`
      SELECT 
        source_name as name,
        percentage as value,
        color
      FROM traffic_sources
      ORDER BY value DESC
    `);
    console.log('Query result:', JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAPI();

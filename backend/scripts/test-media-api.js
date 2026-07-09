// Test the media API endpoint directly
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('../src/config/database');

async function testMediaAPI() {
  try {
    console.log('Testing media API query...');
    const [rows] = await db.query('SELECT * FROM media ORDER BY created_at DESC');
    
    console.log('\n=== API Response Simulation ===');
    console.log(`Total records: ${rows.length}`);
    console.log('\nFirst record:');
    console.log(JSON.stringify(rows[0], null, 2));
    
    console.log('\n=== Checking for missing data ===');
    const requiredFields = ['id', 'filename', 'original_name', 'file_url', 'file_type', 'file_size', 'folder', 'uploaded_by', 'created_at'];
    
    rows.forEach((row, index) => {
      console.log(`\nRecord ${index + 1} (ID: ${row.id}):`);
      requiredFields.forEach(field => {
        const hasField = row.hasOwnProperty(field);
        const value = row[field];
        console.log(`  ${field}: ${hasField ? (value === null ? 'NULL' : 'PRESENT') : 'MISSING'}`);
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testMediaAPI();

#!/usr/bin/env node

/**
 * Subresource Integrity (SRI) Hash Generator
 * Generates SHA-256 and SHA-384 hashes for external resources
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');

/**
 * Generate SRI hash for a resource
 * @param {string} url - URL of the resource
 * @param {string} algorithm - Hash algorithm (sha256, sha384, sha512)
 * @returns {Promise<string>} - SRI hash string
 */
const generateSriHash = async (url, algorithm = 'sha384') => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        const hash = crypto.createHash(algorithm).update(data).digest('base64');
        resolve(`${algorithm}-${hash}`);
      });
    }).on('error', reject);
  });
};

/**
 * Generate multiple hash algorithms for a resource
 * @param {string} url - URL of the resource
 * @returns {Promise<Object>} - Object with multiple hashes
 */
const generateAllHashes = async (url) => {
  const algorithms = ['sha256', 'sha384', 'sha512'];
  const hashes = {};
  
  for (const algo of algorithms) {
    try {
      hashes[algo] = await generateSriHash(url, algo);
    } catch (error) {
      console.error(`Error generating ${algo} hash:`, error.message);
    }
  }
  
  return hashes;
};

/**
 * Main function
 */
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node generate-sri.js <url> [algorithm]');
    console.log('');
    console.log('Examples:');
    console.log('  node generate-sri.js https://cdn.jsdelivr.net/npm/example@1.0.0/script.js');
    console.log('  node generate-sri.js https://cdn.jsdelivr.net/npm/example@1.0.0/script.js sha256');
    console.log('  node generate-sri.js https://cdn.jsdelivr.net/npm/example@1.0.0/script.js all');
    console.log('');
    console.log('Supported algorithms: sha256, sha384, sha512, all');
    process.exit(1);
  }
  
  const url = args[0];
  const algorithm = args[1] || 'sha384';
  
  console.log(`Generating SRI hash for: ${url}`);
  console.log('');
  
  try {
    if (algorithm === 'all') {
      const hashes = await generateAllHashes(url);
      console.log('Generated hashes:');
      for (const [algo, hash] of Object.entries(hashes)) {
        console.log(`  ${algo}: ${hash}`);
      }
    } else {
      const hash = await generateSriHash(url, algorithm);
      console.log(`integrity="${hash}"`);
      console.log('');
      console.log('Usage in HTML:');
      console.log(`  <script src="${url}" integrity="${hash}" crossorigin="anonymous"></script>`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { generateSriHash, generateAllHashes };

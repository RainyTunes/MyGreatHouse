const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

/**
 * Download HTML from URL and save to file
 * @param {string} url - URL to download
 * @param {string} outputPath - Path to save the HTML file
 * @returns {Promise<boolean>} - Success status
 */
function downloadHTML(url, outputPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    };

    console.log(`  Downloading: ${url}`);

    const req = client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        const redirectUrl = res.headers.location;
        console.log(`  Redirect to: ${redirectUrl}`);
        downloadHTML(redirectUrl, outputPath).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          fs.writeFileSync(outputPath, data, 'utf8');
          const sizeKB = (Buffer.byteLength(data, 'utf8') / 1024).toFixed(2);
          console.log(`  ✓ Saved: ${path.basename(outputPath)} (${sizeKB} KB)`);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main download function
 */
async function downloadAll() {
  const dataSourcePath = './data/dataSource.json';
  const rawDir = './data/raw';

  // Read dataSource.json
  const dataSource = JSON.parse(fs.readFileSync(dataSourcePath, 'utf-8'));
  const reports = dataSource.reports;

  console.log(`Starting download of ${reports.length} HTML files...\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const filename = `${report.period}.html`;
    const outputPath = path.join(rawDir, filename);

    console.log(`[${i + 1}/${reports.length}] ${report.period}`);

    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ⊘ Already exists: ${filename} (${sizeKB} KB)`);
      skipped++;
      continue;
    }

    try {
      await downloadHTML(report.url, outputPath);
      success++;

      // Rate limiting: wait 500ms between requests
      if (i < reports.length - 1) {
        await sleep(500);
      }
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('=== Download Summary ===');
  console.log(`Total: ${reports.length}`);
  console.log(`Success: ${success}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nNote: You can re-run this script to retry failed downloads.');
  }
}

// Run the download
downloadAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

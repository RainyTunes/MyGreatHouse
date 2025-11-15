const fs = require('fs');
const https = require('https');
const http = require('http');

/**
 * Check if a URL is accessible
 * @param {string} url - URL to check
 * @returns {Promise<{url: string, status: number, valid: boolean}>}
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;

    const options = {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    };

    const req = client.request(url, options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        valid: res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302
      });
    });

    req.on('error', (err) => {
      resolve({
        url,
        status: 0,
        valid: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        valid: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

/**
 * Verify all URLs in dataSource.json
 */
async function verifyDataSource() {
  const dataPath = './data/dataSource.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`Verifying ${data.reports.length} URLs...\n`);

  const results = [];

  for (let i = 0; i < data.reports.length; i++) {
    const report = data.reports[i];
    const result = await checkUrl(report.url);

    results.push({
      ...result,
      period: report.period,
      publishDate: report.publishDate
    });

    const status = result.valid ? '✓' : '✗';
    const statusCode = result.status || 'ERR';
    console.log(`${status} [${statusCode}] ${report.period} - ${report.url}`);

    // Rate limiting: wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n--- Summary ---');
  const valid = results.filter(r => r.valid).length;
  const invalid = results.filter(r => !r.valid).length;
  console.log(`Valid: ${valid}`);
  console.log(`Invalid: ${invalid}`);

  // Save results
  const invalidReports = results.filter(r => !r.valid);
  if (invalidReports.length > 0) {
    console.log('\n--- Invalid URLs ---');
    invalidReports.forEach(r => {
      console.log(`${r.period}: ${r.url}`);
      if (r.error) console.log(`  Error: ${r.error}`);
    });

    fs.writeFileSync(
      './scripts/invalid-urls.json',
      JSON.stringify(invalidReports, null, 2)
    );
    console.log('\nInvalid URLs saved to scripts/invalid-urls.json');
  }

  return results;
}

// Run verification
verifyDataSource().catch(console.error);

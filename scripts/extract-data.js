const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

/**
 * Extract housing price data from HTML files
 * Extracts Table 1 (new house) and Table 2 (second-hand house) only
 */

/**
 * Parse a two-column table (Table 1 or Table 2)
 * Each row contains 2 cities side by side
 */
function parseTwoColumnTable($, $table) {
  const cities = [];
  const rows = $table.find('tr');

  // Skip first 2 rows (headers)
  rows.each((i, row) => {
    if (i < 2) return; // Skip header rows

    const $row = $(row);
    const cells = $row.find('td');

    // Support both 6-column format (no third metric) and 8-column format (with third metric)
    const hasThirdColumn = cells.length >= 8;

    if (cells.length < 4) return; // Skip invalid rows

    if (hasThirdColumn) {
      // 8-column format: city, mom, yoy, third | city, mom, yoy, third
      // Left city (cells 0-3)
      const leftCity = $(cells[0]).text().trim().replace(/\s+/g, '');
      if (leftCity) {
        cities.push({
          city: leftCity,
          mom: parseFloat($(cells[1]).text().trim()) || null,
          yoy: parseFloat($(cells[2]).text().trim()) || null,
          third: parseFloat($(cells[3]).text().trim()) || null
        });
      }

      // Right city (cells 4-7)
      const rightCity = $(cells[4]).text().trim().replace(/\s+/g, '');
      if (rightCity) {
        cities.push({
          city: rightCity,
          mom: parseFloat($(cells[5]).text().trim()) || null,
          yoy: parseFloat($(cells[6]).text().trim()) || null,
          third: parseFloat($(cells[7]).text().trim()) || null
        });
      }
    } else {
      // 6-column format: city, mom, yoy | city, mom, yoy
      // Left city (cells 0-2)
      const leftCity = $(cells[0]).text().trim().replace(/\s+/g, '');
      if (leftCity) {
        cities.push({
          city: leftCity,
          mom: parseFloat($(cells[1]).text().trim()) || null,
          yoy: parseFloat($(cells[2]).text().trim()) || null,
          third: null
        });
      }

      // Right city (cells 3-5)
      if (cells.length >= 6) {
        const rightCity = $(cells[3]).text().trim().replace(/\s+/g, '');
        if (rightCity) {
          cities.push({
            city: rightCity,
            mom: parseFloat($(cells[4]).text().trim()) || null,
            yoy: parseFloat($(cells[5]).text().trim()) || null,
            third: null
          });
        }
      }
    }
  });

  return cities;
}

/**
 * Detect the type of third column (定基 or 平均)
 */
function detectThirdColumnType($table) {
  const headerRow = $table.find('tr').eq(0);
  const headerText = headerRow.text();

  if (headerText.includes('定基')) {
    return 'baseIndex'; // 定基 (base index, 2020=100)
  } else if (headerText.includes('平均')) {
    return 'average'; // 平均 (year-to-date average)
  }

  return 'unknown';
}

/**
 * Extract data from a single HTML file
 */
function extractFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  const tables = $('table');

  if (tables.length < 2) {
    throw new Error(`Expected at least 2 tables, found ${tables.length}`);
  }

  // Determine third column type
  const thirdColumnType = detectThirdColumnType(tables.eq(0));

  // Extract Table 1 (New House)
  const newHouse = parseTwoColumnTable($, tables.eq(0));

  // Extract Table 2 (Second-hand House)
  const secondHand = parseTwoColumnTable($, tables.eq(1));

  return {
    newHouse,
    secondHand,
    thirdColumnType,
    tableCount: tables.length
  };
}

/**
 * Extract all files and save to JSON
 */
async function extractAll() {
  const dataSourcePath = './data/dataSource.json';
  const rawDir = './data/raw';
  const outputDir = './data/extracted';

  const dataSource = JSON.parse(fs.readFileSync(dataSourcePath, 'utf-8'));
  const reports = dataSource.reports;

  console.log(`Starting extraction of ${reports.length} HTML files...\n`);

  let success = 0;
  let failed = 0;
  const failedFiles = [];

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const filename = `${report.period}.html`;
    const inputPath = path.join(rawDir, filename);
    const outputPath = path.join(outputDir, `${report.period}.json`);

    console.log(`[${i + 1}/${reports.length}] ${report.period}`);

    if (!fs.existsSync(inputPath)) {
      console.log(`  ✗ Source file not found: ${filename}`);
      failed++;
      failedFiles.push(report.period);
      continue;
    }

    try {
      const extracted = extractFromHTML(inputPath);

      // Prepare output data
      const outputData = {
        period: report.period,
        publishDate: report.publishDate,
        sourceUrl: report.url,
        extractedAt: new Date().toISOString(),
        metadata: {
          tableCount: extracted.tableCount,
          thirdColumnType: extracted.thirdColumnType,
          newHouseCities: extracted.newHouse.length,
          secondHandCities: extracted.secondHand.length
        },
        data: {
          newHouse: extracted.newHouse,
          secondHand: extracted.secondHand
        }
      };

      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

      console.log(`  ✓ Extracted: ${extracted.newHouse.length} new house + ${extracted.secondHand.length} second-hand (${extracted.thirdColumnType})`);
      success++;

    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      failed++;
      failedFiles.push(report.period);
    }
  }

  console.log('\n=== Extraction Summary ===');
  console.log(`Total: ${reports.length}`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed files:', failedFiles.join(', '));
  }
}

// Run extraction
extractAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

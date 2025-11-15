const fs = require('fs');
const cheerio = require('cheerio');

const htmlPath = process.argv[2] || './data/samples/2024-12.html';

try {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);

  console.log('=== HTML Structure Analysis ===\n');

  // Find all tables
  const tables = $('table');
  console.log(`Total tables found: ${tables.length}\n`);

  tables.each((index, table) => {
    console.log(`--- Table ${index + 1} ---`);

    const $table = $(table);
    const rows = $table.find('tr');
    console.log(`Rows: ${rows.length}`);

    // Analyze first few rows
    rows.slice(0, 3).each((rowIndex, row) => {
      const $row = $(row);
      const cells = $row.find('td, th');
      console.log(`  Row ${rowIndex + 1}: ${cells.length} cells`);

      cells.slice(0, 5).each((cellIndex, cell) => {
        const text = $(cell).text().trim().replace(/\s+/g, ' ');
        console.log(`    Cell ${cellIndex + 1}: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
      });
    });

    console.log('');
  });

} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Error: cheerio module not found. Please run: npm install cheerio');
  } else {
    console.error('Error:', error.message);
  }
}

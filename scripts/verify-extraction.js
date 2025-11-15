const fs = require('fs');
const path = require('path');

const extractedDir = './data/extracted';
const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.json')).sort();

console.log('=== Extraction Quality Verification ===\n');
console.log('Total files:', files.length);

const stats = {
  total: 0,
  withThird: 0,
  withoutThird: 0,
  byType: {}
};

const issues = [];

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(extractedDir, file), 'utf-8'));
  const period = data.period;
  const meta = data.metadata;

  stats.total++;

  // Check city counts
  if (meta.newHouseCities !== 70 || meta.secondHandCities !== 70) {
    issues.push(`${period}: Expected 70 cities, got ${meta.newHouseCities} new + ${meta.secondHandCities} second-hand`);
  }

  // Track third column types
  const type = meta.thirdColumnType;
  stats.byType[type] = (stats.byType[type] || 0) + 1;

  // Check if has third column data
  const hasThird = data.data.newHouse.some(c => c.third !== null);
  if (hasThird) {
    stats.withThird++;
  } else {
    stats.withoutThird++;
  }
});

console.log('Third column types:');
Object.keys(stats.byType).sort().forEach(type => {
  console.log(`  ${type}: ${stats.byType[type]} files`);
});

console.log(`\nFiles with third column data: ${stats.withThird}`);
console.log(`Files without third column data: ${stats.withoutThird}`);

if (issues.length > 0) {
  console.log(`\n⚠️  Issues found (${issues.length}):`);
  issues.forEach(issue => console.log('  ' + issue));
} else {
  console.log('\n✓ All files have correct city counts (70 each)');
}

// Sample check
console.log('\n=== Sample Data ===');
const sample = JSON.parse(fs.readFileSync(path.join(extractedDir, '2024-12.json'), 'utf-8'));
console.log('Period:', sample.period);
console.log('New house sample (Beijing):', sample.data.newHouse.find(c => c.city === '北京'));
console.log('Second-hand sample (Shanghai):', sample.data.secondHand.find(c => c.city === '上海'));

console.log('\n=== File List ===');
files.forEach(f => console.log('  ' + f));

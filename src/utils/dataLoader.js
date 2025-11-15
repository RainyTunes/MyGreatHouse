/**
 * Load and process housing price data
 */

/**
 * Load all extracted data and filter for a specific city
 */
export async function loadCityData(cityName) {
  // Import all JSON files from data/extracted
  const dataFiles = import.meta.glob('/data/extracted/*.json');

  const allData = [];

  for (const path in dataFiles) {
    const module = await dataFiles[path]();
    const data = module.default;

    // Find city data in both newHouse and secondHand
    const newHouse = data.data.newHouse.find(c => c.city === cityName);
    const secondHand = data.data.secondHand.find(c => c.city === cityName);

    if (newHouse || secondHand) {
      allData.push({
        period: data.period,
        publishDate: data.publishDate,
        newHouse: newHouse || null,
        secondHand: secondHand || null
      });
    }
  }

  // Sort by period
  allData.sort((a, b) => a.period.localeCompare(b.period));

  return allData;
}

/**
 * Calculate statistics for the data
 */
export function calculateStats(data, type = 'newHouse') {
  const validData = data
    .filter(d => d[type] && d[type].yoy !== null)
    .map(d => ({
      period: d.period,
      yoy: d[type].yoy
    }));

  if (validData.length === 0) {
    return {
      totalChange: 0,
      startValue: 100,
      endValue: 100,
      startPeriod: null,
      endPeriod: null,
      minYoy: 100,
      maxYoy: 100,
      avgYoy: 100
    };
  }

  const firstYoy = validData[0].yoy;
  const lastYoy = validData[validData.length - 1].yoy;
  const totalChange = lastYoy - firstYoy;

  const yoyValues = validData.map(d => d.yoy);
  const minYoy = Math.min(...yoyValues);
  const maxYoy = Math.max(...yoyValues);
  const avgYoy = yoyValues.reduce((a, b) => a + b, 0) / yoyValues.length;

  return {
    totalChange: totalChange.toFixed(2),
    startValue: firstYoy.toFixed(1),
    endValue: lastYoy.toFixed(1),
    startPeriod: validData[0].period,
    endPeriod: validData[validData.length - 1].period,
    minYoy: minYoy.toFixed(1),
    maxYoy: maxYoy.toFixed(1),
    avgYoy: avgYoy.toFixed(1),
    dataPoints: validData.length
  };
}

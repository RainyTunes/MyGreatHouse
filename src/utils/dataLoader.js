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
      yoy: d[type].yoy,
      mom: d[type].mom
    }));

  if (validData.length === 0) {
    return {
      totalChange: 0,
      totalChangePercent: 0,
      cumulativeIndex: 100,
      startValue: 100,
      endValue: 100,
      startPeriod: null,
      endPeriod: null,
      minYoy: 100,
      maxYoy: 100,
      avgYoy: 100
    };
  }

  // 使用环比(MoM)累乘计算整个时间段的真实涨跌幅
  // 公式：累计指数 = 100 × (第1月环比/100) × (第2月环比/100) × ... × (第N月环比/100)

  console.group('📊 累计涨跌幅计算过程');
  console.log('时间范围:', validData[0].period, '→', validData[validData.length - 1].period);
  console.log('数据点数:', validData.length, '个月');

  let cumulativeIndex = 100;
  const momData = validData.filter(d => d.mom !== null);

  if (momData.length > 0) {
    console.log('\n使用环比(MoM)累乘计算:');
    console.log('初始指数: 100');

    momData.forEach((d, index) => {
      const prevIndex = cumulativeIndex;
      cumulativeIndex = cumulativeIndex * (d.mom / 100);
      if (index < 5 || index >= momData.length - 5) {
        console.log(`  ${d.period}: MoM=${d.mom.toFixed(2)}, 累计=${cumulativeIndex.toFixed(2)}`);
      } else if (index === 5) {
        console.log('  ... (省略中间数据) ...');
      }
    });
  } else {
    console.log('\n⚠️ 无环比数据，使用同比估算');
    console.log('注意：同比数据不能直接累乘（它是相对于去年同期，而非连续月份）');
    cumulativeIndex = validData[validData.length - 1].yoy;
  }

  const totalChange = cumulativeIndex - 100;
  const totalChangePercent = totalChange;

  console.log('\n最终结果:');
  console.log('累计指数:', cumulativeIndex.toFixed(2));
  console.log('累计涨跌:', totalChange.toFixed(2));
  console.log('累计涨跌幅:', totalChangePercent.toFixed(2) + '%');
  console.groupEnd();

  const firstYoy = validData[0].yoy;
  const lastYoy = validData[validData.length - 1].yoy;

  const yoyValues = validData.map(d => d.yoy);
  const minYoy = Math.min(...yoyValues);
  const maxYoy = Math.max(...yoyValues);
  const avgYoy = yoyValues.reduce((a, b) => a + b, 0) / yoyValues.length;

  return {
    totalChange: totalChange.toFixed(2),
    totalChangePercent: totalChangePercent.toFixed(2),
    cumulativeIndex: cumulativeIndex.toFixed(2),
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

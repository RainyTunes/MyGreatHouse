# 数据提取方案 - HTML表格解析

## HTML结构分析结果

### 发现的表格结构

每个HTML页面包含**12个表格**（重复出现2次，可能是为了移动端和PC端）：

**实际需要的表格**（前6个）：
1. **表1**: 新建商品住宅销售价格指数（总体）
2. **表2**: 二手住宅销售价格指数（总体）
3. **表3**: 新建商品住宅分类指数（一）- 按面积分类
4. **表3续**: 新建商品住宅分类指数（二）
5. **表4**: 二手住宅分类指数（一）- 按面积分类
6. **表4续**: 二手住宅分类指数（二）

后6个表格是重复内容（第7-12个表格）。

### 表格1和表格2的结构

```
Row 1 (Header):  城市 | 环比 | 同比 | 1-12月平均 | 城市 | 环比 | 同比 | 1-12月平均
Row 2 (SubHeader): 上月=100 | 上年同月=100 | 上年同期=100 | ...
Row 3+: 北京 | 99.9 | 94.6 | 97.6 | 唐山 | ...
```

**特点**：
- 每行包含**2个城市**的数据（左右分栏布局）
- 共70个城市，约37行
- 数据列：环比（MoM）、同比（YoY）、年度平均

### 表格3和表格4的结构

```
Row 1: 城市 | 90m2及以下 | 90-144m2 | 144m2以上
Row 2: (空) | 环比 | 同比 | 平均 | 环比 | 同比 | 平均 | ...
Row 3+: 北京 | 数据...
```

**特点**：
- 按房屋面积分类（小户型、中户型、大户型）
- 每个面积分类包含：环比、同比、年度平均

---

## 主流数据提取方案对比

### 方案A: Node.js + Cheerio（推荐）⭐

#### 技术栈
```json
{
  "dependencies": {
    "cheerio": "^1.0.0",     // HTML解析
    "axios": "^1.6.0"        // HTTP请求
  }
}
```

#### 优点
- ✅ 轻量级，性能好
- ✅ jQuery语法，易上手
- ✅ 与React前端技术栈一致
- ✅ 直接输出JSON格式
- ✅ 已经安装并验证可用

#### 缺点
- ⚠️ 表格结构复杂需要仔细处理（2列并排布局）
- ⚠️ 需要处理中文空格和特殊字符

#### 实现策略

**表格1/2的提取逻辑**：
```javascript
// 表格1和2是2列布局，需要特殊处理
function parseTable1or2($table) {
  const cities = [];
  const rows = $table.find('tr').slice(2); // 跳过header

  rows.each((i, row) => {
    const cells = $(row).find('td');

    // 左侧城市 (cells 0-3)
    if (cells.eq(0).text().trim()) {
      cities.push({
        name: cells.eq(0).text().trim(),
        mom: parseFloat(cells.eq(1).text()),    // 环比
        yoy: parseFloat(cells.eq(2).text()),    // 同比
        average: parseFloat(cells.eq(3).text()) // 平均
      });
    }

    // 右侧城市 (cells 4-7)
    if (cells.eq(4).text().trim()) {
      cities.push({
        name: cells.eq(4).text().trim(),
        mom: parseFloat(cells.eq(5).text()),
        yoy: parseFloat(cells.eq(6).text()),
        average: parseFloat(cells.eq(7).text())
      });
    }
  });

  return cities;
}
```

**表格3/4的提取逻辑**：
```javascript
function parseTable3or4($table) {
  const cities = [];
  const rows = $table.find('tr').slice(3); // 跳过多层header

  rows.each((i, row) => {
    const cells = $(row).find('td');
    const cityName = cells.eq(0).text().trim();

    cities.push({
      name: cityName,
      size_90_below: {
        mom: parseFloat(cells.eq(1).text()),
        yoy: parseFloat(cells.eq(2).text()),
        average: parseFloat(cells.eq(3).text())
      },
      size_90_144: {
        mom: parseFloat(cells.eq(4).text()),
        yoy: parseFloat(cells.eq(5).text()),
        average: parseFloat(cells.eq(6).text())
      },
      size_144_above: {
        mom: parseFloat(cells.eq(7).text()),
        yoy: parseFloat(cells.eq(8).text()),
        average: parseFloat(cells.eq(9).text())
      }
    });
  });

  return cities;
}
```

---

### 方案B: Python + Pandas

#### 技术栈
```python
import pandas as pd
from bs4 import BeautifulSoup
import requests
```

#### 优点
- ✅ Pandas对表格处理强大（`pd.read_html()`）
- ✅ 数据清洗工具丰富

#### 缺点
- ❌ 需要额外Python环境
- ❌ 与前端技术栈分离
- ❌ `pd.read_html()` 对复杂布局支持有限
- ❌ 2列并排布局可能解析错误

---

### 方案C: 手动复制 + Excel转换

#### 流程
1. 手动从网页复制表格到Excel
2. 使用`xlsx`库读取Excel
3. 转换为JSON

#### 优点
- ✅ 数据准确性高
- ✅ 无需处理HTML解析

#### 缺点
- ❌ 42个月 × 6个表格 = 252次手动操作
- ❌ 不可自动化
- ❌ 容易出错

---

## 推荐方案：Node.js + Cheerio

### 原因
1. **技术栈统一**：与React前端一致
2. **已验证可用**：成功解析了HTML结构
3. **可自动化**：能批量处理42个月数据
4. **灵活性**：可处理复杂的2列布局

### 数据Schema设计

```json
{
  "period": "2024-12",
  "publishDate": "2025-01-17",
  "sourceUrl": "https://www.stats.gov.cn/...",
  "data": {
    "newHouse": [
      {
        "city": "北京",
        "tier": "first",
        "mom": 99.9,
        "yoy": 94.6,
        "average": 97.6
      }
      // ... 69 other cities
    ],
    "secondHand": [
      {
        "city": "北京",
        "tier": "first",
        "mom": 100.5,
        "yoy": 95.5,
        "average": 92.9
      }
      // ... 69 other cities
    ],
    "newHouseBySize": [
      {
        "city": "北京",
        "size90Below": { "mom": 99.8, "yoy": 94.2, "average": 97.3 },
        "size90To144": { "mom": 100.0, "yoy": 94.8, "average": 97.7 },
        "size144Above": { "mom": 99.9, "yoy": 94.7, "average": 97.8 }
      }
      // ... 69 other cities
    ],
    "secondHandBySize": [
      // 同上结构
    ]
  }
}
```

---

## 实现步骤

### Step 1: 创建提取器核心
```javascript
// scripts/extractor.js
class DataExtractor {
  constructor(html) {
    this.$ = cheerio.load(html);
  }

  extractAll() {
    const tables = this.$('table');

    return {
      newHouse: this.parseTable1or2(tables.eq(0)),
      secondHand: this.parseTable1or2(tables.eq(1)),
      newHouseBySize: this.mergeTable3(tables.eq(2), tables.eq(3)),
      secondHandBySize: this.mergeTable4(tables.eq(4), tables.eq(5))
    };
  }
}
```

### Step 2: 批量处理
```javascript
// scripts/extract-all.js
async function extractAllMonths() {
  const dataSource = require('../data/dataSource.json');

  for (const report of dataSource.reports) {
    const html = await fetchHTML(report.url);
    const extractor = new DataExtractor(html);
    const data = extractor.extractAll();

    fs.writeFileSync(
      `./data/processed/${report.period}.json`,
      JSON.stringify(data, null, 2)
    );

    await sleep(1000); // 防止请求过快
  }
}
```

### Step 3: 数据验证
```javascript
function validateData(data) {
  // 检查城市数量
  assert(data.newHouse.length === 70);
  assert(data.secondHand.length === 70);

  // 检查数据范围
  data.newHouse.forEach(city => {
    assert(city.mom >= 85 && city.mom <= 115); // 合理范围
    assert(city.yoy >= 80 && city.yoy <= 120);
  });
}
```

---

## 潜在问题和解决方案

### 问题1: 城市名称不一致
- **现象**: "北 京" vs "北京"
- **解决**: `cityName.replace(/\s+/g, '')`

### 问题2: 数据缺失（"-"或空值）
- **现象**: 某些城市某月数据为"-"
- **解决**: `parseFloat(text) || null`

### 问题3: 表格结构变化
- **现象**: 不同年份表格格式可能微调
- **解决**:
  - 保留原始HTML备份
  - 版本化解析器
  - 添加结构验证

### 问题4: 网络请求失败
- **解决**:
  - 添加重试机制
  - 设置合理timeout
  - 保存中间结果

---

## 下一步行动

### Option 1: 快速原型（推荐）
1. 实现单个HTML的完整提取
2. 验证数据准确性（与网页对比）
3. 扩展到批量处理
4. 提交第一批数据

### Option 2: 稳健开发
1. 先提取表1（最简单）
2. 验证通过后提取表2
3. 最后处理表3/4（最复杂）
4. 逐步完善

---

## 风险评估

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| 表格结构不一致 | 中 | 高 | 版本化解析器 |
| 数据值异常 | 低 | 中 | 添加验证规则 |
| 反爬虫限制 | 低 | 高 | 请求间隔1s，User-Agent |
| 中文编码问题 | 低 | 低 | UTF-8处理 |

---

**建议**：使用方案A（Node.js + Cheerio），先实现表1/表2的提取（占数据价值80%），验证通过后再扩展到表3/4。

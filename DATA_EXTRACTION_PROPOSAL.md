# Data Extraction Proposal - 70-City Housing Price Reports

## 目标
从国家统计局网站提取2022年5月至今的70城房价数据，转换为结构化JSON格式供前端可视化使用。

## 数据源分析

### 网页结构特征
- **URL格式**: `https://www.stats.gov.cn/sj/zxfb/YYYYMM/tYYYYMMDD_*.html`
- **数据形式**: HTML表格（通常包含4个表格）
  - 表1：新建商品住宅销售价格指数
  - 表2：二手住宅销售价格指数
  - 表3：新建商品住宅分类价格指数
  - 表4：二手住宅分类价格指数
- **城市数量**: 70个城市（一线、二线、三线城市分类）
- **指标维度**: 环比、同比、定基指数

---

## 主流处理方案对比

### 方案A: Node.js + Cheerio/JSDOM (推荐⭐)

**技术栈**
- `axios` / `node-fetch`: HTTP请求
- `cheerio`: HTML解析（轻量级jQuery语法）
- `iconv-lite`: 字符编码转换（处理GB2312）

**优点**
- ✅ JavaScript生态，与React前端技术栈一致
- ✅ Cheerio性能好，内存占用低
- ✅ 易于调试和维护
- ✅ 可直接写入JSON文件，无需额外转换

**缺点**
- ⚠️ 表格结构复杂时需要仔细处理DOM选择器
- ⚠️ 需要处理反爬虫（User-Agent、请求间隔）

**实现步骤**
1. 读取 `dataSource.json`
2. 遍历每个URL，发送HTTP请求
3. 解析HTML，定位表格元素
4. 提取城市名、价格指数数据
5. 转换为标准化JSON格式
6. 保存到 `data/YYYY-MM.json`

**示例代码结构**
```javascript
// scripts/scraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function fetchReport(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // 解析表格
  const tables = $('table');
  const data = parseTable(tables);

  return data;
}
```

---

### 方案B: Python + BeautifulSoup/Scrapy

**技术栈**
- `requests` / `httpx`: HTTP请求
- `BeautifulSoup4` / `lxml`: HTML解析
- `pandas`: 表格数据处理

**优点**
- ✅ 成熟的爬虫生态系统
- ✅ pandas对表格数据处理能力强
- ✅ 丰富的反爬虫工具（如Scrapy middleware）

**缺点**
- ⚠️ 需要额外的Python环境
- ⚠️ 与前端技术栈分离，增加项目复杂度
- ⚠️ 需要单独转换JSON格式

**实现步骤**
1. 读取 `dataSource.json`
2. 使用requests获取HTML
3. BeautifulSoup解析表格
4. pandas处理数据并转为DataFrame
5. 导出为JSON

---

### 方案C: Puppeteer/Playwright (浏览器自动化)

**技术栈**
- `puppeteer` / `playwright`: 无头浏览器

**优点**
- ✅ 完整渲染JavaScript生成的内容
- ✅ 可截图保存原始页面
- ✅ 绕过简单的反爬虫机制

**缺点**
- ❌ 资源消耗大（需要启动浏览器）
- ❌ 速度慢（32个页面耗时长）
- ❌ 过度设计（stats.gov.cn是静态HTML）

**适用场景**: 网页包含大量JavaScript动态渲染时

---

### 方案D: 手动Excel导入 + 脚本转换

**流程**
1. 手动从网页复制表格到Excel
2. 使用 `xlsx` / `exceljs` 库读取Excel
3. 转换为JSON

**优点**
- ✅ 无需处理网页解析
- ✅ 数据可靠性高

**缺点**
- ❌ 手动操作量大（32个月 × 4个表格 = 128次操作）
- ❌ 不可自动化更新
- ❌ 容易出错

---

## 推荐方案: Node.js + Cheerio

### 理由
1. **技术栈统一**: 与React前端使用相同语言
2. **效率平衡**: 性能好，开发效率高
3. **可维护性**: 代码简洁，易于后续更新
4. **自动化友好**: 便于定期抓取新数据

### 项目结构
```
MyPoorHouse/
├── data/
│   ├── dataSource.json          # 数据源索引
│   ├── raw/                     # 原始HTML（可选，用于调试）
│   └── processed/               # 处理后的JSON
│       ├── 2022-05.json
│       ├── 2022-06.json
│       └── ...
├── scripts/
│   ├── scraper.js               # 爬虫主逻辑
│   ├── parser.js                # HTML解析器
│   ├── validator.js             # 数据验证
│   └── utils.js                 # 工具函数
└── package.json
```

### 数据Schema设计（初步）
```json
{
  "period": "2024-09",
  "publishDate": "2024-10-18",
  "sourceUrl": "https://www.stats.gov.cn/...",
  "cities": [
    {
      "name": "北京",
      "tier": "first",
      "newHouse": {
        "mom": -0.5,          // 环比
        "yoy": -2.3,          // 同比
        "baseIndex": 98.5     // 定基指数
      },
      "secondHand": {
        "mom": -0.8,
        "yoy": -3.1,
        "baseIndex": 97.2
      }
    }
    // ... 69 other cities
  ],
  "summary": {
    "firstTier": { /* 汇总数据 */ },
    "secondTier": { /* 汇总数据 */ },
    "thirdTier": { /* 汇总数据 */ }
  }
}
```

---

## 备选方案: 混合方案

考虑到stats.gov.cn可能的反爬虫策略，建议：

1. **优先尝试**: Node.js + Cheerio（方案A）
2. **遇到问题时**:
   - 加入请求间隔（500ms-1s）
   - 设置合理User-Agent
   - 必要时使用代理
3. **最后手段**: 手动下载关键月份数据 + 脚本处理

---

## 下一步行动

### Option 1: 自动化优先（推荐）
1. 初始化Node.js项目
2. 实现单个URL的数据提取原型
3. 验证数据准确性
4. 批量处理所有32个月数据
5. 实现增量更新机制

### Option 2: 快速启动
1. 手动下载2-3个代表性月份的HTML
2. 开发解析脚本并验证
3. 确认方案可行后批量执行
4. 后续建立自动化流程

### Option 3: 保守方案
1. 手动提取关键月份数据（如2022-05, 2023-01, 2024-01, 2024-12）
2. 使用Excel中转，脚本转JSON
3. 先完成前端可视化原型
4. 再补充完整数据

---

## 风险与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 反爬虫限制 | 中 | 高 | 添加延时、User-Agent轮换 |
| HTML结构变化 | 低 | 中 | 保留原始HTML，版本化解析器 |
| 数据格式不一致 | 中 | 中 | 数据验证 + 人工审查 |
| 网站不可访问 | 低 | 高 | 本地缓存HTML，定期备份 |

---

## 估算工作量

- **方案A开发**: 4-6小时
  - 环境搭建: 0.5h
  - 解析器开发: 2-3h
  - 批量处理: 1h
  - 测试验证: 1-1.5h

- **数据获取**: 自动化10分钟 / 手动2-3天

---

**建议**: 采用方案A（Node.js + Cheerio），先实现单月数据提取的MVP，验证可行性后再批量处理。

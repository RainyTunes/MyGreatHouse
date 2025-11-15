# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This repository stores and visualizes China's 70-city housing price report data from May 2022 to present. Data is scraped from the National Bureau of Statistics website (stats.gov.cn) and visualized using React for personal reference.

## Architecture

### Data Layer
- **Storage**: JSON files (no backend database)
- **Source**: Monthly reports from https://www.stats.gov.cn/sj/zxfb/
- **Schema**: Each monthly report contains price indices for 70 cities across different housing categories

### Frontend
- **Framework**: React with Redux Toolkit for state management
- **Purpose**: Data visualization and interactive charts for housing price trends

### Data Collection
- Web scraping scripts to extract monthly 70-city reports
- Data transformation to standardized JSON format
- Historical data: May 2022 to present

## Project Structure

```
/data          - Monthly housing report JSON files
/src           - React application source
  /components  - UI components
  /features    - Redux Toolkit slices
  /utils       - Data processing utilities
/scripts       - Data scraping and processing scripts
```

## Development Workflow

### Before Implementation
- For complex multi-step tasks, create a TODO list and confirm with the user before executing
- Keep CLAUDE.md updated with actual development progress and keep it concise

### Data Scraping
- Target URL pattern: https://www.stats.gov.cn/sj/zxfb/YYYYMM/tYYYYMMDD_*.html
- Extract 70-city housing price indices (new/second-hand, by tier)
- Save to `/data/YYYY-MM.json` with consistent schema

### Frontend Development
- Use Redux Toolkit for global state management
- Keep components focused on visualization
- Data flows from JSON files → Redux store → React components

## Key Considerations

- Data accuracy is critical - validate scraped data against source
- Maintain consistent JSON schema across all monthly files
- Support incremental updates as new monthly reports are published
- Ensure visualizations clearly show trends over time and across cities

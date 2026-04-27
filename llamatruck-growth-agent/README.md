# LLAMATRUCK Growth Agent

Facebook农民流量获取系统

## 功能

- 自动抓取Facebook农民相关群组
- AI筛选高价值群组
- 提取管理员信息
- AI生成个性化私信
- 半自动发送（防封号）
- 数据管理看板

## 快速开始

```bash
npm install
cp .env.example .env.local
# 填入你的API keys
npm run dev
```

## 技术栈

- Next.js 14 (App Router)
- Apify Facebook Scraper
- OpenAI GPT-4
- Google Sheets

## 部署

```bash
vercel --prod
```

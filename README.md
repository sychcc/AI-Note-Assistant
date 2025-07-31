# AI 筆記管理助手 (v1 版本)

這是一個使用 React＆Node.js＆Express 製作的 AI 筆記管理工具，能夠幫助你記錄學習筆記、編輯進度、並結合 AI 提供每日學習建議卡片。

> 第一版功能主要集中在 CRUD、資料視覺化、Restful API 與前後端基本串接。

---

## 技術架構

- 前端：React + Axios + Recharts
- 後端：Node.js + Express
- 假資料庫：JSON 檔案（模擬資料存取）
- AI 建議：串接 Google Gemini API
- RestFul API : AI 模擬建議

---

## v1 已完成功能

- 筆記 CRUD（建立、刪除、編輯進度）
- React 表單（NoteForm）串接後端
- 統計圖表（使用 Recharts）
- AI 模擬建議卡（GET /ai-tips）
- AI 摘要功能（串接 Gemini API）
- 分類篩選與分類統計
- UI 初步設計（後續 v3 版會全面導入 Tailwind CSS）

---

## 如何啟動本機開發

```bash
# 啟動後端
cd backend
node server.js

# 啟動前端（使用 Vite）
npm install
npm run dev
```

---

# AI Notes Assistant (v1)

This is a React + Node.js + Express-based note management tool designed to help you keep track of what you’ve learned, edit your learning progress, and receive a daily learning suggestion powered by AI.

> In this version, the focus is on implementing full CRUD features and learning how to build and connect RESTful APIs between the frontend and backend.

## Tech Stack

    •	Frontend: React + Axios + Recharts
    •	Backend: Node.js + Express
    •	Database: JSON as a mock file-based database
    •	AI Tip Module (Mock): GET /ai-tips
    •	AI Summary Generator: Integrated with Google Gemini API
    •	RESTful API: For creating, updating, and deleting notes

## v1 Completed Features

- Full CRUD for notes (Create, Read, Update, Delete)
- React form component (NoteForm) with backend API integration
- Statistics module using Recharts
- AI suggestion card (GET /ai-tips)
- AI summary generation (via Gemini API)
- Category filtering + visual stats by category
- Basic layout styling (Full Tailwind CSS integration planned for v3)

## Getting Started

# Start the backend

cd backend
node server.js

# Start the frontend (Vite-based)

npm install
npm run dev

import dotenv from "dotenv";
dotenv.config();
import geminiRouter from "./gemini.js";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 處理 __dirname (因為使用 ESM 模組)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// 中介層：允許跨域請求、解析 JSON
app.use(cors());
app.use(express.json());
app.use("/api", geminiRouter);

// 建立 GET /notes API
app.get("/notes", (req, res) => {
  const filePath = path.join(__dirname, "data", "notes.json");
  console.log("正在讀取資料檔：", filePath);
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "讀取資料失敗" });
    }
    res.json(JSON.parse(data));
  });
});

//建立 POST /notes API
app.post("/notes", (req, res) => {
  console.log("✅ 收到 POST /notes");
  console.log("📥 req.body:", req.body);

  const filePath = path.join(__dirname, "data", "notes.json");

  const newNote = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    progress: req.body.progress || 0,
    createAt: new Date().toISOString(),
  };

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "讀取資料失敗" });

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile(filePath, JSON.stringify(notes, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "寫入資料失敗" });
      //HTTP 201 Created
      res.status(201).json(newNote);
    });
  });
});

// 刪除筆記 API
app.delete("/notes/:id", (req, res) => {
  console.log("🗑️ 收到刪除請求，id =", req.params.id);

  const filePath = path.join(__dirname, "data", "notes.json");
  const noteId = parseInt(req.params.id); //將id字串轉為數字
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "讀取資料失敗" });

    let notes = JSON.parse(data); //解析資料庫的data轉為JS array
    const newNotes = notes.filter((note) => note.id !== noteId);
    //用filter留下我想要的東西
    fs.writeFile(filePath, JSON.stringify(newNotes, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "刪除資料失敗" });

      res.status(200).json({ success: true });
    });
  });
});

//GET /ai-tips API
app.get("/ai-tips", (req, res) => {
  const tips = [
    "很棒！繼續複習昨天的 React 元件結構與 Props 傳遞",
    "嘗試用 useEffect 串一次 API 資料～",
    "筆記內容很不錯！",
  ];

  // 隨機挑一段
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  res.json({ tip: randomTip });
});
//修改progress
app.put("/notes/:id", (req, res) => {
  const filePath = path.join(__dirname, "data", "notes.json");
  const noteId = req.params.id; // 字串也 OK

  const updatedProgress = req.body.progress;

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "讀取資料失敗" });

    let notes = JSON.parse(data);
    let found = false;

    // 修改指定筆記的進度
    const newNotes = notes.map((note) => {
      if (String(note.id) === noteId) {
        found = true;
        return { ...note, progress: updatedProgress };
      }
      return note;
    });

    if (!found) return res.status(404).json({ error: "找不到該筆記" });

    fs.writeFile(filePath, JSON.stringify(newNotes, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "寫入資料失敗" });

      res.status(200).json({ success: true });
    });
  });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`後端伺服器啟動：http://localhost:${port}`);
});

import dotenv from "dotenv";
dotenv.config();
import geminiRouter from "./gemini.js";

import express from "express";
import cors from "cors";

//引入mongodb
import { ObjectId } from "mongodb";
import { getNotesCollection } from "./mongodb.js";

const app = express();
const port = 3000;

// 中介層：允許跨域請求、解析 JSON
app.use(cors());
app.use(express.json());

app.use("/api", geminiRouter);

// 建立 GET /notes API - 移除用戶驗證
app.get("/notes", async (req, res) => {
  try {
    const notesCollection = await getNotesCollection();
    const notes = await notesCollection.find({}).toArray(); // 移除 userId 篩選
    res.json(notes);
  } catch (err) {
    console.error("讀取筆記失敗:", err);
    res.status(500).json({ error: "無法讀取資料" });
  }
});

//建立 POST /notes API - 移除用戶驗證
app.post("/notes", async (req, res) => {
  try {
    const notesCollection = await getNotesCollection();
    const newNote = {
      ...req.body,
      createdAt: new Date().toISOString(), // 移除 userId
    };

    const result = await notesCollection.insertOne(newNote);
    res.status(201).json({ _id: result.insertedId, ...newNote });
  } catch (err) {
    console.error("新增筆記失敗:", err);
    res.status(500).json({ error: "新增筆記失敗" });
  }
});

// DELETE /notes/:id - 移除用戶驗證
app.delete("/notes/:id", async (req, res) => {
  const noteId = req.params.id;

  try {
    const notesCollection = await getNotesCollection();
    const result = await notesCollection.deleteOne({
      _id: new ObjectId(noteId), // 移除 userId 篩選
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "找不到該筆記" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("刪除筆記失敗:", err);
    res.status(500).json({ error: "刪除筆記失敗" });
  }
});

// PUT /notes/:id - 移除用戶驗證
app.put("/notes/:id", async (req, res) => {
  const noteId = req.params.id;
  const updatedFields = req.body;

  try {
    const notesCollection = await getNotesCollection();
    const result = await notesCollection.updateOne(
      {
        _id: new ObjectId(noteId), // 移除 userId 篩選
      },
      { $set: updatedFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "找不到該筆記" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("更新筆記失敗:", err);
    res.status(500).json({ error: "更新筆記失敗" });
  }
});

//GET /ai-tips API
app.get("/ai-tips", (req, res) => {
  const tips = [
    `很棒！繼續複習昨天的 React 元件結構與 Props 傳遞`,
    `嘗試用 useEffect 串一次 API 資料～`,
    `筆記內容很不錯！`,
  ];

  // 隨機挑一段
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  res.json({ tip: randomTip });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`後端伺服器啟動：http://localhost:${port}`);
  console.log(`📝 筆記 API：http://localhost:${port}/notes`);
  console.log(`🤖 AI 建議：http://localhost:${port}/ai-tips`);
});

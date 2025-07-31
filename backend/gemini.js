// backend/gemini.js

import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/summarize", async (req, res) => {
  const { content } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `請使用繁體中文，將以下內容濃縮為一段 60 字以內的重點摘要：${content}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: apiKey, // 來自 process.env.GEMINI_API_KEY
        },
      }
    );

    const summary =
      response.data.candidates[0]?.content?.parts[0]?.text ||
      "（無法產生摘要）";
    res.json({ summary });
  } catch (err) {
    console.error("❌ Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI 摘要失敗" });
  }
  console.log("🔑 GEMINI KEY:", process.env.GEMINI_API_KEY);
});

export default router;

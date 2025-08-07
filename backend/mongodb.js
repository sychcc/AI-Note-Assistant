// backend/mongodb.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("請在 .env 檔案中設定 MONGODB_URI");
  process.exit(1);
}

const client = new MongoClient(uri);

// 連接狀態
let isConnected = false;

// 連接到 MongoDB
async function connectToMongoDB() {
  try {
    if (!isConnected) {
      await client.connect();
      console.log("成功連接到 MongoDB Atlas!");
      isConnected = true;
    }
    return client;
  } catch (error) {
    console.error("MongoDB 連接失敗:", error);
    throw error;
  }
}

// 取得資料庫和集合
async function getDatabase() {
  const client = await connectToMongoDB(); // 取得 client
  const db = client.db("ai-notes"); // 從 client 取得 database
  return db; // 回傳 database
}

async function getNotesCollection() {
  const client = await connectToMongoDB(); // 取得 client
  const db = client.db("ai-notes"); // 從 client 取得 database
  const collection = db.collection("notes"); // 從 database 取得 collection
  return collection; // 回傳 collection
}

// 優雅關閉連接（簡化版）
process.on("SIGINT", async () => {
  console.log("\n正在關閉伺服器...");
  await client.close();
  console.log("📦 MongoDB 連接已關閉");
  process.exit(0);
});

export { connectToMongoDB, getDatabase, getNotesCollection };

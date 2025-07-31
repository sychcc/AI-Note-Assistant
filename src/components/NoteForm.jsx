import { useState } from "react";
import axios from "axios";

function NoteForm({ onNoteAdded }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  //handleSubmit負責處理送出表單後，把資料傳到後端的事情
  //因為有呼叫api所以使用async & await
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newNote = {
      title,
      content,
      category,
      progress: 0,
    };
    console.log("送出的 newNote：", newNote);

    try {
      const res = await axios.post("http://localhost:3000/notes", newNote);
      onNoteAdded(res.data); // 回傳新增結果給父元件
      setTitle("");
      setContent("");
      setCategory("");
    } catch (err) {
      console.error("新增筆記失敗", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 mb-6 space-y-4"
    >
      <h2 className="text-xl font-semibold">➕ 新增筆記</h2>
      <label>標題：</label>
      <input
        type="text"
        placeholder="標題"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ color: "black" }}
        required
      />
      <label>筆記內容：</label>
      <textarea
        placeholder="內容"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={3}
        required
        style={{ color: "black" }}
      />
      <label>筆記分類：</label>
      <input
        type="text"
        placeholder="分類"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
        style={{ color: "black" }}
      />

      <button
        type="submit"
        className="bg-blue-500 text-white font-medium px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        新增
      </button>
    </form>
  );
}

export default NoteForm;

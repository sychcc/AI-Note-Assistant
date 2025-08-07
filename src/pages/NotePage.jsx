import { useEffect, useState } from "react";
import axios from "axios";
import NoteForm from "../components/NoteForm";
import ChartBox from "../components/ChartBox";
import AiTipCard from "../components/AiTipCard";

function NotePage() {
  const [notes, setNotes] = useState([]);
  /**AI筆記摘要 */
  const [summaries, setSummaries] = useState({});
  const [showSummaries, setShowSummaries] = useState({});

  const [aiTip, setAiTip] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");

  //用axios抓API
  const fetchNotes = () => {
    axios
      .get("http://localhost:3000/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error("資料讀取失敗", err));
  };

  useEffect(() => {
    fetchNotes(); // 直接載入筆記

    //用axios抓ai tips資料
    axios
      .get("http://localhost:3000/ai-tips")
      .then((res) => setAiTip(res.data.tip))
      .catch((err) => console.error("AI 建議抓取失敗", err));
  }, []);

  // 新增編輯相關狀態
  const [editingId, setEditingId] = useState(null); // 正在編輯的筆記ID
  const [editForm, setEditForm] = useState({
    // 編輯表單資料
    title: "",
    content: "",
    category: "",
    progress: 0,
  });

  // 開始編輯
  const startEdit = (note) => {
    setEditingId(note._id);
    setEditForm({
      title: note.title,
      content: note.content,
      category: note.category,
      progress: note.progress,
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", content: "", category: "" });
  };

  // 儲存修改
  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:3000/notes/${id}`, editForm);
      setEditingId(null);
      setEditForm({ title: "", content: "", category: "" });
      fetchNotes(); // 重新取得資料
      console.log("修改成功");
    } catch (err) {
      console.error("修改失敗:", err);
      alert("修改失敗！");
    }
  };

  const handleNoteAdded = (newNote) => {
    fetchNotes();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error("刪除失敗", err);
    }
  };

  //圖表計算邏輯
  const calculateStats = (notes) => {
    const total = notes.length;
    const categoryMap = {};
    let progressSum = 0;

    const today = new Date().toDateString(); // "Tue Jul 30 2025"
    let todayCount = 0;

    notes.forEach((note) => {
      categoryMap[note.category] = (categoryMap[note.category] || 0) + 1;
      progressSum += Number(note.progress) || 0;

      const createdDate = new Date(note.createdAt).toDateString();
      if (createdDate === today) todayCount++;
    });

    const categoryStats = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
    }));

    const avgProgress = total > 0 ? Math.round(progressSum / total) : 0;

    return {
      total,
      todayCount,
      categoryStats,
      avgProgress,
    };
  };

  //更新進度條
  const handleUpdateProgress = async (id, newProgress) => {
    try {
      await axios.put(`http://localhost:3000/notes/${id}`, {
        progress: newProgress,
      });
      fetchNotes();
    } catch (err) {
      console.error("更新進度失敗", err);
    }
  };

  const uniqueCategories = Array.from(
    new Set(notes.map((note) => note.category))
  );

  return (
    <div className="min-h-screen w-screen bg-gray-50">
      <div className="text-gray-800 px-4 py-8 md:px-10 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">我的筆記列表</h1>
        {/**新增ai tips */}
        <AiTipCard tip={aiTip} />
        {/* 新增表單元件 */}
        <NoteForm onNoteAdded={handleNoteAdded} />
        {/**分類下拉選單 */}
        <div className="mb-4">
          <label className="mr-2 font-medium">分類篩選：</label>
          {selectedCategory !== "全部" && (
            <p className="text-sm text-gray-600 mb-2">
              目前篩選分類：
              <span className="font-semibold">{selectedCategory}</span>
            </p>
          )}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value="全部">全部</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {/*  統計圖表 */}
        <ChartBox data={calculateStats(notes)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes
            .filter((note) => {
              return (
                selectedCategory === "全部" ||
                note.category === selectedCategory
              );
            })
            .map((note) => (
              <div
                key={note._id}
                className="relative bg-white rounded-xl shadow p-5 space-y-3"
              >
                <button
                  onClick={() => handleDelete(note._id)}
                  className="absolute top-2 right-2 px-3 py-1 text-sm !text-red-600 !bg-red-100 rounded hover:!bg-red-200 border border-red-300 transition"
                >
                  刪除
                </button>
                {/**修改按鈕 */}
                <button
                  onClick={() => startEdit(note)}
                  className="absolute top-12 right-2 px-3 py-1 text-sm !text-blue-600 !bg-blue-100 rounded hover:!bg-blue-200 border border-blue-300 transition"
                >
                  修改
                </button>

                {/* 條件渲染：編輯模式 vs 顯示模式 */}
                {editingId === note._id ? (
                  // 編輯模式
                  <div className="space-y-3 pt-16">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        標題：
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        style={{ color: "black" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        內容：
                      </label>
                      <textarea
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm({ ...editForm, content: e.target.value })
                        }
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={3}
                        style={{ color: "black" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        分類：
                      </label>
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        style={{ color: "black" }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(note._id)}
                        className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
                      >
                        儲存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                      >
                        取消
                      </button>
                    </div>
                    {/**編輯模式的修改進度區域*/}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        進度：
                      </label>
                      <select
                        value={editForm.progress}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            progress: Number(e.target.value),
                          })
                        }
                        className="border px-2 py-1 rounded text-sm focus:outline-none"
                      >
                        {[0, 20, 40, 60, 80, 100].map((val) => (
                          <option key={val} value={val}>
                            {val}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  // 顯示模式
                  <>
                    <h2 className="text-lg font-semibold pt-16">
                      筆記名稱：{note.title}
                    </h2>
                    <p className="text-gray-700">筆記內容：{note.content}</p>
                    <span className="text-gray-500">分類：</span>
                    <span
                      onClick={() => setSelectedCategory(note.category)}
                      className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium cursor-pointer"
                    >
                      筆記分類：{note.category}
                    </span>
                  </>
                )}

                {/* 進度顯示 - 非編輯模式顯示但不可修改 */}
                {editingId !== note._id && (
                  <div className="text-sm flex items-center gap-2">
                    <span className="text-green-600">進度：</span>
                    <span className="bg-gray-100 border px-2 py-1 rounded text-sm text-gray-700">
                      {note.progress}%
                    </span>
                  </div>
                )}

                {/* AI 摘要按鈕 - 只在非編輯模式顯示 */}
                {editingId !== note._id && (
                  <>
                    <button
                      className="mt-2 px-3 py-1 text-sm !text-black !bg-gray-100 rounded hover:!bg-gray-200 transition border border-gray-300"
                      onClick={async () => {
                        console.log("點擊摘要按鈕，筆記ID:", note._id);
                        console.log("當前 showSummaries 狀態:", showSummaries);
                        console.log(
                          "這個筆記的摘要顯示狀態:",
                          showSummaries[note._id]
                        );

                        // 修正條件判斷
                        if (showSummaries[note._id] === true) {
                          console.log("隱藏摘要");
                          setShowSummaries((prev) => ({
                            ...prev,
                            [note._id]: false,
                          }));
                          return;
                        }

                        console.log("開始產生摘要");
                        try {
                          const res = await axios.post(
                            "http://localhost:3000/api/summarize",
                            {
                              content: note.content,
                            }
                          );

                          console.log("API 回應:", res.data);

                          // 存儲摘要內容
                          setSummaries((prev) => ({
                            ...prev,
                            [note._id]: res.data.summary,
                          }));

                          // 顯示這個筆記的摘要
                          setShowSummaries((prev) => ({
                            ...prev,
                            [note._id]: true,
                          }));

                          console.log("摘要設定完成");
                        } catch (err) {
                          console.error("摘要產生失敗:", err);
                          alert("產生摘要失敗！");
                        }
                      }}
                    >
                      {showSummaries[note._id] === true
                        ? "隱藏 AI 摘要"
                        : "產生 AI 摘要"}
                    </button>

                    {/* 顯示摘要 */}
                    {showSummaries[note._id] === true &&
                      summaries[note._id] && (
                        <p className="text-sm text-gray-600">
                          <strong className="text-purple-600">AI 摘要：</strong>
                          {summaries[note._id]}
                        </p>
                      )}
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default NotePage;

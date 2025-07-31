import { useEffect, useState } from "react";
import axios from "axios";
import NoteForm from "../components/NoteForm";
import ChartBox from "../components/ChartBox";
import AiTipCard from "../components/AiTipCard";

function NotePage() {
  const [notes, setNotes] = useState([]);
  /**AI筆記摘要 */
  const [summaries, setSummaries] = useState({});
  const [showSummaryId, setShowSummaryId] = useState(null);

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
    fetchNotes();
  }, []);

  useEffect(() => {
    //用axios抓ai tips資料
    axios
      .get("http://localhost:3000/ai-tips")
      .then((res) => setAiTip(res.data.tip))
      .catch((err) => console.error("AI 建議抓取失敗", err));
  }, []);

  const handleNoteAdded = (newNote) => {
    // setNotes((prev) => [...prev, newNote]);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notes/${id}`);
      // setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
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

      // // 前端同步更新狀態
      // setNotes((prevNotes) =>
      //   prevNotes.map((note) =>
      //     String(note.id) === String(id)
      //       ? { ...note, progress: newProgress }
      //       : note
      //   )
      // );
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
                key={note.id}
                className="relative bg-white rounded-xl shadow p-5 space-y-3"
              >
                <button
                  onClick={() => handleDelete(note.id)}
                  className="absolute top-2 right-2 px-3 py-1 text-sm !text-red-600 !bg-red-100 rounded hover:!bg-red-200 border border-red-300 transition"
                >
                  刪除
                </button>
                <h2 className="text-lg font-semibold">
                  筆記名稱：{note.title}
                </h2>
                <p className="text-gray-700">筆記內容：{note.content}</p>
                <span className="text-gray-500">分類：</span>
                <span
                  onClick={() => setSelectedCategory(note.category)}
                  className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium"
                >
                  筆記分類：{note.category}
                </span>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-green-600">進度：</span>
                  <select
                    value={note.progress}
                    onChange={(e) =>
                      handleUpdateProgress(note.id, Number(e.target.value))
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
                {/**摘要btn */}
                <button
                  onClick={async () => {
                    if (showSummaryId === note.id) {
                      setShowSummaryId(null); // 再點一次就關掉
                      return;
                    }

                    try {
                      const res = await axios.post(
                        "http://localhost:3000/api/summarize",
                        {
                          content: note.content,
                        }
                      );

                      setSummaries((prev) => ({
                        ...prev,
                        [note.id]: res.data.summary,
                      }));

                      setShowSummaryId(note.id); // 點完才顯示
                    } catch (err) {
                      alert("產生摘要失敗！");
                    }
                  }}
                  className="mt-2 px-3 py-1 text-sm !text-black !bg-gray-100 rounded hover:!bg-gray-200 transition border border-gray-300"
                >
                  {showSummaryId === note.id ? "隱藏 AI 摘要" : "產生 AI 摘要"}
                </button>
                {/* 顯示摘要 */}
                {showSummaryId === note.id && summaries[note.id] && (
                  <p className="text-sm text-gray-600">
                    <strong className="text-purple-600">AI 摘要：</strong>
                    {summaries[note.id]}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default NotePage;

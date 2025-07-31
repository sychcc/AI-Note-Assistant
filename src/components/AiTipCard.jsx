function AiTipCard({ tip }) {
  if (!tip) return null;

  return (
    <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-400 p-4 mb-4 rounded shadow">
      <h2 className="font-semibold mb-2">AI 模擬建議</h2>
      <p>{tip}</p>
    </div>
  );
}

export default AiTipCard;

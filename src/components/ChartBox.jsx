import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a0522d"];

function ChartBox({ data }) {
  if (data.total === 0) return null;

  return (
    <div className="bg-white p-4 shadow rounded mb-6">
      <h2 className="text-lg font-semibold mb-4">📊 筆記統計</h2>

      {/* 類別圓餅圖 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <h3 className="text-md font-semibold mb-2">分類分布</h3>
          <PieChart width={300} height={250}>
            <Pie
              data={data.categoryStats}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.categoryStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* 平均進度長條圖 */}
        <div>
          <h3 className="text-md font-semibold mb-2">平均進度</h3>
          <BarChart
            width={300}
            height={250}
            data={[{ name: "平均", progress: data.avgProgress }]}
          >
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Bar
              dataKey="progress"
              fill={data.avgProgress < 50 ? "#f87171" : "#4ade80"} // 紅或綠
            />
            <Tooltip />
          </BarChart>
          <div className="text-sm text-gray-600 mt-4">
            <p>
              總筆記數：<strong>{data.total}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartBox;

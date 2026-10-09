import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const HumanReviewIssuesChart = ({ data = [], height = 280, interactive = true }) => {
  const navigate = useNavigate();

  const handleBarClick = (entry) => {
    if (interactive && entry?.issue_type) {
      navigate(`/reviews?issue_type=${encodeURIComponent(entry.issue_type)}`);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700 min-w-[160px]">
          <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1">
            {item.issue_type}
          </p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Total Flagged:</span>
              <span className="font-bold text-white">{item.total_count}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Unresolved / Open:</span>
              <span className="font-bold text-red-400">{item.unresolved_count}</span>
            </p>
          </div>
          {interactive && (
            <p className="text-[10px] text-blue-400 mt-1.5 pt-1 border-t border-slate-800">
              Click bar to filter Review Center
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="issue_type"
            width={130}
            tick={{ fill: '#475569', fontSize: 11 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={30}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-700 mx-1">{value}</span>
            )}
          />
          <Bar
            dataKey="total_count"
            name="Total Items"
            fill="#94a3b8"
            radius={[0, 4, 4, 0]}
            onClick={handleBarClick}
            className={interactive ? 'cursor-pointer hover:opacity-85' : ''}
          />
          <Bar
            dataKey="unresolved_count"
            name="Unresolved (Open)"
            fill="#ef4444"
            radius={[0, 4, 4, 0]}
            onClick={handleBarClick}
            className={interactive ? 'cursor-pointer hover:opacity-85' : ''}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

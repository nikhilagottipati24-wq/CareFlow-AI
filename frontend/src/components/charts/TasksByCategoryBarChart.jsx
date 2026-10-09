import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CATEGORY_COLORS = {
  Medication: '#3b82f6', // blue
  Appointment: '#06b6d4', // cyan
  Test: '#8b5cf6', // purple
  Referral: '#ec4899', // pink
  Care: '#10b981', // emerald
  'Follow-up': '#f59e0b', // amber
};

export const TasksByCategoryBarChart = ({ data = [], height = 280, interactive = true }) => {
  const navigate = useNavigate();

  const handleBarClick = (entry) => {
    if (interactive && entry?.category) {
      navigate(`/tasks?category=${encodeURIComponent(entry.category)}`);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700">
          <p className="font-semibold text-slate-200">{item.category}</p>
          <p className="mt-1">
            <span className="text-slate-400">Total Tasks: </span>
            <span className="font-bold text-white">{item.count}</span>
          </p>
          {interactive && (
            <p className="text-[10px] text-blue-400 mt-1">Click to filter Tasks page</p>
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
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            className={interactive ? 'cursor-pointer hover:opacity-85' : ''}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cat-${index}`}
                fill={CATEGORY_COLORS[entry.category] || '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

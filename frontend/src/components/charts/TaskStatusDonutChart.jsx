import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const TaskStatusDonutChart = ({
  data,
  height = 260,
  innerRadius = 60,
  outerRadius = 90,
  showLegend = true,
  interactive = true,
}) => {
  const navigate = useNavigate();

  const segments = data?.segments || [
    { status: 'Pending', count: 0, percentage: 0, color: '#f59e0b' },
    { status: 'Completed', count: 0, percentage: 0, color: '#10b981' },
    { status: 'Needs Review', count: 0, percentage: 0, color: '#ef4444' },
  ];

  const total = data?.total ?? segments.reduce((sum, s) => sum + s.count, 0);

  const handleClick = (entry) => {
    if (interactive && entry?.status) {
      navigate(`/tasks?status=${encodeURIComponent(entry.status)}`);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700">
          <p className="font-semibold text-slate-200">{item.status}</p>
          <p className="mt-1">
            <span className="text-slate-400">Tasks: </span>
            <span className="font-bold text-white">{item.count}</span>
          </p>
          <p>
            <span className="text-slate-400">Share: </span>
            <span className="font-bold text-white">{item.percentage}%</span>
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
    <div className="relative w-full flex flex-col items-center justify-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={segments}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="count"
              onClick={handleClick}
              className={interactive ? 'cursor-pointer' : ''}
            >
              {segments.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span className="text-xs font-medium text-slate-700 mx-1">
                    {entry.payload.status} ({entry.payload.count})
                  </span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center Donut Total Label */}
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{
          top: showLegend ? 'calc(50% - 18px)' : '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <span className="text-2xl font-bold text-slate-900 leading-none">{total}</span>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
          Tasks
        </span>
      </div>
    </div>
  );
};

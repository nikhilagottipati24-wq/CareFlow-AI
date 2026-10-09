import React from 'react';
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
import { Layers } from 'lucide-react';

export const WeeklyProgressStackedChart = ({ data = [], height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300"
      >
        <Layers className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No weekly progress snapshots</p>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Weekly cohorts track completed and remaining tasks across discharge recovery intervals.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-lg border border-slate-700 space-y-1.5 min-w-[150px]">
          <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tip-${index}`} className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300">{entry.name}:</span>
              </span>
              <span className="font-bold text-white">{entry.value}</span>
            </p>
          ))}
          <p className="border-t border-slate-800 pt-1 flex justify-between font-bold text-slate-200">
            <span>Total:</span>
            <span>{total}</span>
          </p>
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
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="week"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
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
          <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
          <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" />
          <Bar
            dataKey="needs_review"
            name="Needs Review"
            stackId="a"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

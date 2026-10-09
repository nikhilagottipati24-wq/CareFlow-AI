import React, { useState, useEffect } from 'react';
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
import { CalendarClock, AlertTriangle, ArrowRight, CheckCircle2, Clock, CalendarDays, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UpcomingScheduleBarChart = ({ data, height = 260, onUpdateTaskStatus }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(null);

  const schedule = data?.schedule || [];
  const unscheduledCount = data?.unscheduled_count ?? 0;

  // Auto-select the first day that has scheduled tasks if none is currently selected
  useEffect(() => {
    if (schedule.length > 0) {
      if (!selectedDay) {
        const firstActiveDay = schedule.find((d) => d.count > 0);
        setSelectedDay(firstActiveDay || schedule[0]);
      } else {
        // Keep selected day updated if tasks changed
        const refreshedDay = schedule.find((d) => d.date === selectedDay.date);
        if (refreshedDay) setSelectedDay(refreshedDay);
      }
    }
  }, [schedule]);

  const handleSelectDay = (entry) => {
    if (!entry) return;
    const item = entry.payload || entry;
    setSelectedDay(item);
  };

  const handleJumpToNextActive = () => {
    if (!schedule.length) return;
    const currentIndex = schedule.findIndex((d) => d.date === selectedDay?.date);
    const nextActive = schedule.slice(currentIndex + 1).find((d) => d.count > 0) ||
                       schedule.find((d) => d.count > 0);
    if (nextActive) setSelectedDay(nextActive);
  };

  const activeDays = schedule.filter((d) => d.count > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700 min-w-[140px]">
          <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1">
            {item.display_date || item.date}
          </p>
          <p className="text-slate-300">
            <span className="font-bold text-blue-400">{item.count}</span> scheduled task
            {item.count === 1 ? '' : 's'}
          </p>
          {item.count > 0 ? (
            <p className="text-[10px] text-emerald-400 mt-1">Click to inspect tasks</p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-1">No tasks scheduled</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col space-y-3 w-full min-w-0">
      {/* Top Banner for Unscheduled Items */}
      {unscheduledCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>{unscheduledCount}</strong> unscheduled item pending clinical date.
            </span>
          </div>
          <button
            onClick={() => navigate('/timeline')}
            className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-[11px] cursor-pointer"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Bar Chart Container */}
      <div style={{ width: '100%', height }} className="relative min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={schedule}
            margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                handleSelectDay(state.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="display_date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              minPointSize={5}
              radius={[4, 4, 0, 0]}
              onClick={(entry) => handleSelectDay(entry)}
              className="cursor-pointer"
            >
              {schedule.map((entry, index) => {
                const isSelected = selectedDay && selectedDay.date === entry.date;
                const hasTasks = entry.count > 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isSelected ? '#1d4ed8' : hasTasks ? '#3b82f6' : '#e2e8f0'}
                    stroke={isSelected ? '#1e3a8a' : 'transparent'}
                    strokeWidth={isSelected ? 2 : 0}
                    className="cursor-pointer transition-colors hover:fill-blue-700"
                    onClick={() => handleSelectDay(entry)}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Interactive Date Chips */}
      {schedule.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-slate-400" />
            <span>Select Date:</span>
          </span>
          {schedule.map((entry) => {
            const isSelected = selectedDay && selectedDay.date === entry.date;
            const hasTasks = entry.count > 0;
            return (
              <button
                key={`pill-${entry.date}`}
                type="button"
                onClick={() => handleSelectDay(entry)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : hasTasks
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
                title={`${entry.display_date}: ${entry.count} task(s)`}
              >
                <span>{entry.display_date}</span>
                {hasTasks && (
                  <span
                    className={`px-1 rounded-full text-[9px] font-bold ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {entry.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Day Inspector & Scheduled Tasks Detail Box */}
      {selectedDay && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <CalendarClock className="w-4 h-4 text-blue-600" />
              <span>
                Follow-ups for <strong>{selectedDay.display_date}</strong>: {selectedDay.count} item
                {selectedDay.count === 1 ? '' : 's'}
              </span>
            </span>
            <span className="text-[10px] text-slate-400">Click any bar or date chip to switch</span>
          </div>

          {selectedDay.items && selectedDay.items.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {selectedDay.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 text-xs leading-snug">{item.title}</p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        item.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {item.status === 'Completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{item.status}</span>
                    </span>

                    {onUpdateTaskStatus && item.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => onUpdateTaskStatus(item.id, 'Completed')}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Done</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-white rounded-lg border border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-slate-500 italic text-xs">
                No tasks scheduled for {selectedDay.display_date}.
              </p>
              {activeDays.length > 0 && (
                <button
                  type="button"
                  onClick={handleJumpToNextActive}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Jump to next active date</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

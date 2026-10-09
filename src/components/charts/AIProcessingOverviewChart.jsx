import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Upload, Clock, ArrowRight } from 'lucide-react';

export const AIProcessingOverviewChart = ({ data }) => {
  const navigate = useNavigate();

  const stages = data?.stages || [];
  const latestTimestamp = data?.latest_timestamp;

  if (!stages || stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <Cpu className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No AI Processing Activity</p>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
          Upload a discharge summary document to trigger the 6-agent extraction and validation pipeline.
        </p>
        <button
          onClick={() => navigate('/discharge')}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-2xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Synthetic Summary</span>
        </button>
      </div>
    );
  }

  // Calculate max count for proportional width visualization
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  const STAGE_COLORS = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-amber-500',
  ];

  return (
    <div className="space-y-4">
      {/* Latest Processing Banner */}
      {latestTimestamp && (
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Last Agent Run:
          </span>
          <span className="font-mono text-slate-700">
            {new Date(latestTimestamp).toLocaleString()}
          </span>
        </div>
      )}

      {/* Progress Bars by Workflow Stage */}
      <div className="space-y-3">
        {stages.map((st, idx) => {
          const percentage = Math.max(12, Math.round((st.count / maxCount) * 100));
          return (
            <div key={st.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                    {st.step || idx + 1}
                  </span>
                  {st.stage}
                </span>
                <span className="font-bold text-slate-900 font-mono text-xs">
                  {st.count} {st.count === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    STAGE_COLORS[idx % STAGE_COLORS.length]
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer navigation */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => navigate('/activity')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>View Auditable AI Event Log</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

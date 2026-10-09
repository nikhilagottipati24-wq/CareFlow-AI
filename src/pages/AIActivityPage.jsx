import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { CareFlowAPI } from '../services/api';
import { useCareFlow } from '../context/CareFlowContext';

export const AIActivityPage = () => {
  const { summary } = useCareFlow();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => {
    setLoading(true);
    CareFlowAPI.getActivityLogs()
      .then((res) => {
        if (res?.data) setLogs(res.data.logs || []);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [summary]);

  const getEventBadge = (eventType) => {
    switch (eventType) {
      case 'Document uploaded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Document processed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Instructions extracted':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Validation completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Tasks generated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Item flagged for human review':
      case 'Item sent for human review':
      case 'Ambiguous instruction detected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Review action completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Activity & Audit Log
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Immutable, audit-ready event trail tracking all agent extractions, validations, and status alterations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Audit Log</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Recorded Events: <strong>{logs.length}</strong></span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Audit Logging Active
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No events in log.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getEventBadge(
                        log.event_type
                      )}`}
                    >
                      {log.event_type}
                    </span>
                    <span className="text-slate-500 font-medium">by</span>
                    <span className="font-semibold text-slate-800">{log.agent}</span>
                  </div>

                  <p className="text-slate-800 font-medium text-xs mt-1">
                    {log.description}
                  </p>

                  {log.reference && (
                    <span className="inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Ref: {log.reference}
                    </span>
                  )}
                </div>

                <div className="shrink-0 text-[11px] font-mono text-slate-400 sm:text-right">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

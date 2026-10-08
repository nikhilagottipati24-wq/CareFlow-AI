import React, { useEffect, useState } from 'react';
import { Activity, Clock, ShieldCheck, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';
import { getAuditLogs } from '../api';

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header (Section 17) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Agent Orchestration Audit
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              Full Explainability
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Agent Activity Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit-style trail of every action taken by the multi-agent orchestration pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <Terminal className="w-4 h-4 text-slate-500" />
          <span>{logs.length} Total Pipeline Events</span>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Timestamp & Agent</span>
          <span>Action & Clinical Detail</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit trail...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log, idx) => {
              const isEscalation = log.action.toLowerCase().includes('escalat') || log.action.toLowerCase().includes('ambiguous');

              return (
                <div
                  key={log.id || idx}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors ${
                    isEscalation ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 sm:w-1/3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </div>

                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {log.agent_name}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Autonomous Subagent
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900">
                        {log.action}
                      </p>
                      {isEscalation && (
                        <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                          Escalated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {log.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

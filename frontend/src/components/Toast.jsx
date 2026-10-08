import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const Toast = () => {
  const { toast } = useCareFlow();

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs animate-in slide-in-from-bottom-3 duration-200">
      {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
      {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
      <span className="font-medium">{toast.message}</span>
    </div>
  );
};

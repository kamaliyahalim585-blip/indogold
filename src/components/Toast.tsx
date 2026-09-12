import React from 'react';
import { useGold } from '../context/GoldContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useGold();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-400 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-500/30 bg-[#0d1f18]',
    error: 'border-rose-500/30 bg-[#241113]',
    info: 'border-amber-500/30 bg-[#211a0c]'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
      <div
        className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md ${borderColors[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1 text-xs sm:text-sm font-medium text-slate-100 leading-snug">
          {toast.message}
        </div>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white transition-colors p-0.5"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

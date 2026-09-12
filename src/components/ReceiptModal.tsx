import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface ReceiptModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ imageUrl, title = 'Bukti Pembayaran / Transfer', onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#131722] border border-[#2c3244] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-3.5 border-b border-[#252a38]">
          <h4 className="text-sm font-bold text-white truncate pr-2">{title}</h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 max-h-[75vh] overflow-auto flex items-center justify-center bg-[#0a0c10]">
          <img
            src={imageUrl}
            alt="Bukti Transfer"
            className="max-h-[65vh] w-auto object-contain rounded-lg border border-[#202534] shadow-md"
          />
        </div>

        <div className="p-3 border-t border-[#252a38] flex items-center justify-between text-xs text-slate-400">
          <span>Verifikasi Admin IndoGold</span>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#ffd700] hover:underline font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Ukuran Penuh
          </a>
        </div>
      </div>
    </div>
  );
};

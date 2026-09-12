import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { Transaction, TransactionType } from '../types/gold';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import {
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Image as ImageIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  CreditCard,
  Gift,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const RiwayatPage: React.FC = () => {
  const { userTransactions } = useGold();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; title: string } | null>(null);

  const filterTabs = [
    { id: 'all', label: 'Semua' },
    { id: 'beli', label: 'Beli' },
    { id: 'jual', label: 'Jual' },
    { id: 'deposit', label: 'Deposit' },
    { id: 'tarik', label: 'Tarik' },
    { id: 'bonus', label: 'Bonus / Untung' }
  ];

  const filtered = userTransactions.filter((t) => {
    // Type filter
    if (filterType === 'bonus') {
      if (t.jenis !== 'bonus' && t.jenis !== 'untung') return false;
    } else if (filterType !== 'all') {
      if (t.jenis !== filterType) return false;
    }

    // Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = t.teks.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      if (!matchText && !matchId) return false;
    }

    return true;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Disetujui
          </span>
        );
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
    }
  };

  const getTypeIcon = (jenis: TransactionType) => {
    switch (jenis) {
      case 'beli':
        return <Coins className="w-4 h-4 text-[#ffd700]" />;
      case 'jual':
        return <ArrowUpFromLine className="w-4 h-4 text-cyan-400" />;
      case 'deposit':
        return <ArrowDownToLine className="w-4 h-4 text-emerald-400" />;
      case 'tarik':
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      case 'untung':
      case 'bonus':
        return <Gift className="w-4 h-4 text-amber-400" />;
    }
  };

  const getBorderColor = (jenis: TransactionType) => {
    switch (jenis) {
      case 'beli':
        return 'border-l-[#ffd700]';
      case 'jual':
        return 'border-l-cyan-400';
      case 'deposit':
        return 'border-l-emerald-400';
      case 'tarik':
        return 'border-l-rose-400';
      case 'untung':
      case 'bonus':
        return 'border-l-amber-400';
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-[#ffd700]" />
          Riwayat Semua Transaksi
        </h2>
        <p className="text-xs text-slate-400">Pencatatan real-time jual, beli, deposit, dan dividen harian</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
              filterType === tab.id
                ? 'bg-[#ffd700] text-black border-[#ffd700] font-bold shadow-md'
                : 'bg-[#13161f] text-slate-400 border-[#232733] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi atau ID TRX..."
          className="w-full bg-[#13161f] border border-[#232733] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700]"
        />
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[#13161f] border border-[#232733] p-6">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">Tidak ada data transaksi</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Semua transaksi dan riwayat mutasi akan tercatat otomatis di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-2xl bg-[#13161f] border border-[#232733] border-l-4 ${getBorderColor(
                t.jenis
              )} hover:border-[#333b4e] transition-all shadow-md`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#1a1e2a]">{getTypeIcon(t.jenis)}</div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">{t.id}</span>
                    <div className="text-xs font-bold text-white leading-tight mt-0.5">{t.teks}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-white">{formatRupiah(t.jumlah)}</div>
                  <div className="mt-1">{getStatusBadge(t.status)}</div>
                </div>
              </div>

              {/* Timestamp and Receipt link */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1f2432] text-[11px] text-slate-400">
                <span>{formatDateTime(t.waktu)}</span>

                {t.buktiFoto && (
                  <button
                    onClick={() => setSelectedReceipt({ url: t.buktiFoto!, title: t.teks })}
                    className="flex items-center gap-1 text-[#ffd700] hover:underline font-semibold"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Lihat Bukti Struk</span>
                  </button>
                )}

                {t.detail?.alasanPenolakan && (
                  <span className="text-rose-400 text-[10px]">
                    Alasan: {t.detail.alasanPenolakan}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          imageUrl={selectedReceipt.url}
          title={selectedReceipt.title}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

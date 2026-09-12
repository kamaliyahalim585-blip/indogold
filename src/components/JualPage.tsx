import React, { useState, useEffect } from 'react';
import { useGold } from '../context/GoldContext';
import { GoldBrandId } from '../types/gold';
import { formatRupiah, formatGrams } from '../utils/formatters';
import { ArrowUpFromLine, Coins, AlertCircle, ArrowRight, Check, Sparkles } from 'lucide-react';
import { TabType } from './BottomNav';

interface JualPageProps {
  onNavigate: (tab: TabType) => void;
  onSuccess: () => void;
}

export const JualPage: React.FC<JualPageProps> = ({ onNavigate, onSuccess }) => {
  const { currentUser, hargaDasar, sellGold, getBrandInfo } = useGold();
  const ownedGold = currentUser?.emas || [];

  const [selectedBrandId, setSelectedBrandId] = useState<GoldBrandId>(
    ownedGold.length > 0 ? ownedGold[0].jenis : 'ANTAM'
  );
  const [gramInput, setGramInput] = useState<string>('0.5');
  const [isConfirming, setIsConfirming] = useState(false);

  // Sync selectedBrandId if ownedGold changes
  useEffect(() => {
    if (ownedGold.length > 0 && !ownedGold.some((e) => e.jenis === selectedBrandId)) {
      setSelectedBrandId(ownedGold[0].jenis);
    }
  }, [ownedGold, selectedBrandId]);

  const selectedHolding = ownedGold.find((e) => e.jenis === selectedBrandId);
  const maxAvailableGram = selectedHolding ? selectedHolding.gram : 0;
  const brandInfo = getBrandInfo(selectedBrandId);

  // Buyback price calculation (Base Price - buyback margin)
  const unitBuybackPrice = hargaDasar - brandInfo.marjinalJual;
  const gramValue = parseFloat(gramInput) || 0;
  const totalPayout = Math.round(unitBuybackPrice * gramValue);

  const isValid = gramValue > 0 && gramValue <= maxAvailableGram;

  const handleSetPercent = (pct: number) => {
    if (maxAvailableGram <= 0) return;
    const computed = Math.floor((maxAvailableGram * pct) * 100) / 100;
    setGramInput(computed.toString());
  };

  const handleExecuteSell = async () => {
    if (!isValid) return;
    const res = await sellGold(selectedBrandId, gramValue);
    if (res.success) {
      setIsConfirming(false);
      onSuccess();
    }
  };

  if (ownedGold.length === 0) {
    return (
      <div className="space-y-4 pb-8 text-center py-10">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#ffd700] flex items-center justify-center mx-auto mb-3">
          <Coins className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Belum Ada Emas untuk Dijual</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Anda saat ini belum memiliki portofolio emas fisik. Silakan beli emas terlebih dahulu untuk dapat menjual kembali dengan harga buyback resmi.
        </p>
        <button
          onClick={() => onNavigate('beli')}
          className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs hover:opacity-90 shadow-lg shadow-amber-500/20"
        >
          Mulai Beli Emas Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Title & Available */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
            Jual Emas (Buyback Cepat)
          </h2>
          <p className="text-xs text-slate-400">Dana langsung cair ke saldo kas IndoGold Anda</p>
        </div>
      </div>

      {/* Select Owned Gold */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Pilih Emas yang Akan Dijual
        </label>
        <div className="space-y-2">
          {ownedGold.map((item) => {
            const info = getBrandInfo(item.jenis);
            const isSelected = item.jenis === selectedBrandId;
            const bBack = hargaDasar - info.marjinalJual;
            return (
              <button
                key={item.jenis}
                onClick={() => {
                  setSelectedBrandId(item.jenis);
                  if (parseFloat(gramInput) > item.gram) {
                    setGramInput(item.gram.toString());
                  }
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-[#211a12] border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-[#0e1118] border-[#202534] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{info.flag}</span>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">{info.nama}</div>
                    <div className="text-[11px] text-slate-400">
                      Tersedia: <b className="text-white">{formatGrams(item.gram)} gr</b>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">
                    Buyback {formatRupiah(bBack)}/gr
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Nilai ~{formatRupiah(item.gram * bBack)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gram Input & Payout Calculation */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Jumlah Gram yang Dijual
          </label>
          <span className="text-xs text-slate-400">
            Tersedia: <b className="text-[#ffd700]">{formatGrams(maxAvailableGram)} gr</b>
          </span>
        </div>

        {/* Numeric Input */}
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={maxAvailableGram}
            value={gramInput}
            onChange={(e) => setGramInput(e.target.value)}
            placeholder="0.5"
            className="w-full bg-[#0e1118] border border-[#2b3142] focus:border-amber-400 text-center text-xl font-bold text-white rounded-xl py-2 px-3 outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            Gram
          </span>
        </div>

        {/* Quick Percent Buttons */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[0.25, 0.5, 0.75, 1].map((p) => {
            const label = p === 1 ? '100% (Semua)' : `${p * 100}%`;
            return (
              <button
                key={p}
                onClick={() => handleSetPercent(p)}
                className="py-1.5 rounded-lg text-xs font-semibold bg-[#161a24] hover:bg-[#1f2533] border border-[#262c3b] text-slate-300"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-3 border-t border-[#232733] space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Harga Buyback per Gram</span>
            <span className="text-slate-200 font-medium">{formatRupiah(unitBuybackPrice)}/gr</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Gram yang Dicairkan</span>
            <span className="text-slate-200 font-medium">{formatGrams(gramValue)} gr</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Pajak & Biaya Admin</span>
            <span className="text-emerald-400 font-bold">Rp 0 (Bebas Biaya)</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-[#232733]">
            <span className="font-bold text-white text-sm">Uang Diterima di Saldo</span>
            <span className="text-xl font-black text-emerald-400">{formatRupiah(totalPayout)}</span>
          </div>
        </div>

        {/* Validation error */}
        {gramValue > maxAvailableGram && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Melebihi kepemilikan emas Anda ({formatGrams(maxAvailableGram)} gr)</span>
          </div>
        )}
      </div>

      {/* Sell Action Button */}
      <div>
        {!isConfirming ? (
          <button
            onClick={() => setIsConfirming(true)}
            disabled={!isValid}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isValid
                ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white hover:opacity-95 active:scale-98 shadow-amber-600/20'
                : 'bg-[#1b202c] text-slate-500 border border-[#2b3142] cursor-not-allowed'
            }`}
          >
            <span>Jual Sekarang — Dapatkan {formatRupiah(totalPayout)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-[#1b1e2a] border border-amber-500/50 space-y-3 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-300">Konfirmasi Penjualan Emas</p>
              <p className="text-sm font-bold text-white mt-0.5">
                Jual {formatGrams(gramValue)} gr {brandInfo.nama}
              </p>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                Uang masuk ke saldo: {formatRupiah(totalPayout)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsConfirming(false)}
                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteSell}
                className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs hover:opacity-90 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Ya, Jual Emas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

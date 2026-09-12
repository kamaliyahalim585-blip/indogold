import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { DAFTAR_EMAS } from '../data/mockData';
import { GoldBrandId } from '../types/gold';
import { formatRupiah, formatGrams } from '../utils/formatters';
import { Coins, ShieldCheck, Wallet, Plus, Minus, AlertCircle, ArrowRight, Check } from 'lucide-react';

interface BeliPageProps {
  onOpenDeposit: () => void;
  onSuccess: () => void;
}

export const BeliPage: React.FC<BeliPageProps> = ({ onOpenDeposit, onSuccess }) => {
  const { currentUser, hargaDasar, buyGold } = useGold();
  const [selectedBrandId, setSelectedBrandId] = useState<GoldBrandId>('ANTAM');
  const [gramInput, setGramInput] = useState<string>('1');
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedProduct = DAFTAR_EMAS.find((p) => p.id === selectedBrandId) || DAFTAR_EMAS[0];
  const unitPrice = hargaDasar + selectedProduct.marjinalBeli;
  const gramValue = parseFloat(gramInput) || 0;
  const totalCost = Math.round(unitPrice * gramValue);
  const currentSaldo = currentUser?.saldo || 0;
  const isSufficient = currentSaldo >= totalCost && totalCost > 0;

  const quickGrams = [0.25, 0.5, 1, 2, 5, 10];

  const handleSetMax = () => {
    if (currentSaldo <= 0 || unitPrice <= 0) return;
    const maxGrams = Math.floor((currentSaldo / unitPrice) * 100) / 100;
    setGramInput(maxGrams > 0 ? maxGrams.toString() : '0.1');
  };

  const handleAdjustGram = (delta: number) => {
    const current = parseFloat(gramInput) || 0;
    const next = Math.max(0.01, Math.round((current + delta) * 100) / 100);
    setGramInput(next.toString());
  };

  const handleExecuteBuy = async () => {
    if (!isSufficient) return;
    const res = await buyGold(selectedBrandId, gramValue);
    if (res.success) {
      setIsConfirming(false);
      onSuccess();
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Title & Balance Card */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#ffd700]" />
            Beli Emas Fisik Digital
          </h2>
          <p className="text-xs text-slate-400">Pilih merk emas favorit dan tentukan gramatur</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-medium">Saldo Anda</span>
          <div className="text-xs sm:text-sm font-bold text-emerald-400">
            {formatRupiah(currentSaldo)}
          </div>
        </div>
      </div>

      {/* Brand Selection Card */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg">
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Pilih Produsen Emas
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DAFTAR_EMAS.map((brand) => {
            const isSelected = brand.id === selectedBrandId;
            const bPrice = hargaDasar + brand.marjinalBeli;
            return (
              <button
                key={brand.id}
                onClick={() => setSelectedBrandId(brand.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#221c0e] border-[#ffd700] text-white shadow-md ring-1 ring-[#ffd700]/50'
                    : 'bg-[#0e1118] border-[#202534] text-slate-300 hover:border-[#2f374c]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{brand.flag}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#ffd700] text-black flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white mt-1 line-clamp-1">{brand.nama}</div>
                  <div className="text-[10px] text-slate-400 truncate">{brand.sertifikasi}</div>
                </div>
                <div className="mt-2 pt-1 border-t border-[#232938]">
                  <div className="text-[11px] font-bold text-[#ffd700]">
                    {formatRupiah(bPrice)}/gr
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Brand Details */}
        <div className="mt-3 p-3 rounded-xl bg-[#0e1118] border border-[#202534] flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#ffd700] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">{selectedProduct.nama}</span>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              {selectedProduct.deskripsi} ({selectedProduct.kemurnian})
            </p>
          </div>
        </div>
      </div>

      {/* Amount & Calculator Card */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Jumlah Gram Emas
          </label>
          <button
            onClick={handleSetMax}
            className="text-[11px] font-bold text-[#ffd700] hover:underline"
          >
            Gunakan Maksimal Saldo
          </button>
        </div>

        {/* Gram Input with +/- controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAdjustGram(-0.5)}
            className="w-11 h-11 rounded-xl bg-[#1b202c] hover:bg-[#252b3b] border border-[#2e3444] text-white flex items-center justify-center font-bold"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={gramInput}
              onChange={(e) => setGramInput(e.target.value)}
              placeholder="1.0"
              className="w-full bg-[#0e1118] border border-[#2b3142] focus:border-[#ffd700] text-center text-xl font-bold text-white rounded-xl py-2 px-3 outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              Gram
            </span>
          </div>

          <button
            onClick={() => handleAdjustGram(0.5)}
            className="w-11 h-11 rounded-xl bg-[#1b202c] hover:bg-[#252b3b] border border-[#2e3444] text-white flex items-center justify-center font-bold"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Gram Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickGrams.map((g) => (
            <button
              key={g}
              onClick={() => setGramInput(g.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                gramValue === g
                  ? 'bg-[#ffd700] text-black border-[#ffd700] font-bold'
                  : 'bg-[#141822] text-slate-300 border-[#252b3a] hover:border-slate-500'
              }`}
            >
              +{g} gr
            </button>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-3 border-t border-[#232733] space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Harga Satuan ({selectedProduct.id})</span>
            <span className="text-slate-200 font-medium">{formatRupiah(unitPrice)}/gr</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Berat Emas Dibeli</span>
            <span className="text-slate-200 font-medium">{formatGrams(gramValue)} gram</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Biaya Cetak & Asuransi</span>
            <span className="text-emerald-400 font-bold">GRATIS</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-[#232733]">
            <span className="font-bold text-white text-sm">Total Pembayaran</span>
            <span className="text-xl font-black text-[#ffd700]">{formatRupiah(totalCost)}</span>
          </div>
        </div>

        {/* Insufficient balance notice */}
        {!isSufficient && totalCost > 0 && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Saldo kurang {formatRupiah(totalCost - currentSaldo)}</span>
            </div>
            <button
              onClick={onOpenDeposit}
              className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-[11px] hover:bg-rose-600"
            >
              Deposit Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Action Submit */}
      <div>
        {!isConfirming ? (
          <button
            onClick={() => setIsConfirming(true)}
            disabled={!isSufficient}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isSufficient
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:opacity-95 active:scale-98 shadow-amber-500/20'
                : 'bg-[#1b202c] text-slate-500 border border-[#2b3142] cursor-not-allowed'
            }`}
          >
            <span>Beli Sekarang — {formatRupiah(totalCost)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-[#1b1e2a] border border-[#ffd700]/50 space-y-3 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-300">Konfirmasi Pembelian Emas</p>
              <p className="text-sm font-bold text-white mt-0.5">
                Beli {formatGrams(gramValue)} gr {selectedProduct.nama}
              </p>
              <p className="text-xs text-[#ffd700] font-bold mt-1">Total: {formatRupiah(totalCost)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsConfirming(false)}
                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteBuy}
                className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs hover:opacity-90 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Ya, Konfirmasi Beli
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

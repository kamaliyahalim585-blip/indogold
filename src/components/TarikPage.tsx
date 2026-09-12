import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { formatRupiah } from '../utils/formatters';
import { CreditCard, AlertCircle, ArrowUpRight, Check, Clock, ShieldCheck } from 'lucide-react';

interface TarikPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

const BANK_WALLET_LIST = [
  'Bank Central Asia (BCA)',
  'Bank Mandiri',
  'Bank Rakyat Indonesia (BRI)',
  'Bank Negara Indonesia (BNI)',
  'Bank Syariah Indonesia (BSI)',
  'Bank CIMB Niaga',
  'Bank Permata',
  'Bank Jago / Seabank',
  'DANA E-Wallet',
  'OVO Premier',
  'GoPay Indonesia',
  'ShopeePay'
];

export const TarikPage: React.FC<TarikPageProps> = ({ onSuccess, onBack }) => {
  const { currentUser, submitWithdraw } = useGold();

  const currentSaldo = currentUser?.saldo || 0;
  const [jumlah, setJumlah] = useState<string>('100000');
  const [metode, setMetode] = useState<string>(BANK_WALLET_LIST[0]);
  const [namaTujuan, setNamaTujuan] = useState<string>(currentUser?.nama || '');
  const [nomorTujuan, setNomorTujuan] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);

  const nominalNum = parseFloat(jumlah) || 0;
  const isBalanceValid = nominalNum >= 10000 && nominalNum <= currentSaldo;

  const quickNominals = [50000, 100000, 250000, 500000, 1000000];

  const handleSetMax = () => {
    setJumlah(currentSaldo.toString());
  };

  const handleExecuteWithdraw = async () => {
    if (!isBalanceValid || !metode || !namaTujuan.trim() || !nomorTujuan.trim()) {
      alert('Lengkapi seluruh data penarikan dengan benar');
      return;
    }

    const res = await submitWithdraw({
      jumlah: nominalNum,
      metode,
      namaTujuan,
      nomorTujuan
    });

    if (res.success) {
      setIsConfirming(false);
      onSuccess();
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-400" />
            Tarik Saldo Kas
          </h2>
          <p className="text-xs text-slate-400">Pencairan saldo ke rekening bank atau e-wallet Anda</p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
        >
          Kembali
        </button>
      </div>

      {/* Saldo Information */}
      <div className="bg-gradient-to-r from-[#1e1518] to-[#14161f] border border-rose-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium">Saldo Kas Tersedia</span>
          <div className="text-2xl font-black text-white mt-0.5">{formatRupiah(currentSaldo)}</div>
        </div>
        <button
          onClick={handleSetMax}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
        >
          Tarik Semua
        </button>
      </div>

      {/* Nominal */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Nominal Penarikan (Rp)
        </label>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-rose-400">
            Rp
          </span>
          <input
            type="number"
            min="10000"
            max={currentSaldo}
            step="1000"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="Minimal 10000"
            className="w-full bg-[#0e1118] border border-[#2b3142] focus:border-rose-400 text-lg font-bold text-white rounded-xl py-2.5 pl-10 pr-3 outline-none"
            required
          />
        </div>

        {/* Quick Pills */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {quickNominals.map((nom) => (
            <button
              key={nom}
              type="button"
              onClick={() => setJumlah(nom.toString())}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                nominalNum === nom
                  ? 'bg-rose-500 text-white border-rose-400 font-bold'
                  : 'bg-[#141822] text-slate-300 border-[#252b3a] hover:border-slate-500'
              }`}
            >
              {formatRupiah(nom)}
            </button>
          ))}
        </div>

        {nominalNum > currentSaldo && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Nominal melebihi saldo kas Anda ({formatRupiah(currentSaldo)})</span>
          </div>
        )}
      </div>

      {/* Destination Account */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Rekening / E-Wallet Penerima
        </label>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Bank / E-Wallet Tujuan</label>
          <select
            value={metode}
            onChange={(e) => setMetode(e.target.value)}
            className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-rose-400"
          >
            {BANK_WALLET_LIST.map((b) => (
              <option key={b} value={b} className="bg-[#13161f] text-white">
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Pemilik Rekening</label>
          <input
            type="text"
            value={namaTujuan}
            onChange={(e) => setNamaTujuan(e.target.value)}
            placeholder="Sesuai nama di buku tabungan atau akun e-wallet"
            className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-rose-400"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nomor Rekening / Nomor HP</label>
          <input
            type="text"
            value={nomorTujuan}
            onChange={(e) => setNomorTujuan(e.target.value)}
            placeholder="Contoh: 541098231 atau 08123456789"
            className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-rose-400"
            required
          />
        </div>

        {/* Withdrawal Info */}
        <div className="pt-2 border-t border-[#232733] text-xs space-y-1 text-slate-400">
          <div className="flex justify-between">
            <span>Biaya Transfer Antar Bank</span>
            <span className="text-emerald-400 font-bold">Rp 0 (Gratis)</span>
          </div>
          <div className="flex justify-between">
            <span>Estimasi Dana Tiba</span>
            <span className="text-slate-200 font-semibold">1 – 15 Menit</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div>
        {!isConfirming ? (
          <button
            onClick={() => setIsConfirming(true)}
            disabled={!isBalanceValid || !namaTujuan || !nomorTujuan}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isBalanceValid && namaTujuan && nomorTujuan
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:opacity-95 active:scale-98 shadow-rose-500/20'
                : 'bg-[#1b202c] text-slate-500 border border-[#2b3142] cursor-not-allowed'
            }`}
          >
            <span>Ajukan Penarikan — {formatRupiah(nominalNum)}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-[#1e171a] border border-rose-500/50 space-y-3 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-300">Konfirmasi Pengajuan Penarikan</p>
              <p className="text-base font-black text-rose-400 mt-0.5">{formatRupiah(nominalNum)}</p>
              <p className="text-xs text-slate-300 mt-1">
                Tujuan: <b>{metode}</b> — {nomorTujuan} (A.n {namaTujuan})
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
                onClick={handleExecuteWithdraw}
                className="py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs hover:opacity-90 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Ya, Tarik Saldo
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Pencairan dana dikonfirmasi admin segera ke rekening tujuan Anda</span>
      </p>
    </div>
  );
};

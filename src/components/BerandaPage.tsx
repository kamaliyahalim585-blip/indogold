import React from 'react';
import { useGold } from '../context/GoldContext';
import { formatRupiah, formatGrams } from '../utils/formatters';
import { GoldPriceChart } from './GoldPriceChart';
import {
  Wallet,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Building2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Gift
} from 'lucide-react';
import { TabType } from './BottomNav';

interface BerandaPageProps {
  onNavigate: (tab: TabType) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const BerandaPage: React.FC<BerandaPageProps> = ({
  onNavigate,
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const {
    currentUser,
    hargaDasar,
    hitungTotalNilaiEmas,
    hitungTotalGramEmas,
    getBrandInfo,
    claimDailyProfit,
    canClaimProfit
  } = useGold();

  const totalNilaiEmas = hitungTotalNilaiEmas(currentUser);
  const totalGram = hitungTotalGramEmas(currentUser);
  const totalAset = (currentUser?.saldo || 0) + totalNilaiEmas;
  const estimasiDividen = Math.floor(totalAset * 0.03);

  const buybackEstimasi = hargaDasar - 12000;

  return (
    <div className="space-y-4 pb-6">
      {/* Greetings & VIP Status */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium">Selamat datang,</span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
            {currentUser?.nama || 'Nasabah IndoGold'}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/40">
              MEMBER VIP
            </span>
          </h2>
        </div>

        {/* Daily Profit Claim Button */}
        <button
          onClick={claimDailyProfit}
          disabled={!canClaimProfit}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
            canClaimProfit
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-300 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95'
              : 'bg-slate-800/80 text-slate-400 border-slate-700/60 cursor-not-allowed'
          }`}
          title={canClaimProfit ? 'Klaim dividen hari ini' : 'Dividen hari ini sudah diklaim'}
        >
          <Gift className={`w-4 h-4 ${canClaimProfit ? 'animate-bounce text-black' : ''}`} />
          <span>{canClaimProfit ? 'Klaim 3% Hari Ini' : '3% Terklaim'}</span>
        </button>
      </div>

      {/* Main Luxury Portfolio Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1911] via-[#16171d] to-[#0c0d12] border border-[#ffd700]/30 p-5 shadow-2xl">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#ffd700]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#b8860b]/10 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#ffd700]">
              Total Portofolio Aset
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30">
              Emas & Kas
            </span>
          </div>

          <div className="mt-1.5 mb-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatRupiah(totalAset)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-amber-300/90 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>Bagi hasil dividen harian: ~{formatRupiah(estimasiDividen)}/hari (3%)</span>
            </div>
          </div>

          {/* Sub-breakdown */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#ffd700]/20 text-xs">
            <div className="bg-[#11141c]/70 rounded-xl p-2.5 border border-[#232938]">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saldo Kas</span>
              </div>
              <div className="font-bold text-white text-sm mt-0.5">
                {formatRupiah(currentUser?.saldo || 0)}
              </div>
            </div>

            <div className="bg-[#11141c]/70 rounded-xl p-2.5 border border-[#232938]">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                <Coins className="w-3.5 h-3.5 text-[#ffd700]" />
                <span>Emas Dimiliki</span>
              </div>
              <div className="font-bold text-[#ffd700] text-sm mt-0.5">
                {formatGrams(totalGram)} gr
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  ({formatRupiah(totalNilaiEmas)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick 4 Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onNavigate('beli')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#231e13] to-[#14171e] hover:from-[#2e2617] hover:to-[#1b202a] border border-[#ffd700]/30 text-white transition-all shadow-md group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ffd700]/20 text-[#ffd700] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Beli Emas</span>
        </button>

        <button
          onClick={() => onNavigate('jual')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#1b1c24] to-[#13151b] hover:from-[#232632] hover:to-[#181a22] border border-[#2e3444] text-white transition-all shadow-md group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <ArrowUpFromLine className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Jual Emas</span>
        </button>

        <button
          onClick={onOpenDeposit}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#14231b] to-[#12161e] hover:from-[#1b2f24] hover:to-[#171c26] border border-emerald-500/30 text-white transition-all shadow-md group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Deposit</span>
        </button>

        <button
          onClick={onOpenWithdraw}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#24171a] to-[#14151c] hover:from-[#2f1f23] hover:to-[#1a1c24] border border-rose-500/30 text-white transition-all shadow-md group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Tarik Saldo</span>
        </button>
      </div>

      {/* Referral & Registration Bonus Banner */}
      <div
        onClick={() => onNavigate('akun')}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-[#12151f] border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-[#ffd700]/50 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#ffd700]">Program Referral & Bonus</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Otomatis
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Dapatkan bonus <strong className="text-emerald-400">Rp 15.000</strong> langsung tiap teman mendaftar dengan kode Anda!
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#ffd700] group-hover:translate-x-1 transition-transform shrink-0" />
      </div>

      {/* Gold Price Overview Card */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-[#232733]">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Harga Acuan Pasar IndoGold
            </span>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {formatRupiah(hargaDasar)}
              <span className="text-xs font-normal text-slate-400">/gram</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Harga Buyback (Jual)</span>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              {formatRupiah(buybackEstimasi)}
              <span className="text-[10px] font-normal text-slate-400">/gram</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#ffd700] shrink-0" />
            <span>Kemurnian 99.99% 24 Karat</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Award className="w-4 h-4 text-[#ffd700] shrink-0" />
            <span>Sertifikat SNI & LBMA</span>
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      <GoldPriceChart />

      {/* User's Gold Holdings */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#ffd700]" />
            <h3 className="text-sm font-bold text-white">Emas Batangan Milik Anda</h3>
          </div>
          <button
            onClick={() => onNavigate('beli')}
            className="text-xs font-semibold text-[#ffd700] hover:underline flex items-center"
          >
            Tambah Emas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!currentUser?.emas || currentUser.emas.length === 0) ? (
          <div className="text-center py-6 px-4 rounded-xl bg-[#0e1118] border border-[#202534]">
            <Coins className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-semibold">Anda belum memiliki simpanan emas</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Beli emas mulai dari 0.05 gram. Nilai aset Anda otomatis bertambah setiap hari!
            </p>
            <button
              onClick={() => onNavigate('beli')}
              className="mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-90"
            >
              Beli Emas Pertama Anda
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {currentUser.emas.map((item) => {
              const info = getBrandInfo(item.jenis);
              const curVal = item.gram * (hargaDasar + info.marjinalBeli);
              return (
                <div
                  key={item.jenis}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0e1118] border border-[#202534] hover:border-[#ffd700]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{info.flag}</span>
                    <div>
                      <div className="font-bold text-white text-xs sm:text-sm">{info.nama}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {info.sertifikasi} • {info.kemurnian}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-[#ffd700] text-sm">
                      {formatGrams(item.gram)} gr
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ≈ {formatRupiah(curVal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-[#171a24] to-[#12141c] border border-[#232838] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-white">Jaminan Buyback 100% & Terproteksi</p>
          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
            Emas fisik tersimpan aman di brankas berstandar internasional. Transaksi pencairan saldo didukung penarikan 24/7.
          </p>
        </div>
      </div>
    </div>
  );
};

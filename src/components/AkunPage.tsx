import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { BONUS_REFERRAL_PENGUNDANG, BONUS_REFERRAL_USER, BONUS_PENDAFTARAN } from '../data/mockData';
import {
  User,
  Copy,
  Check,
  Share2,
  Gift,
  ShieldCheck,
  LogOut,
  Sparkles,
  Coins,
  ChevronRight,
  Headphones
} from 'lucide-react';

interface AkunPageProps {
  onLogout: () => void;
}

export const AkunPage: React.FC<AkunPageProps> = ({ onLogout }) => {
  const {
    currentUser,
    allUsers,
    claimDailyProfit,
    canClaimProfit,
    hitungTotalNilaiEmas
  } = useGold();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentUser) return null;

  // Calculate referrals count and bonus earned
  const referredUsers = allUsers.filter((u) => u.dirujukOleh === currentUser.kodeRef);
  const totalReferralBonus = referredUsers.length * BONUS_REFERRAL_PENGUNDANG;
  const totalAset = currentUser.saldo + hitungTotalNilaiEmas(currentUser);
  const untungHariIni = Math.floor(totalAset * 0.03);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.kodeRef);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?ref=${currentUser.kodeRef}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#1c1a13] to-[#12141c] border border-[#ffd700]/30 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-[#ffd700] to-yellow-200 text-black font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            {currentUser.nama.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold text-white">{currentUser.nama}</h2>
              {currentUser.isAdmin && (
                <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span>Terdaftar: {formatDateTime(currentUser.daftarPada).split(',')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Profit 3% Center */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffd700]" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Bagi Hasil Harian (3% dari Aset)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Aktif Otomatis
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#0e1118] border border-[#202534] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Estimasi Dividen Hari Ini</span>
            <div className="text-lg font-black text-[#ffd700] mt-0.5">
              +{formatRupiah(untungHariIni)}
            </div>
          </div>

          <button
            onClick={claimDailyProfit}
            disabled={!canClaimProfit}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              canClaimProfit
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-95 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {canClaimProfit ? 'Klaim Sekarang' : 'Sudah Terklaim'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Dividen harian 3% dihitung otomatis dari total gabungan saldo kas dan total nilai simpanan emas Anda.
        </p>
      </div>

      {/* Referral Program Card */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Program Referral IndoGold
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#ffd700]">Rp 15.000 / Teman</span>
        </div>

        {/* Bonus Information Pill */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 space-y-1">
          <p>
            🎁 <strong>Teman baru</strong> otomatis dapat <strong>Rp 20.000 + Rp 10.000</strong> saldo pendaftaran saat memakai kodemu!
          </p>
          <p>
            💰 <strong>Kamu</strong> langsung menerima saldo kas <strong>Rp 15.000</strong> detik itu juga ke akunmu!
          </p>
        </div>

        {/* Code Box */}
        <div className="p-3 rounded-xl bg-[#0e1118] border border-[#252a38] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Kode Referral Unik Anda:</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Aktif Selamanya</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#141824] border border-[#2d3448]">
            <span className="font-mono font-black text-base tracking-widest text-[#ffd700]">
              {currentUser.kodeRef}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-[#ffd700]/20 text-[#ffd700] hover:bg-[#ffd700]/30 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full py-2 px-3 rounded-lg bg-[#181d29] hover:bg-[#202738] border border-[#2b3346] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Tautan Pendaftaran Tersalin!' : 'Salin Tautan Undangan'}</span>
          </button>
        </div>

        {/* Referral stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0e1118] border border-[#202534]">
            <span className="text-[11px] text-slate-400">Teman Bergabung</span>
            <div className="text-base font-bold text-white mt-0.5">{referredUsers.length} Orang</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e1118] border border-[#202534]">
            <span className="text-[11px] text-slate-400">Total Komisi Diterima</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {formatRupiah(totalReferralBonus)}
            </div>
          </div>
        </div>

        {/* List of referred friends if any */}
        {referredUsers.length > 0 && (
          <div className="pt-2 border-t border-[#202534] space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Daftar Teman Terdaftar ({referredUsers.length}):
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {referredUsers.map((u) => (
                <div
                  key={u.uid}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0e1118] border border-[#1f2434] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-[#ffd700] flex items-center justify-center font-bold text-[10px]">
                      {u.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs truncate max-w-[140px]">
                        {u.nama}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {u.daftarPada ? formatDateTime(u.daftarPada) : 'Baru saja'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    +Rp 15.000
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Menu / Actions */}
      <div className="bg-[#13161f] border border-[#232733] rounded-2xl overflow-hidden shadow-lg divide-y divide-[#1f2434]">
        {/* Keamanan & Verifikasi */}
        <div className="w-full p-3.5 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Keamanan Akun & KYC</div>
              <div className="text-[10px] text-emerald-400">
                Terverifikasi resmi & terenkripsi 256-bit SSL
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Aktif
          </span>
        </div>

        {/* Live Chat Bantuan CS */}
        <button
          onClick={() => {
            const btn = document.getElementById('open-live-chat-fab');
            if (btn) btn.click();
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-500/10 transition-colors text-amber-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-105 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Pusat Bantuan & Live CS</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-500/20 text-[#ffd700] rounded">
                  24/7 ONLINE
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Hubungi Customer Service untuk kendala deposit, tarik dana, dll
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-500/10 transition-colors text-rose-400"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Keluar Akun</div>
              <div className="text-[10px] text-rose-400/70">Akhiri sesi di perangkat ini</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>
    </div>
  );
};

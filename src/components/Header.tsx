import React, { useState, useRef, useEffect } from 'react';
import { useGold } from '../context/GoldContext';
import { TabType } from './BottomNav';
import {
  ChevronDown,
  LogOut,
  CheckCircle,
  Wallet,
  Coins,
  Home,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  User,
  Copy,
  Check,
  Gift
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface HeaderProps {
  onNavigate?: (tab: TabType) => void;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const {
    currentUser,
    logout,
    isPriceFluctuating,
    togglePriceFluctuation,
    hitungTotalGramEmas,
    hitungTotalNilaiEmas,
    showToast
  } = useGold();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCopyReferral = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.kodeRef) {
      navigator.clipboard.writeText(currentUser.kodeRef);
      setCopiedRef(true);
      showToast(`Kode referral ${currentUser.kodeRef} berhasil disalin!`, 'success');
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleMenuClick = (action: () => void) => {
    setShowProfileMenu(false);
    action();
  };

  const totalGram = currentUser ? hitungTotalGramEmas(currentUser) : 0;
  const totalNilaiEmas = currentUser ? hitungTotalNilaiEmas(currentUser) : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f14]/95 backdrop-blur-md border-b border-[#252830] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate?.('beranda')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#996515] via-[#ffd700] to-[#fff3a8] flex items-center justify-center shadow-lg shadow-[#ffd700]/15 text-black font-extrabold text-base group-hover:scale-105 transition-transform">
            IG
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-[#ffd700] via-[#f7e07a] to-[#d4af37] bg-clip-text text-transparent">
                IndoGold
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30">
                Official
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Investasi Emas Terpercaya</p>
          </div>
        </div>

        {/* Right side: Live Ticker & My Account Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Price ticker button */}
          <button
            onClick={togglePriceFluctuation}
            title={isPriceFluctuating ? 'Harga Live Aktif (Klik untuk jeda)' : 'Harga Diam (Klik untuk live)'}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              isPriceFluctuating
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPriceFluctuating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-semibold hidden xs:inline">LIVE</span>
          </button>

          {/* User Profile Dropdown Pill */}
          <div className="relative" ref={menuRef}>
            <button
              id="header-user-menu-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                showProfileMenu
                  ? 'bg-[#232834] border-[#ffd700]/40 text-white ring-2 ring-[#ffd700]/20'
                  : 'bg-[#1a1e27] hover:bg-[#232834] border-[#2d3342] text-slate-200'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-black flex items-center justify-center font-bold text-[10px] shrink-0">
                {currentUser?.nama?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="max-w-[85px] truncate text-slate-200 font-semibold text-xs">
                {currentUser?.nama?.split(' ')[0] || 'Nasabah'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-[#ffd700]' : ''}`} />
            </button>

            {/* Dropdown Menu Modal / Popover */}
            {showProfileMenu && currentUser && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#141822] border border-[#2d3342] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                {/* 1. Profile Information Header */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#252a38]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-black flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-amber-500/10">
                    {currentUser.nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white font-bold truncate">
                        {currentUser.nama}
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Nasabah Resmi
                      </span>
                      {currentUser.isAdmin && (
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Real Balance & Gold Holdings Summary */}
                <div className="p-2.5 rounded-xl bg-[#0d1017] border border-[#222836] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-400" />
                      Saldo Kas
                    </span>
                    <span className="font-extrabold text-white">
                      {formatRupiah(currentUser.saldo || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#1a1f2c]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-[#ffd700]" />
                      Simpanan Emas
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-[#ffd700]">
                        {totalGram.toFixed(4)} gr
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ≈ {formatRupiah(totalNilaiEmas)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Referral Program Section inside Menu */}
                {currentUser.kodeRef && (
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1a1a12] to-[#121622] border border-[#ffd700]/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#ffd700] font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3 text-amber-400" />
                        Kode Referral Anda
                      </span>
                      <span className="text-[9px] text-emerald-400 font-semibold">+Rp 15.000/teman</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-[#0b0e14] px-2 py-1 rounded-lg border border-[#2d3345]">
                      <span className="font-mono font-bold text-xs tracking-wider text-slate-100">
                        {currentUser.kodeRef}
                      </span>
                      <button
                        onClick={handleCopyReferral}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] hover:bg-[#ffd700]/30 flex items-center gap-1 transition-colors"
                      >
                        {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRef ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Functional Quick Navigation Actions */}
                <div className="space-y-1 pt-1 border-t border-[#202534]">
                  <button
                    onClick={() => handleMenuClick(() => onNavigate?.('beranda'))}
                    className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:text-white hover:bg-[#1f2533] transition-colors"
                  >
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                    <span>Beranda & Portofolio</span>
                  </button>

                  {onOpenDeposit && (
                    <button
                      onClick={() => handleMenuClick(onOpenDeposit)}
                      className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Deposit Saldo Kas</span>
                    </button>
                  )}

                  {onOpenWithdraw && (
                    <button
                      onClick={() => handleMenuClick(onOpenWithdraw)}
                      className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5" />
                      <span>Tarik Dana (Pencairan)</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleMenuClick(() => onNavigate?.('riwayat'))}
                    className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:text-white hover:bg-[#1f2533] transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-sky-400" />
                    <span>Riwayat Transaksi & Mutasi</span>
                  </button>

                  <button
                    onClick={() => handleMenuClick(() => onNavigate?.('akun'))}
                    className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:text-white hover:bg-[#1f2533] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Profil & Pengaturan Akun</span>
                  </button>
                </div>

                {/* 5. Logout Action Button */}
                <div className="pt-2 border-t border-[#202534]">
                  <button
                    id="header-logout-btn"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


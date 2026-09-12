import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { formatRupiah, formatDateTime, formatGrams } from '../utils/formatters';
import { GoldBrandId, UserAccount } from '../types/gold';
import {
  ShieldCheck,
  Check,
  X,
  Image as ImageIcon,
  ArrowLeft,
  Users,
  CreditCard,
  ArrowDownToLine,
  Sliders,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
  Smartphone,
  Building2,
  FileText,
  Activity,
  MessageSquare,
  Copy,
  Coins,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { AdminLiveChat } from './AdminLiveChat';

interface AdminPortalProps {
  onBackToUserApp: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToUserApp }) => {
  const {
    currentUser,
    allUsers,
    transactions,
    hargaDasar,
    hargaBeli,
    hargaJual,
    adminApproveTransaction,
    adminRejectTransaction,
    adminAdjustBalance,
    adminAdjustGold,
    adminSetPrice,
    togglePriceFluctuation,
    isPriceFluctuating,
    hitungTotalNilaiEmas,
    hitungTotalGramEmas,
    getBrandInfo,
    login,
    switchUser,
    logout,
    adminTotalUnreadCount
  } = useGold();

  // Admin login form state (for non-admin users)
  const [adminEmail, setAdminEmail] = useState('admin@indogold.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs inside admin portal
  const [activeTab, setActiveTab] = useState<'deposit' | 'tarik' | 'users' | 'market' | 'logs' | 'chat'>('deposit');
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; title: string } | null>(null);

  // User detail inspection modal
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserAccount | null>(null);

  // Active chat user selection when jumping from user card or transaction
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  // Balance & Gold adjustment modal state
  const [adjustModalUser, setAdjustModalUser] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<'cash' | 'gold'>('cash');
  const [adjustAmount, setAdjustAmount] = useState<string>('500000');
  const [adjustGoldBrand, setAdjustGoldBrand] = useState<GoldBrandId>('ANTAM');
  const [adjustGoldGrams, setAdjustGoldGrams] = useState<string>('1.0');
  const [adjustNote, setAdjustNote] = useState<string>('Penyesuaian saldo admin');

  // Search in user list
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Logs filters
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'deposit' | 'tarik' | 'beli' | 'jual' | 'untung' | 'bonus'>('all');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'menunggu' | 'disetujui' | 'ditolak'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Market manual price state
  const [customPrice, setCustomPrice] = useState<string>(hargaDasar.toString());

  const pendingDeposits = transactions.filter((t) => t.jenis === 'deposit' && t.status === 'menunggu');
  const pendingWithdrawals = transactions.filter((t) => t.jenis === 'tarik' && t.status === 'menunggu');
  const allLogs = [...transactions].sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await login(adminEmail, adminPassword);
      setIsLoggingIn(false);
      if (!res.success) {
        setAdminLoginError(res.message);
      } else {
        // Verify user is actually admin
        const found = allUsers.find((u) => u.email.toLowerCase() === adminEmail.trim().toLowerCase());
        if (!found?.isAdmin) {
          setAdminLoginError('Akun ini tidak memiliki hak akses administrator pengelola.');
        }
      }
    } catch {
      setIsLoggingIn(false);
      setAdminLoginError('Gagal memverifikasi login admin.');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;

    if (adjustType === 'cash') {
      const val = parseFloat(adjustAmount) || 0;
      if (val === 0) return;
      await adminAdjustBalance(adjustModalUser, val, adjustNote);
    } else {
      const grams = parseFloat(adjustGoldGrams) || 0;
      if (grams === 0) return;
      await adminAdjustGold(adjustModalUser, adjustGoldBrand, grams, adjustNote);
    }
    setAdjustModalUser(null);
  };

  const handlePriceChange = (pct: number) => {
    const updated = Math.round(hargaDasar * (1 + pct / 100) / 100) * 100;
    adminSetPrice(updated);
    setCustomPrice(updated.toString());
  };

  // =========================================================================
  // VIEW 1: DEDICATED ADMIN LOGIN (If user is not authenticated as admin)
  // =========================================================================
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
        {/* Top brand header */}
        <div className="w-full max-w-lg mx-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-[#ffd700] to-yellow-200 text-black font-black flex items-center justify-center text-sm shadow-md">
              IG
            </div>
            <div>
              <span className="text-sm font-black text-white block leading-tight">
                IndoGold Backoffice
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">
                Portal Khusus Pengelola Terpisah
              </span>
            </div>
          </div>

          <button
            onClick={onBackToUserApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1e2334] text-xs font-semibold text-slate-300 border border-[#272d3e] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Aplikasi Nasabah</span>
          </button>
        </div>

        {/* Center Login Card */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="bg-[#0f121a] border border-[#262c3d] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-400" />

            <div className="text-center space-y-1 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-[#ffd700] flex items-center justify-center mx-auto mb-2 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-black text-white">Login Backoffice Admin</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Area terbatas untuk staf verifikasi transaksi, deposit, penarikan, dan kuotasi harga emas
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Email Administrator
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@indogold.com"
                    className="w-full bg-[#090b10] border border-[#272d3e] text-xs font-medium text-white rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Kata Sandi Petugas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Kata sandi admin"
                    className="w-full bg-[#090b10] border border-[#272d3e] text-xs font-medium text-white rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminLoginError && (
                <div className="text-xs text-rose-400 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoggingIn ? 'Memverifikasi Akses...' : 'Masuk ke Portal Pengelola'}</span>
              </button>
            </form>

            {/* 1-Click Fast Admin Demo Login */}
            <div className="pt-3 border-t border-[#1f2433] space-y-2">
              <span className="text-[11px] text-slate-400 block text-center font-medium">
                Kredensial Default Uji Coba:
              </span>
              <button
                type="button"
                onClick={() => {
                  switchUser('admin-001');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-amber-500/30 text-xs font-bold text-[#ffd700] transition-colors flex items-center justify-center gap-2"
              >
                <span>⚡ 1-Klik Masuk sebagai Administrator Utama</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 pb-2">
          © {new Date().getFullYear()} IndoGold Backoffice Administration. Terpisah & Terenkripsi.
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED ADMIN BACKOFFICE PORTAL (When authenticated as admin)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-[#ffd700] selection:text-black">
      {/* Zoomed Receipt Modal */}
      <ReceiptModal
        imageUrl={selectedReceipt?.url || null}
        title={selectedReceipt?.title}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Adjust balance & gold modal */}
      {adjustModalUser && (() => {
        const targetUsr = allUsers.find((u) => u.uid === adjustModalUser);
        const userGoldGrams = targetUsr ? hitungTotalGramEmas(targetUsr) : 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-[#12151f] border border-[#272f42] rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#212838] pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#ffd700]" />
                    <span>Penyesuaian Saldo Akun Nasabah</span>
                  </h4>
                  {targetUsr && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {targetUsr.nama} ({targetUsr.email})
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setAdjustModalUser(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Balances Preview */}
              {targetUsr && (
                <div className="grid grid-cols-2 gap-2 bg-[#090b10] p-3 rounded-2xl border border-[#202535]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Saldo Kas Saat Ini:</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      {formatRupiah(targetUsr.saldo)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Emas Saat Ini:</span>
                    <span className="text-xs font-black text-[#ffd700] font-mono">
                      {userGoldGrams.toFixed(2)} gr
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs: Saldo Kas vs Saldo Emas */}
              <div className="grid grid-cols-2 gap-1 bg-[#090b10] p-1 rounded-xl border border-[#202535]">
                <button
                  type="button"
                  onClick={() => setAdjustType('cash')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    adjustType === 'cash'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Saldo Kas (Rp)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('gold')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    adjustType === 'gold'
                      ? 'bg-[#ffd700] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Saldo Emas (Gram)</span>
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-3">
                {adjustType === 'cash' ? (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 block font-semibold">
                      Nominal Tambah / Kurang (Rp):
                    </label>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="500000"
                      className="w-full bg-[#0a0c10] border border-[#262c3e] rounded-xl px-3 py-2.5 text-sm text-white font-bold outline-none focus:border-emerald-400"
                      required
                    />
                    {/* Quick presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: '+50rb', val: 50000 },
                        { label: '+100rb', val: 100000 },
                        { label: '+250rb', val: 250000 },
                        { label: '+500rb', val: 500000 },
                        { label: '-50rb', val: -50000 },
                        { label: '-100rb', val: -100000 }
                      ].map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setAdjustAmount(p.val.toString())}
                          className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-colors ${
                            p.val > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      *Gunakan tanda minus (-) untuk memotong saldo kas nasabah.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 block font-semibold">
                      Pilih Merk & Jenis Emas:
                    </label>
                    <select
                      value={adjustGoldBrand}
                      onChange={(e) => setAdjustGoldBrand(e.target.value as GoldBrandId)}
                      className="w-full bg-[#0a0c10] border border-[#262c3e] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#ffd700]"
                    >
                      <option value="ANTAM">Antam CertiCard 99.99%</option>
                      <option value="UBS">UBS Gold 99.99%</option>
                      <option value="PAMP">PAMP Suisse Lady Fortuna</option>
                      <option value="GALERI24">Galeri 24 Pegadaian</option>
                      <option value="LOTUS">Lotus Archi</option>
                      <option value="HARTADINATA">Hartadinata Gold</option>
                    </select>

                    <label className="text-xs text-slate-300 block font-semibold pt-1">
                      Jumlah Gram (+ atau -):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={adjustGoldGrams}
                      onChange={(e) => setAdjustGoldGrams(e.target.value)}
                      placeholder="1.0"
                      className="w-full bg-[#0a0c10] border border-[#262c3e] rounded-xl px-3 py-2.5 text-sm text-white font-bold outline-none focus:border-[#ffd700]"
                      required
                    />
                    {/* Quick gram presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: '+0.5 gr', val: 0.5 },
                        { label: '+1.0 gr', val: 1.0 },
                        { label: '+2.0 gr', val: 2.0 },
                        { label: '+5.0 gr', val: 5.0 },
                        { label: '-0.5 gr', val: -0.5 },
                        { label: '-1.0 gr', val: -1.0 }
                      ].map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setAdjustGoldGrams(p.val.toString())}
                          className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-colors ${
                            p.val > 0
                              ? 'bg-amber-500/10 text-[#ffd700] border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    Keterangan / Alasan Penyesuaian:
                  </label>
                  <input
                    type="text"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="Contoh: Bonus promo khusus / Koreksi saldo"
                    className="w-full bg-[#0a0c10] border border-[#262c3e] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#ffd700]"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModalUser(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-extrabold hover:opacity-95 transition-opacity shadow-md"
                  >
                    Terapkan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Customer Detail Inspection Modal */}
      {selectedUserForDetail && (() => {
        const usr = selectedUserForDetail;
        const usrTransactions = transactions.filter((t) => t.uid === usr.uid);
        const usrGoldGrams = hitungTotalGramEmas(usr);
        const usrGoldValue = hitungTotalNilaiEmas(usr);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-[#12151f] border border-[#272f42] rounded-3xl p-5 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#212838] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-[#ffd700] to-yellow-200 text-black font-black text-base flex items-center justify-center shadow-md">
                    {usr.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{usr.nama}</h4>
                      {usr.isAdmin ? (
                        <span className="text-[9px] font-black px-2 py-0.5 bg-amber-500/20 text-[#ffd700] rounded-full border border-amber-500/30">
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          NASABAH AKTIF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{usr.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserForDetail(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account Identification Data */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#090b10] p-3 rounded-2xl border border-[#202535] text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">UID Akun:</span>
                  <div className="font-mono text-slate-200 font-bold flex items-center gap-1">
                    <span className="truncate">{usr.uid}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Terdaftar Pada:</span>
                  <span className="text-slate-200 font-bold block">{formatDateTime(usr.daftarPada)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kode Referral:</span>
                  <span className="font-mono text-[#ffd700] font-bold block">{usr.kodeRef}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Sponsor / Pengundang:</span>
                  <span className="text-slate-200 font-bold block">{usr.dirujukOleh || 'Organik (Tanpa Sponsor)'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Dividen Terakhir:</span>
                  <span className="text-slate-200 font-bold block">{usr.terakhirKeuntungan || 'Belum pernah klaim'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Aktivitas Transaksi:</span>
                  <span className="text-slate-200 font-bold block">{usrTransactions.length} mutasi</span>
                </div>
              </div>

              {/* Balance Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#090b10] border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block font-semibold">Saldo Kas Riil</span>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                    {formatRupiah(usr.saldo)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#090b10] border border-amber-500/20">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Portofolio Emas</span>
                  <div className="text-lg font-black text-[#ffd700] font-mono mt-0.5">
                    {usrGoldGrams.toFixed(2)} gr
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                    ≈ {formatRupiah(usrGoldValue)}
                  </span>
                </div>
              </div>

              {/* Gold Holdings Breakdown */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-white block">Rincian Simpanan Emas Fisik:</span>
                {usr.emas.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-[#090b10] border border-[#202535] text-xs text-slate-400 text-center">
                    Nasabah belum memiliki simpanan emas fisik saat ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {usr.emas.map((item) => {
                      const brand = getBrandInfo(item.jenis);
                      return (
                        <div
                          key={item.jenis}
                          className="p-2.5 rounded-xl bg-[#090b10] border border-[#202535] flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {brand.flag} {brand.nama}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Rata-rata: {formatRupiah(item.rataRataBeli)}/g
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#ffd700] font-mono">
                            {item.gram.toFixed(2)} gr
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Transactions of This Customer */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-white block">
                  Riwayat Aktivitas & Transaksi Nasabah Ini ({usrTransactions.length}):
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {usrTransactions.length === 0 ? (
                    <div className="p-3 rounded-2xl bg-[#090b10] border border-[#202535] text-xs text-slate-400 text-center">
                      Belum ada mutasi transaksi untuk nasabah ini.
                    </div>
                  ) : (
                    usrTransactions.map((trx) => (
                      <div
                        key={trx.id}
                        className="p-2.5 rounded-xl bg-[#090b10] border border-[#202535] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-slate-400">{trx.id}</span>
                            <span className="text-[10px] uppercase font-bold text-[#ffd700]">
                              {trx.jenis}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formatDateTime(trx.waktu)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                            {trx.teks}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-white block">
                            {formatRupiah(trx.jumlah)}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                              trx.status === 'disetujui'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : trx.status === 'menunggu'
                                ? 'bg-amber-500/15 text-[#ffd700]'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {trx.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex gap-2 pt-2 border-t border-[#212838]">
                <button
                  onClick={() => {
                    setSelectedUserForDetail(null);
                    setAdjustModalUser(usr.uid);
                    setAdjustType('cash');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#ffd700] border border-amber-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ubah Saldo Nasabah</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedUserForDetail(null);
                    setActiveChatUserId(usr.uid);
                    setActiveTab('chat');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-extrabold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Buka Live Chat</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Standalone Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/95 backdrop-blur-md border-b border-[#212738] px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-[#ffd700] to-yellow-200 text-black font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              IG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">IndoGold Backoffice</h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PORTAL TERPISAH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Panel Manajemen Khusus Staf & Administrator Pengelola
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Market Price Ticker */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141824] border border-[#252c3e] text-xs">
              <span className="text-slate-400">Emas Hari Ini:</span>
              <span className="font-bold text-[#ffd700] font-mono">{formatRupiah(hargaDasar)}/g</span>
              <button
                onClick={togglePriceFluctuation}
                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isPriceFluctuating ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isPriceFluctuating ? 'LIVE ON' : 'PAUSED'}
              </button>
            </div>

            {/* Back to User Application Button */}
            <button
              onClick={onBackToUserApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#171d2b] hover:bg-[#20283b] text-xs font-bold text-slate-200 border border-[#2b354c] transition-all shadow-sm active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-[#ffd700]" />
              <span className="hidden xs:inline">Buka Aplikasi Nasabah</span>
              <span className="xs:hidden">Aplikasi</span>
            </button>

            {/* Logout Admin */}
            <button
              onClick={() => {
                logout();
                onBackToUserApp();
              }}
              title="Keluar dari Panel Admin"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Pending Deposit Card */}
          <div
            onClick={() => setActiveTab('deposit')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'deposit'
                ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg'
                : 'bg-[#0f121a] border-[#222838] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Antrean Deposit</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {pendingDeposits.length}
              <span className="text-xs font-normal text-slate-400 ml-1.5">permintaan</span>
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              Bank Permata & OVO
            </span>
          </div>

          {/* Pending Withdrawal Card */}
          <div
            onClick={() => setActiveTab('tarik')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'tarik'
                ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-500/40 shadow-lg'
                : 'bg-[#0f121a] border-[#222838] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Antrean Penarikan</span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {pendingWithdrawals.length}
              <span className="text-xs font-normal text-slate-400 ml-1.5">permintaan</span>
            </div>
            <span className="text-[11px] text-blue-400 mt-1 block">
              Pencairan Dana Nasabah
            </span>
          </div>

          {/* Total Users Card */}
          <div
            onClick={() => setActiveTab('users')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                : 'bg-[#0f121a] border-[#222838] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Total Pengguna</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-[#ffd700]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {allUsers.length}
              <span className="text-xs font-normal text-slate-400 ml-1.5">nasabah</span>
            </div>
            <span className="text-[11px] text-[#ffd700] mt-1 block">
              Kelola Saldo Kas & Emas
            </span>
          </div>

          {/* Gold Price Card */}
          <div
            onClick={() => setActiveTab('market')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'market'
                ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/40 shadow-lg'
                : 'bg-[#0f121a] border-[#222838] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Harga Dasar Emas</span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Sliders className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {formatRupiah(hargaDasar)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Beli: {formatRupiah(hargaBeli)} /g
            </span>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#0f121a] border border-[#212738] rounded-2xl">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'deposit'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#161a25]'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Verifikasi Deposit</span>
            {pendingDeposits.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-black">
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tarik')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'tarik'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#161a25]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Verifikasi Penarikan</span>
            {pendingWithdrawals.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-black">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#161a25]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Nasabah & Saldo ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'market'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#161a25]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Kontrol Pasar Emas</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#161a25]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Semua Riwayat Transaksi</span>
          </button>

          <button
            id="admin-tab-chat-btn"
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#161a25]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Chat Nasabah</span>
            {adminTotalUnreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-black animate-pulse">
                {adminTotalUnreadCount}
              </span>
            )}
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: DEPOSITS QUEUE (Bank Permata & OVO) */}
        {/* ================================================================= */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0f121a] p-4 rounded-2xl border border-[#212738]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Antrean Konfirmasi Deposit Nasabah</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    Rekening Resmi: Bank Permata & OVO
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Periksa struk pembayaran nasabah sebelum menyetujui penambahan saldo kas.
                </p>
              </div>
              <div className="text-xs font-bold text-[#ffd700]">
                {pendingDeposits.length} Permintaan Menunggu
              </div>
            </div>

            {pendingDeposits.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-[#0e1119] border border-[#212738] p-6 space-y-2">
                <Check className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Semua Deposit Selesai Diproses</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tidak ada permintaan deposit baru yang menunggu konfirmasi saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDeposits.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#0f121a] border border-[#262c3e] border-l-4 border-l-emerald-500 shadow-xl space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono bg-[#171b26] px-2 py-0.5 rounded">
                            {item.id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(item.waktu)}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white mt-1">{item.namaUser}</h4>
                        <p className="text-xs text-slate-400">{item.emailUser}</p>
                        <p className="text-xs text-emerald-400 font-semibold mt-1">{item.teks}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Nominal Transfer:</span>
                        <div className="text-base font-black text-white font-mono">
                          {formatRupiah(item.jumlah)}
                        </div>
                      </div>
                    </div>

                    {/* Proof image preview */}
                    {item.buktiFoto ? (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#080a0f] border border-[#1e2330]">
                        <img
                          src={item.buktiFoto}
                          alt="Bukti Transfer"
                          className="w-16 h-16 rounded-xl object-cover border border-[#2a3244] cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            setSelectedReceipt({
                              url: item.buktiFoto!,
                              title: `Bukti Transfer: ${item.namaUser} (${formatRupiah(item.jumlah)})`
                            })
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-white block">
                            Struk Pembayaran Terlampir
                          </span>
                          <p className="text-[11px] text-slate-400 truncate">
                            Klik gambar untuk memeriksa keaslian bukti transfer
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedReceipt({
                                url: item.buktiFoto!,
                                title: `Bukti Transfer: ${item.namaUser} (${formatRupiah(item.jumlah)})`
                              })
                            }
                            className="text-xs text-[#ffd700] hover:underline font-bold flex items-center gap-1 mt-1"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Perbesar Struk Pembayaran</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Nasabah tidak menyertakan foto struk pada form ini.</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          const reason = prompt('Masukkan alasan penolakan deposit:', 'Bukti transfer tidak valid / dana belum masuk');
                          if (reason !== null) {
                            adminRejectTransaction(item.id, reason);
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Tolak Deposit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Setujui deposit ${formatRupiah(item.jumlah)} untuk ${item.namaUser}?\nSaldo kas nasabah akan bertambah secara otomatis.`
                            )
                          ) {
                            adminApproveTransaction(item.id);
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-extrabold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Setujui (+ Saldo Kas)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: WITHDRAWAL QUEUE */}
        {/* ================================================================= */}
        {activeTab === 'tarik' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0f121a] p-4 rounded-2xl border border-[#212738]">
              <div>
                <h3 className="text-sm font-bold text-white">Antrean Penarikan Dana (Withdrawal)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Transfer dana ke rekening tujuan nasabah di bawah ini lalu konfirmasi persetujuan.
                </p>
              </div>
              <div className="text-xs font-bold text-blue-400">
                {pendingWithdrawals.length} Permintaan Menunggu
              </div>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-[#0e1119] border border-[#212738] p-6 space-y-2">
                <Check className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Semua Penarikan Dana Telah Diproses</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tidak ada penarikan yang tertunda saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingWithdrawals.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#0f121a] border border-[#262c3e] border-l-4 border-l-blue-500 shadow-xl space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono bg-[#171b26] px-2 py-0.5 rounded">
                            {item.id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(item.waktu)}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white mt-1">{item.namaUser}</h4>
                        <p className="text-xs text-slate-400">{item.emailUser}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Nominal Dicairkan:</span>
                        <div className="text-base font-black text-white font-mono text-rose-400">
                          {formatRupiah(item.jumlah)}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#080a0f] border border-[#1e2330] space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold block">
                        Tujuan Transfer Dana:
                      </span>
                      <div className="text-xs text-[#ffd700] font-bold">{item.teks}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          const reason = prompt('Masukkan alasan penolakan penarikan:', 'Nomor rekening tidak valid');
                          if (reason !== null) {
                            adminRejectTransaction(item.id, reason);
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Tolak & Refund</span>
                      </button>

                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Konfirmasi sudah mentransfer ${formatRupiah(item.jumlah)} ke nasabah?\nStatus transaksi akan diperbarui menjadi Sukses.`
                            )
                          ) {
                            adminApproveTransaction(item.id);
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-extrabold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Konfirmasi Terkirim</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: USER MANAGEMENT & BALANCE ADJUSTMENT */}
        {/* ================================================================= */}
        {activeTab === 'users' && (() => {
          const totalKasBeredar = allUsers.reduce((sum, u) => sum + (u.saldo || 0), 0);
          const totalGramEmas = allUsers.reduce((sum, u) => sum + hitungTotalGramEmas(u), 0);
          const totalNilaiEmas = allUsers.reduce((sum, u) => sum + hitungTotalNilaiEmas(u), 0);

          const filteredUsers = allUsers.filter(
            (u) =>
              u.nama.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
              u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
              u.uid.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
              (u.kodeRef && u.kodeRef.toLowerCase().includes(userSearchQuery.toLowerCase()))
          );

          return (
            <div className="space-y-4">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#0f121a] border border-[#212738] shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Total Nasabah Terdaftar</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {allUsers.length} <span className="text-xs font-normal text-slate-400">Akun</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {allUsers.filter((u) => u.isAdmin).length} Staf Admin • {allUsers.filter((u) => !u.isAdmin).length} Nasabah Aktif
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f121a] border border-[#212738] shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Total Saldo Kas Beredar</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                    {formatRupiah(totalKasBeredar)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Dana kas siap investasi di akun nasabah
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f121a] border border-[#212738] shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Total Portofolio Emas</span>
                    <Coins className="w-4 h-4 text-[#ffd700]" />
                  </div>
                  <div className="text-xl font-black text-[#ffd700] font-mono mt-1">
                    {totalGramEmas.toFixed(2)} gr
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    ≈ {formatRupiah(totalNilaiEmas)}
                  </span>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f121a] p-4 rounded-2xl border border-[#212738]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#ffd700]" />
                    <span>Daftar Nasabah & Pusat Kontrol Aset</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kelola saldo kas, simpanan emas fisik, audit mutasi transaksi, dan hubungi nasabah via Live Chat.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Cari nama, email, ref, UID..."
                    className="w-full bg-[#080a0f] border border-[#262c3e] text-xs text-white rounded-xl pl-8 pr-3 py-2 outline-none focus:border-[#ffd700]"
                  />
                </div>
              </div>

              {/* Users Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((usr) => {
                  const userGrams = hitungTotalGramEmas(usr);
                  const userGoldVal = hitungTotalNilaiEmas(usr);

                  return (
                    <div
                      key={usr.uid}
                      className="p-4 rounded-3xl bg-[#0f121a] border border-[#23293a] space-y-3.5 shadow-lg hover:border-slate-600 transition-colors"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#1b2130] border border-[#2d374d] text-[#ffd700] font-bold text-sm flex items-center justify-center">
                            {usr.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate max-w-[140px]">
                                {usr.nama}
                              </h4>
                              {usr.isAdmin && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-500/20 text-[#ffd700] rounded">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{usr.email}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-[#090b10] border border-[#1b202c]">
                          Ref: {usr.kodeRef}
                        </span>
                      </div>

                      {/* Balances Display */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e2330]">
                        <div className="p-2.5 rounded-2xl bg-[#080a0f] border border-[#1b202c]">
                          <span className="text-[10px] text-slate-400 block">Saldo Kas:</span>
                          <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block truncate">
                            {formatRupiah(usr.saldo)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-[#080a0f] border border-[#1b202c]">
                          <span className="text-[10px] text-slate-400 block">Saldo Emas:</span>
                          <span className="text-xs font-black text-[#ffd700] font-mono mt-0.5 block truncate">
                            {userGrams.toFixed(2)} gr
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono block truncate">
                            ≈ {formatRupiah(userGoldVal)}
                          </span>
                        </div>
                      </div>

                      {/* Gold Holdings Brand Chips */}
                      {usr.emas && usr.emas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {usr.emas.map((h) => (
                            <span
                              key={h.jenis}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#161a25] text-amber-200/80 border border-[#242b3d]"
                            >
                              {h.jenis}: {h.gram.toFixed(2)}g
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => setSelectedUserForDetail(usr)}
                          className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors text-center"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => {
                            setAdjustModalUser(usr.uid);
                            setAdjustType('cash');
                            setAdjustAmount('500000');
                            setAdjustNote('Bonus / Penyesuaian saldo admin');
                          }}
                          className="py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#ffd700] text-[11px] font-bold border border-amber-500/30 transition-colors text-center"
                        >
                          Ubah Saldo
                        </button>

                        <button
                          onClick={() => {
                            setActiveChatUserId(usr.uid);
                            setActiveTab('chat');
                          }}
                          className="py-1.5 px-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[11px] font-bold border border-blue-500/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-8 rounded-3xl bg-[#0f121a] border border-[#212738] text-center text-slate-400 text-xs">
                  Tidak ditemukan nasabah yang sesuai dengan kata kunci "{userSearchQuery}".
                </div>
              )}
            </div>
          );
        })()}

        {/* ================================================================= */}
        {/* TAB 4: MARKET PRICE SETTING & FLUCTUATION */}
        {/* ================================================================= */}
        {activeTab === 'market' && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="p-6 rounded-3xl bg-[#0f121a] border border-[#252c3d] shadow-2xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#ffd700]" />
                  <span>Pengaturan Kuotasi Harga Pasar Emas</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Atur harga dasar emas fisik per gram. Harga Beli dan Jual nasabah akan dihitung otomatis sesuai spread standar.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#090b10] border border-[#202534] text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Harga Dasar</span>
                  <span className="text-sm font-black text-white font-mono mt-0.5 block">
                    {formatRupiah(hargaDasar)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Harga Beli Nasabah (+2.5%)</span>
                  <span className="text-sm font-black text-[#ffd700] font-mono mt-0.5 block">
                    {formatRupiah(hargaBeli)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Harga Jual Nasabah (-2.5%)</span>
                  <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">
                    {formatRupiah(hargaJual)}
                  </span>
                </div>
              </div>

              {/* Quick % adjustment buttons */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">Penyesuaian Cepat:</span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handlePriceChange(2)}
                    className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1 border border-emerald-500/30"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> +2%
                  </button>
                  <button
                    onClick={() => handlePriceChange(1)}
                    className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1 border border-emerald-500/30"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> +1%
                  </button>
                  <button
                    onClick={() => handlePriceChange(-1)}
                    className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-xs flex items-center justify-center gap-1 border border-rose-500/30"
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> -1%
                  </button>
                  <button
                    onClick={() => handlePriceChange(-2)}
                    className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-xs flex items-center justify-center gap-1 border border-rose-500/30"
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> -2%
                  </button>
                </div>
              </div>

              {/* Set Manual Absolute Price */}
              <div className="space-y-2 pt-2 border-t border-[#1e2332]">
                <label className="text-xs text-slate-300 font-semibold block">
                  Ketik Harga Dasar Manual (Rp/gram):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="flex-1 bg-[#090b10] border border-[#272d3e] rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold outline-none focus:border-[#ffd700]"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(customPrice, 10);
                      if (val > 100000) {
                        adminSetPrice(val);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs shadow-md"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Live Price Simulation Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#090b10] border border-[#202534] pt-3">
                <div>
                  <span className="text-xs font-bold text-white block">Simulasi Fluktuasi Pasar Realtime</span>
                  <span className="text-[11px] text-slate-400 block">
                    Harga bergerak mikro setiap 4 detik untuk mensimulasikan pasar live
                  </span>
                </div>
                <button
                  onClick={togglePriceFluctuation}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    isPriceFluctuating
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPriceFluctuating ? '✓ AKTIF' : 'NONAKTIF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: ALL TRANSACTIONS AUDIT LOG */}
        {/* ================================================================= */}
        {activeTab === 'logs' && (() => {
          const filteredLogs = allLogs.filter((log) => {
            if (logTypeFilter !== 'all' && log.jenis !== logTypeFilter) return false;
            if (logStatusFilter !== 'all' && log.status !== logStatusFilter) return false;
            if (logSearchQuery.trim()) {
              const q = logSearchQuery.toLowerCase();
              const matchUser = (log.namaUser || '').toLowerCase().includes(q) || (log.emailUser || '').toLowerCase().includes(q);
              const matchId = (log.id || '').toLowerCase().includes(q);
              const matchText = (log.teks || '').toLowerCase().includes(q);
              if (!matchUser && !matchId && !matchText) return false;
            }
            return true;
          });

          return (
            <div className="space-y-4">
              <div className="bg-[#0f121a] p-4 rounded-2xl border border-[#212738] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#ffd700]" />
                      <span>Log Seluruh Riwayat Mutasi & Transaksi Nasabah</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Audit mutasi deposit, penarikan, pembelian emas, dividen harian, dan bonus admin secara real-time.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#ffd700] px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    {filteredLogs.length} dari {allLogs.length} Transaksi
                  </span>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[#1e2330]">
                  {/* Jenis filter chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'deposit', label: 'Deposit' },
                      { id: 'tarik', label: 'Penarikan' },
                      { id: 'beli', label: 'Beli Emas' },
                      { id: 'jual', label: 'Jual Emas' },
                      { id: 'untung', label: 'Dividen 3%' },
                      { id: 'bonus', label: 'Bonus / Admin' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setLogTypeFilter(f.id as any)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                          logTypeFilter === f.id
                            ? 'bg-[#ffd700] text-black shadow'
                            : 'bg-[#151924] text-slate-400 hover:text-white border border-[#242b3d]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Status filter & Search */}
                  <div className="flex items-center gap-2">
                    <select
                      value={logStatusFilter}
                      onChange={(e) => setLogStatusFilter(e.target.value as any)}
                      className="bg-[#090b10] border border-[#262c3e] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ffd700]"
                    >
                      <option value="all">Semua Status</option>
                      <option value="menunggu">Menunggu</option>
                      <option value="disetujui">Disetujui / Sukses</option>
                      <option value="ditolak">Ditolak</option>
                    </select>

                    <div className="relative w-44">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                        <Search className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        placeholder="Cari TRX ID/User..."
                        className="w-full bg-[#090b10] border border-[#262c3e] text-xs text-white rounded-xl pl-7 pr-2.5 py-1.5 outline-none focus:border-[#ffd700]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-[#0f121a] border border-[#23293a] rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#090b10] text-[10px] uppercase font-bold text-slate-400 border-b border-[#212738]">
                      <tr>
                        <th className="p-3.5">ID & Waktu</th>
                        <th className="p-3.5">Nasabah</th>
                        <th className="p-3.5">Jenis Transaksi</th>
                        <th className="p-3.5">Rincian Nominal</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Tindakan Langsung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b202c]">
                      {filteredLogs.map((log) => {
                        const isPending = log.status === 'menunggu';
                        const isApproved = log.status === 'disetujui';
                        const isRejected = log.status === 'ditolak';

                        return (
                          <tr key={log.id} className="hover:bg-[#141823] transition-colors">
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-mono text-[11px] text-slate-400 block font-semibold">{log.id}</span>
                              <span className="text-[10px] text-slate-500">{formatDateTime(log.waktu)}</span>
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => {
                                  const targetUser = allUsers.find((u) => u.uid === log.uid);
                                  if (targetUser) setSelectedUserForDetail(targetUser);
                                }}
                                className="text-left group"
                              >
                                <div className="font-bold text-white group-hover:text-[#ffd700] transition-colors">
                                  {log.namaUser}
                                </div>
                                <div className="text-[10px] text-slate-400">{log.emailUser}</div>
                              </button>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full border ${
                                  log.jenis === 'deposit'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : log.jenis === 'tarik'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                    : log.jenis === 'beli'
                                    ? 'bg-amber-500/10 text-[#ffd700] border-amber-500/30'
                                    : log.jenis === 'jual'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                    : log.jenis === 'untung'
                                    ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                }`}
                              >
                                {log.jenis}
                              </span>
                              <div className="text-[11px] text-slate-400 mt-1 max-w-xs line-clamp-1">
                                {log.teks}
                              </div>
                            </td>
                            <td className="p-3.5 font-mono">
                              <div className="font-bold text-white">{formatRupiah(log.jumlah)}</div>
                              {log.detail?.gram !== undefined && log.detail.gram > 0 && (
                                <div className="text-[11px] text-[#ffd700] font-semibold">
                                  {formatGrams(log.detail.gram)} {log.detail.merk ? `(${log.detail.merk})` : ''}
                                </div>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                                  isApproved
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isPending
                                    ? 'bg-amber-500/15 text-[#ffd700] border border-amber-500/30 animate-pulse'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              {isPending ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Masukkan alasan penolakan transaksi:');
                                      if (reason) {
                                        adminRejectTransaction(log.id, reason);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors"
                                    title="Tolak Transaksi"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Setujui transaksi ${log.id} (${formatRupiah(log.jumlah)})?`)) {
                                        adminApproveTransaction(log.id);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-extrabold transition-colors flex items-center gap-1 shadow-sm"
                                    title="Setujui Transaksi"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-mono">Tuntas</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredLogs.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada catatan transaksi yang sesuai dengan filter pencarian.
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ================================================================= */}
        {/* TAB 6: LIVE CHAT SUPPORT DENGAN NASABAH */}
        {/* ================================================================= */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0f121a] p-4 rounded-2xl border border-[#212738]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Pusat Layanan Live Chat Nasabah (24/7)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE & REAL-TIME
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Balas pesan, berikan panduan deposit/penarikan, dan tanggapi pertanyaan nasabah secara instan.
                </p>
              </div>

              {adminTotalUnreadCount > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{adminTotalUnreadCount} Pesan Belum Dibalas</span>
                </div>
              )}
            </div>

            <AdminLiveChat
              onOpenAdjustBalance={(uid) => {
                setAdjustModalUser(uid);
                setAdjustType('cash');
              }}
              initialUserId={activeChatUserId}
            />
          </div>
        )}
      </main>
    </div>
  );
};

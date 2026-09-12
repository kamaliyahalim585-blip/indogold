import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import {
  LogIn,
  UserPlus,
  Sparkles,
  Gift,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Coins,
  ArrowRight,
  KeyRound,
  Zap,
  MessageSquare
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess }) => {
  const { login, register, resetPassword } = useGold();
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRefCode, setRegRefCode] = useState('');
  const [regError, setRegError] = useState('');

  const handleQuickFill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('123456');
    setLoginError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await login(loginEmail, loginPassword);
      setIsSubmitting(false);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        if (onSuccess) onSuccess();
      }
    } catch {
      setIsSubmitting(false);
      setLoginError('Terjadi gangguan jaringan saat memverifikasi akun.');
    }
  };

  const handleResetPassword = async () => {
    if (!loginEmail.trim()) {
      setLoginError('Silakan ketikkan alamat email terlebih dahulu.');
      return;
    }
    const newPass = loginPassword.trim() || '123456';
    setIsSubmitting(true);
    try {
      const res = await resetPassword(loginEmail, newPass);
      setIsSubmitting(false);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        if (onSuccess) onSuccess();
      }
    } catch {
      setIsSubmitting(false);
      setLoginError('Terjadi kesalahan saat mereset kata sandi.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsSubmitting(true);

    try {
      const res = await register(regName, regEmail, regPassword, regRefCode);
      setIsSubmitting(false);
      if (!res.success) {
        setRegError(res.message);
      } else {
        if (onSuccess) onSuccess();
      }
    } catch {
      setIsSubmitting(false);
      setRegError('Terjadi kesalahan koneksi server.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-4 px-2 space-y-5 animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center pt-2 pb-1">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-[#ffd700] to-yellow-200 text-black font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/20 ring-4 ring-[#ffd700]/10">
          IG
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-[#ffd700] via-[#f7e07a] to-[#d4af37] bg-clip-text text-transparent">
          IndoGold Official
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Platform Investasi, Beli, Jual & Tabungan Emas Digital Resmi Terpercaya
        </p>
      </div>

      {/* Main Auth Container Card */}
      <div className="bg-[#12151e] border border-[#242938] rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Modern Segmented Navigation Bar */}
        <div className="grid grid-cols-2 p-1 bg-[#0c0e14] rounded-2xl border border-[#1e2330]">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setLoginError('');
              setRegError('');
            }}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              !isRegisterMode
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Halaman Masuk (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setLoginError('');
              setRegError('');
            }}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              isRegisterMode
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pendaftaran Baru</span>
          </button>
        </div>

        {/* ======================= LOGIN FORM ======================= */}
        {!isRegisterMode ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Masuk ke Akun Anda</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Masukkan email dan kata sandi akun IndoGold yang telah terdaftar
              </p>
            </div>

            {/* Quick Fill Registered Accounts */}
            <div className="p-2.5 rounded-2xl bg-[#0e111a] border border-[#1e2334] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#ffd700]" />
                  <span>Akun Siap Pakai (1-Klik Isi):</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Sandi: 123456</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('kamaliyahalim585@gmail.com')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#161c2c] hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400/50 text-[11px] text-amber-300 font-medium transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="font-bold">kamaliyahalim585@gmail.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('khoirulanisss@gmail.com')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#161c2c] hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400/50 text-[11px] text-slate-200 font-medium transition-all cursor-pointer"
                >
                  khoirulanisss@gmail.com
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-[#0c0e14] border border-[#272d3e] text-xs font-medium text-white rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full bg-[#0c0e14] border border-[#272d3e] text-xs font-medium text-white rounded-xl pl-9 pr-10 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    {loginError}
                  </div>

                  {loginError.toLowerCase().includes('sandi') && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#ffd700]" />
                      <span>Atur Sandi Ini & Masuk Langsung</span>
                    </button>
                  )}

                  {loginError.toLowerCase().includes('tidak ditemukan') && (
                    <button
                      type="button"
                      onClick={() => {
                        setRegEmail(loginEmail.trim());
                        setRegPassword(loginPassword.trim() || '123456');
                        setIsRegisterMode(true);
                        setLoginError('');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Daftarkan Email Ini Sekarang (Bonus Rp 20.000)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ffd700]" />
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Portofolio Emas'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center space-y-2">
              <div>
                <span className="text-xs text-slate-400">Belum memiliki akun IndoGold? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setLoginError('');
                  }}
                  className="text-xs font-bold text-[#ffd700] hover:underline cursor-pointer"
                >
                  Daftar Akun Baru Sekarang
                </button>
              </div>

              <div className="pt-2 border-t border-[#1e2330]">
                <button
                  type="button"
                  onClick={() => {
                    const btn = document.getElementById('open-live-chat-fab');
                    if (btn) btn.click();
                  }}
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>Butuh Bantuan? Buka <strong>Live Chat CS 24/7</strong></span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ======================= REGISTER FORM ======================= */
          <div className="space-y-4">
            {/* Automatic Bonus Saldo Notice */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-yellow-950/40 to-amber-900/30 border border-amber-500/40 space-y-1.5 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffd700] animate-pulse" />
                <h3 className="text-xs font-black text-[#ffd700] tracking-wide">
                  🎁 BONUS SALDO LANGSUNG MASUK
                </h3>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Daftar sekarang & dapatkan <strong className="text-[#ffd700]">Bonus Saldo Rp 20.000</strong> otomatis masuk ke platform.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-amber-300 font-semibold border-t border-amber-500/20">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Pakai kode referral: Tambahan saldo Rp 10.000 (Total Rp 30.000) & pengundang dapat Rp 15.000!</span>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Nama Lengkap (Sesuai KTP/Buku Tabungan)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Yusuf"
                    className="w-full bg-[#0c0e14] border border-[#272d3e] text-xs font-medium text-white rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Alamat Email Aktif
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-[#0c0e14] border border-[#272d3e] text-xs font-medium text-white rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Buat Kata Sandi (Minimal 6 karakter)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-[#0c0e14] border border-[#272d3e] text-xs font-medium text-white rounded-xl pl-9 pr-10 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Kode Referral Rekan / Teman (Opsional)</span>
                  <span className="text-[10px] text-[#ffd700] font-semibold">+Komisi Teman Rp 10.000</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Gift className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    value={regRefCode}
                    onChange={(e) => setRegRefCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: KAMA88 atau KODE TEMAN"
                    className="w-full bg-[#0c0e14] border border-[#272d3e] text-xs font-bold uppercase text-[#ffd700] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all placeholder:normal-case placeholder:font-normal placeholder:text-slate-500"
                  />
                </div>
              </div>

              {regError && (
                <div className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 animate-in fade-in">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? 'Mendaftarkan Akun...'
                    : regRefCode.trim()
                    ? 'Daftar & Klaim Saldo Rp 30.000'
                    : 'Daftar & Klaim Saldo Rp 20.000'}
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center">
              <span className="text-xs text-slate-400">Sudah memiliki akun? </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setRegError('');
                }}
                className="text-xs font-bold text-[#ffd700] hover:underline"
              >
                Masuk ke Akun
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

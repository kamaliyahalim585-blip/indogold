import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { LogIn, UserPlus, Sparkles, Gift } from 'lucide-react';

interface AuthModalProps {
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register } = useGold();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRefCode, setRegRefCode] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        if (onClose) onClose();
      }
    } catch {
      setLoginError('Terjadi kesalahan saat masuk.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    try {
      const res = await register(regName, regEmail, regPassword, regRefCode);
      if (!res.success) {
        setRegError(res.message);
      } else {
        if (onClose) onClose();
      }
    } catch {
      setRegError('Gagal menghubungkan ke server.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 py-8 max-w-sm mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-[#ffd700] to-yellow-200 text-black font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/20">
          IG
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-[#ffd700] via-[#f7e07a] to-[#d4af37] bg-clip-text text-transparent">
          IndoGold
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Investasi & Perdagangan Emas Digital Resmi Terpercaya
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-[#131620] border border-[#232733] rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Toggle Mode */}
        <div className="grid grid-cols-2 p-1 bg-[#0c0e14] rounded-2xl border border-[#1e2330]">
          <button
            onClick={() => {
              setIsRegisterMode(false);
              setLoginError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegisterMode
                ? 'bg-[#ffd700] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Masuk Akun
          </button>
          <button
            onClick={() => {
              setIsRegisterMode(true);
              setRegError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              isRegisterMode
                ? 'bg-[#ffd700] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* LOGIN FORM */}
        {!isRegisterMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-semibold mb-1">Kata Sandi</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:opacity-95 transition-opacity"
            >
              Masuk Sekarang
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-300 font-semibold mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-semibold mb-1">Kata Sandi</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                Kode Referral Teman (Opsional)
              </label>
              <input
                type="text"
                value={regRefCode}
                onChange={(e) => setRegRefCode(e.target.value.toUpperCase())}
                placeholder="Contoh: INDOGOLD"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-bold uppercase text-[#ffd700] rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Kode referral bersifat opsional.
              </span>
            </div>

            {regError && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {regError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:opacity-95 transition-opacity"
            >
              Daftar Akun Resmi
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { formatRupiah, formatDateTime, formatGrams } from '../utils/formatters';
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
  AlertCircle
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const {
    allUsers,
    transactions,
    hargaDasar,
    adminApproveTransaction,
    adminRejectTransaction,
    adminAdjustBalance,
    adminSetPrice,
    togglePriceFluctuation,
    isPriceFluctuating,
    hitungTotalNilaiEmas,
    hitungTotalGramEmas
  } = useGold();

  const [activeTab, setActiveTab] = useState<'deposit' | 'tarik' | 'users' | 'market'>('deposit');
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; title: string } | null>(null);

  // Balance adjustment modal state
  const [adjustModalUser, setAdjustModalUser] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('500000');
  const [adjustNote, setAdjustNote] = useState<string>('Bonus loyalitas admin');

  // Market manual price state
  const [customPrice, setCustomPrice] = useState<string>(hargaDasar.toString());

  const pendingDeposits = transactions.filter((t) => t.jenis === 'deposit' && t.status === 'menunggu');
  const pendingWithdrawals = transactions.filter((t) => t.jenis === 'tarik' && t.status === 'menunggu');

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;
    const val = parseFloat(adjustAmount) || 0;
    if (val === 0) return;

    adminAdjustBalance(adjustModalUser, val, adjustNote);
    setAdjustModalUser(null);
  };

  const handlePriceChange = (pct: number) => {
    const updated = Math.round(hargaDasar * (1 + pct / 100) / 100) * 100;
    adminSetPrice(updated);
    setCustomPrice(updated.toString());
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#151924] border border-[#272f42] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-[#ffd700] border border-[#ffd700]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Panel Pengelola Admin
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                SUPERADMIN
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Verifikasi deposit, penarikan, nasabah & harga</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ke Aplikasi</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#131620] border border-[#232733] rounded-2xl">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-colors relative ${
            activeTab === 'deposit'
              ? 'bg-[#ffd700] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Deposit
          {pendingDeposits.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tarik')}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-colors relative ${
            activeTab === 'tarik'
              ? 'bg-[#ffd700] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tarik
          {pendingWithdrawals.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'users'
              ? 'bg-[#ffd700] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pengguna ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('market')}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'market'
              ? 'bg-[#ffd700] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Harga Pasar
        </button>
      </div>

      {/* TAB 1: DEPOSITS */}
      {activeTab === 'deposit' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Menampilkan Antrian Deposit Menunggu</span>
            <span className="font-bold text-[#ffd700]">{pendingDeposits.length} Permintaan</span>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[#13161f] border border-[#232733] p-6">
              <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Semua Permintaan Deposit Sudah Diproses</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tidak ada deposit yang menunggu persetujuan admin saat ini.
              </p>
            </div>
          ) : (
            pendingDeposits.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#131722] border border-[#262c3e] border-l-4 border-l-emerald-500 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                    <h4 className="text-xs font-bold text-white">{item.namaUser}</h4>
                    <p className="text-[11px] text-slate-400">{item.emailUser}</p>
                    <p className="text-xs text-emerald-400 font-semibold mt-1">{item.teks}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white">{formatRupiah(item.jumlah)}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {formatDateTime(item.waktu)}
                    </span>
                  </div>
                </div>

                {/* Proof image if attached */}
                {item.buktiFoto ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0c0e14] border border-[#202534]">
                    <img
                      src={item.buktiFoto}
                      alt="Struk Deposit"
                      className="w-14 h-14 rounded-lg object-cover border border-[#2c3446] cursor-pointer hover:opacity-90"
                      onClick={() =>
                        setSelectedReceipt({ url: item.buktiFoto!, title: `Bukti Deposit: ${item.namaUser}` })
                      }
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">Struk Pembayaran Terlampir</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReceipt({ url: item.buktiFoto!, title: `Bukti Deposit: ${item.namaUser}` })
                        }
                        className="text-[11px] text-[#ffd700] hover:underline font-bold flex items-center gap-1 mt-0.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Klik untuk Perbesar Gambar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>User mentransfer tanpa menyertakan lampiran foto struk</span>
                  </div>
                )}

                {/* Approve / Reject Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      const reason = prompt('Masukkan alasan penolakan (opsional):', 'Bukti transfer tidak valid');
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
                      if (confirm(`Setujui deposit Rp ${item.jumlah.toLocaleString('id-ID')} untuk ${item.namaUser}?`)) {
                        adminApproveTransaction(item.id);
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Setujui (+ Saldo)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: WITHDRAWALS */}
      {activeTab === 'tarik' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Menampilkan Antrian Penarikan Dana</span>
            <span className="font-bold text-rose-400">{pendingWithdrawals.length} Permintaan</span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[#13161f] border border-[#232733] p-6">
              <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Semua Penarikan Telah Diproses</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tidak ada permintaan pencairan dana yang tertunda.
              </p>
            </div>
          ) : (
            pendingWithdrawals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#131722] border border-[#262c3e] border-l-4 border-l-rose-500 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                    <h4 className="text-xs font-bold text-white">{item.namaUser}</h4>
                    <p className="text-[11px] text-slate-400">{item.emailUser}</p>
                    <p className="text-xs text-rose-300 font-semibold mt-1">{item.teks}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white">{formatRupiah(item.jumlah)}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {formatDateTime(item.waktu)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0c0e14] border border-[#202534] text-xs space-y-1">
                  <div className="text-slate-400">
                    Tujuan Transfer: <b className="text-white">{item.detail?.metode}</b>
                  </div>
                  <div className="text-slate-400">
                    Nomor Rekening/HP: <b className="text-[#ffd700] font-mono">{item.detail?.nomorTujuan}</b>
                  </div>
                  <div className="text-slate-400">
                    Nama Penerima: <b className="text-white">{item.detail?.namaTujuan}</b>
                  </div>
                </div>

                {/* Approve / Reject Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      const reason = prompt(
                        'Alasan penolakan penarikan (dana akan dikembalikan ke saldo nasabah):',
                        'Nomor rekening tidak cocok / bank gangguan'
                      );
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
                          `Konfirmasi dana Rp ${item.jumlah.toLocaleString('id-ID')} sudah ditransfer ke ${
                            item.detail?.nomorTujuan
                          }?`
                        )
                      ) {
                        adminApproveTransaction(item.id);
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Setujui (Sudah Ditransfer)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 px-1">
            Daftar seluruh nasabah terdaftar di database IndoGold
          </div>

          <div className="space-y-2">
            {allUsers.map((u) => {
              const uGram = hitungTotalGramEmas(u);
              const uGoldVal = hitungTotalNilaiEmas(u);
              return (
                <div
                  key={u.uid}
                  className="p-3.5 rounded-2xl bg-[#131620] border border-[#232733] flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{u.nama}</span>
                      {u.isAdmin && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1 rounded font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Ref: <b className="text-[#ffd700] font-mono">{u.kodeRef}</b></span>
                      <span>•</span>
                      <span>Emas: <b className="text-white">{formatGrams(uGram)} gr</b></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-emerald-400">
                      {formatRupiah(u.saldo)}
                    </div>
                    <button
                      onClick={() => setAdjustModalUser(u.uid)}
                      className="mt-1.5 px-2.5 py-1 rounded-lg bg-[#1f2638] hover:bg-[#2a344c] border border-[#2e3954] text-[10px] font-bold text-[#ffd700] transition-colors"
                    >
                      ± Atur Saldo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MARKET PRICE SETTINGS */}
      {activeTab === 'market' && (
        <div className="bg-[#131620] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Pengaturan Harga Pasar Emas
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ubah harga acuan dasar emas yang berpengaruh langsung ke harga beli dan buyback semua nasabah.
            </p>
          </div>

          {/* Current base price */}
          <div className="p-3.5 rounded-xl bg-[#0c0f16] border border-[#242b3c] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Harga Acuan Emas Saat Ini</span>
              <div className="text-xl font-black text-[#ffd700] mt-0.5">
                {formatRupiah(hargaDasar)}/gr
              </div>
            </div>

            <button
              onClick={togglePriceFluctuation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                isPriceFluctuating
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isPriceFluctuating ? '● Fluktuasi ON' : '○ Fluktuasi OFF'}
            </button>
          </div>

          {/* Quick price adjusters */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">Penyesuaian Cepat:</span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handlePriceChange(1.0)}
                className="py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
              >
                +1.0%
              </button>
              <button
                onClick={() => handlePriceChange(0.5)}
                className="py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
              >
                +0.5%
              </button>
              <button
                onClick={() => handlePriceChange(-0.5)}
                className="py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold"
              >
                -0.5%
              </button>
              <button
                onClick={() => handlePriceChange(-1.0)}
                className="py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold"
              >
                -1.0%
              </button>
            </div>
          </div>

          {/* Custom Price Manual Input */}
          <div className="space-y-2 pt-2 border-t border-[#232733]">
            <label className="block text-xs font-semibold text-slate-300">Setel Harga Manual (Rp)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="1000"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="flex-1 bg-[#0e1118] border border-[#2b3142] text-xs font-bold text-white rounded-xl py-2 px-3 outline-none focus:border-[#ffd700]"
              />
              <button
                onClick={() => {
                  const val = parseFloat(customPrice);
                  if (val > 0) adminSetPrice(val);
                }}
                className="px-4 py-2 rounded-xl bg-[#ffd700] text-black font-bold text-xs hover:opacity-90 shadow-md"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjust Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#151924] border border-[#2b3346] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Sesuaikan Saldo Pengguna</h3>
              <button onClick={() => setAdjustModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Nominal Tambah/Kurang (Rp)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Gunakan tanda minus (-) untuk memotong"
                  className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-bold text-white rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Contoh: 500000 (tambah) atau -100000 (potong)
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Catatan Alasan</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Bonus promosi, kompensasi, koreksi dll"
                  className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-[#ffd700]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#ffd700] text-black font-bold text-xs hover:opacity-90 shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
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

import React, { useState, useRef } from 'react';
import { useGold } from '../context/GoldContext';
import { REKENING_TUJUAN } from '../data/mockData';
import { formatRupiah } from '../utils/formatters';
import {
  ArrowDownToLine,
  QrCode,
  Copy,
  Check,
  UploadCloud,
  FileImage,
  AlertCircle,
  Clock,
  ShieldCheck,
  X,
  Building2,
  Smartphone
} from 'lucide-react';

interface DepositPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const DepositPage: React.FC<DepositPageProps> = ({ onSuccess, onBack }) => {
  const { currentUser, submitDeposit } = useGold();

  const [jumlah, setJumlah] = useState<string>('250000');
  const [selectedMetodeId, setSelectedMetodeId] = useState<string>('permata');
  const [namaPengirim, setNamaPengirim] = useState<string>(currentUser?.nama || '');
  const [nomorPengirim, setNomorPengirim] = useState<string>('');
  const [buktiImage, setBuktiImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedMetode = REKENING_TUJUAN.find((r) => r.id === selectedMetodeId) || REKENING_TUJUAN[0];
  const nominalNum = parseFloat(jumlah) || 0;

  const quickNominals = [50000, 100000, 250000, 500000, 1000000, 2500000];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPG, PNG, WebP) yang didukung.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBuktiImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nominalNum < 10000) {
      alert('Minimal deposit Rp 10.000');
      return;
    }
    if (!namaPengirim.trim() || !nomorPengirim.trim()) {
      alert('Lengkapi nama dan nomor rekening/HP pengirim');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitDeposit({
        jumlah: nominalNum,
        metode: selectedMetode.nama,
        namaPengirim,
        nomorPengirim,
        buktiFoto: buktiImage || undefined
      });

      setIsSubmitting(false);
      if (res.success) {
        onSuccess();
      }
    } catch {
      setIsSubmitting(false);
      alert('Terjadi kesalahan saat memproses deposit.');
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
            Deposit Saldo IndoGold
          </h2>
          <p className="text-xs text-slate-400">Transfer ke rekening resmi IndoGold untuk isi saldo kas</p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
        >
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Nominal */}
        <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            1. Tentukan Nominal Deposit
          </label>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">
              Rp
            </span>
            <input
              type="number"
              min="10000"
              step="1000"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Contoh: 100000"
              className="w-full bg-[#0e1118] border border-[#2b3142] focus:border-emerald-400 text-lg font-bold text-white rounded-xl py-2.5 pl-10 pr-3 outline-none"
              required
            />
          </div>

          {/* Quick Nominal Pills */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {quickNominals.map((nom) => (
              <button
                type="button"
                key={nom}
                onClick={() => setJumlah(nom.toString())}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                  nominalNum === nom
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                    : 'bg-[#141822] text-slate-300 border-[#252b3a] hover:border-slate-500'
                }`}
              >
                {formatRupiah(nom)}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Payment Method */}
        <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            2. Pilih Metode Pembayaran
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {REKENING_TUJUAN.map((rek) => {
              const isSelected = rek.id === selectedMetodeId;
              const isBank = rek.tipe === 'bank';
              return (
                <button
                  type="button"
                  key={rek.id}
                  onClick={() => setSelectedMetodeId(rek.id)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/40'
                      : 'bg-[#0e1118] border-[#202534] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg ${isBank ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {isBank ? <Building2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isBank ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    }`}>
                      {isBank ? 'Transfer Bank' : 'E-Wallet'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{rek.nama}</div>
                  <div className="text-[11px] font-mono text-[#ffd700] mt-0.5 font-semibold truncate">{rek.no}</div>
                </button>
              );
            })}
          </div>

          {/* Destination Account Card with Copy Button */}
          <div className="p-3.5 rounded-xl bg-[#0c0f16] border border-[#2c3344] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Rekening Resmi Tujuan:</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Penerima Terverifikasi
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#141824] border border-[#252c3e] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {selectedMetode.tipe === 'bank' ? 'Nomor Rekening Bank Permata' : 'Nomor Akun OVO'}
                  </span>
                  <div className="text-lg font-black font-mono text-white tracking-wider mt-0.5">
                    {selectedMetode.no}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedMetode.no)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-md active:scale-95 shrink-0 mt-0.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#202636] flex items-center justify-between text-xs">
                <span className="text-slate-400">Atas Nama (A.n):</span>
                <span className="font-bold text-[#ffd700] text-right">
                  {selectedMetode.an}
                </span>
              </div>
            </div>

            {/* Instruction list */}
            <div className="text-[11px] text-slate-400 space-y-1.5 pt-1">
              <span className="font-semibold text-slate-300">Petunjuk Transfer:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-relaxed">
                {selectedMetode.instruksi.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step 3: Sender details & Upload Proof */}
        <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-lg space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            3. Data Pengirim & Bukti Transfer
          </label>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Pemilik Rekening Pengirim</label>
              <input
                type="text"
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
                placeholder="Nama sesuai buku tabungan / e-wallet"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nomor Rekening / HP Pengirim</label>
              <input
                type="text"
                value={nomorPengirim}
                onChange={(e) => setNomorPengirim(e.target.value)}
                placeholder="0812xxxx atau nomor rekening pengirim"
                className="w-full bg-[#0e1118] border border-[#2b3142] text-xs font-semibold text-white rounded-xl p-2.5 outline-none focus:border-emerald-400"
                required
              />
            </div>
          </div>

          {/* Upload Proof Area */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Unggah Struk / Bukti Transfer</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!buktiImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2f374c] hover:border-emerald-400/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#0e1118]"
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-200">Klik untuk upload foto bukti transfer</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Format JPG, PNG, atau screenshot HP</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-[#2c3344] bg-[#0c0e14] p-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={buktiImage}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-[#252c3c]"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white">Bukti Pembayaran Terpasang</p>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Siap diverifikasi admin
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBuktiImage(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || nominalNum < 10000}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-95 active:scale-98 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
          <span>Kirim Permintaan Deposit — {formatRupiah(nominalNum)}</span>
        </button>

        <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Verifikasi diproses otomatis oleh Admin IndoGold dalam 1–5 menit</span>
        </p>
      </form>
    </div>
  );
};

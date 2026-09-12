import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserAccount, Transaction, GoldBrandId, GoldProduct } from '../types/gold';
import {
  INITIAL_USERS,
  INITIAL_PRICE_POINTS,
  DAFTAR_EMAS,
  BONUS_PENDAFTARAN,
  BONUS_REFERRAL_USER,
  BONUS_REFERRAL_PENGUNDANG
} from '../data/mockData';
import { generateId, generateReferralCode } from '../utils/formatters';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import confetti from 'canvas-confetti';

const STORAGE_CURRENT_USER_KEY = 'indogold_auth_uid_v2';
const STORAGE_PRICE_KEY = 'indogold_base_price_v2';
const STORAGE_PRICE_HISTORY_KEY = 'indogold_price_history_v2';

export const PERSEN_UNTUNG_HARIAN = 0.03; // 3% dividen harian

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface GoldContextType {
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  transactions: Transaction[];
  userTransactions: Transaction[];
  hargaDasar: number;
  riwayatHarga: { label: string; harga: number; waktu: string }[];
  perubahanPersen: number;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  // Auth
  login: (email: string, sandi: string) => { success: boolean; message: string };
  register: (nama: string, email: string, sandi: string, kodeRef?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchUser: (uid: string) => void;
  // Trading
  buyGold: (brandId: GoldBrandId, gram: number) => Promise<{ success: boolean; message: string }>;
  sellGold: (brandId: GoldBrandId, gram: number) => Promise<{ success: boolean; message: string }>;
  // Finance
  submitDeposit: (data: {
    jumlah: number;
    metode: string;
    namaPengirim: string;
    nomorPengirim: string;
    buktiFoto?: string;
  }) => Promise<{ success: boolean; message: string }>;
  submitWithdraw: (data: {
    jumlah: number;
    metode: string;
    namaTujuan: string;
    nomorTujuan: string;
  }) => Promise<{ success: boolean; message: string }>;
  claimDailyProfit: () => Promise<{ success: boolean; amount: number; message: string }>;
  canClaimProfit: boolean;
  // Admin Operations
  adminApproveTransaction: (trxId: string) => Promise<{ success: boolean; message: string }>;
  adminRejectTransaction: (trxId: string, alasan?: string) => Promise<{ success: boolean; message: string }>;
  adminAdjustBalance: (uid: string, delta: number, note?: string) => Promise<{ success: boolean; message: string }>;
  adminSetPrice: (newPrice: number) => void;
  togglePriceFluctuation: () => void;
  isPriceFluctuating: boolean;
  resetToFactoryData: () => Promise<void>;
  // Calculations
  hitungTotalNilaiEmas: (user?: UserAccount | null) => number;
  hitungTotalGramEmas: (user?: UserAccount | null) => number;
  getBrandInfo: (brandId: GoldBrandId) => GoldProduct;
}

const GoldContext = createContext<GoldContextType | undefined>(undefined);

export const GoldProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cloud Database state synchronized with Firestore
  const [allUsers, setAllUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [currentUid, setCurrentUid] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_CURRENT_USER_KEY) || null;
    } catch {
      return null;
    }
  });

  const [hargaDasar, setHargaDasar] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRICE_KEY);
      return saved ? Number(saved) : 1088500;
    } catch {
      return 1088500;
    }
  });

  const [riwayatHarga, setRiwayatHarga] = useState<{ label: string; harga: number; waktu: string }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRICE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRICE_POINTS;
    } catch {
      return INITIAL_PRICE_POINTS;
    }
  });

  const [isPriceFluctuating, setIsPriceFluctuating] = useState<boolean>(true);
  const [toast, setToast] = useState<Toast | null>(null);

  // 1. Synchronize users from Firestore in real-time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (snapshot.empty) {
          // Initialize master admin in Firestore on first run
          const masterAdmin = INITIAL_USERS[0];
          setDoc(doc(db, 'users', masterAdmin.uid), masterAdmin).catch((err) =>
            console.error('Error seeding admin to Firestore:', err)
          );
        } else {
          const list: UserAccount[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as UserAccount);
          });
          setAllUsers(list);
        }
      },
      (error) => {
        console.warn('Firestore users snapshot listener error (falling back to local):', error);
      }
    );

    return () => unsub();
  }, []);

  // 2. Synchronize transactions from Firestore in real-time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Transaction);
        });
        // Sort descending by time
        list.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
        setTransactions(list);
      },
      (error) => {
        console.warn('Firestore transactions snapshot listener error:', error);
      }
    );

    return () => unsub();
  }, []);

  // Save active session
  useEffect(() => {
    try {
      if (currentUid) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, currentUid);
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Storage write error', e);
    }
  }, [currentUid]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRICE_KEY, hargaDasar.toString());
      localStorage.setItem(STORAGE_PRICE_HISTORY_KEY, JSON.stringify(riwayatHarga));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }, [hargaDasar, riwayatHarga]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3800);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Market price movement
  useEffect(() => {
    if (!isPriceFluctuating) return;
    const interval = setInterval(() => {
      setHargaDasar((prev) => {
        const delta = Math.round((Math.random() * 3000 - 1500) / 100) * 100;
        const nextPrice = Math.max(950000, Math.min(1350000, prev + delta));
        
        setRiwayatHarga((history) => {
          const updated = [...history];
          const last = updated[updated.length - 1];
          const now = new Date();
          const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          if (updated.length > 20) {
            updated.shift();
          }
          updated[updated.length - 1] = {
            ...last,
            harga: nextPrice,
            waktu: timeLabel
          };
          return updated;
        });

        return nextPrice;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isPriceFluctuating]);

  // Current user object
  const currentUser = allUsers.find((u) => u.uid === currentUid) || null;

  // Filtered transactions for current user
  const userTransactions = transactions
    .filter((t) => (currentUser?.isAdmin ? true : t.uid === currentUid))
    .sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

  // Price change calculation
  const prevPrice = riwayatHarga.length >= 2 ? riwayatHarga[riwayatHarga.length - 2].harga : hargaDasar;
  const perubahanPersen = prevPrice > 0 ? ((hargaDasar - prevPrice) / prevPrice) * 100 : 0;

  // Helper to find brand metadata
  const getBrandInfo = useCallback((brandId: GoldBrandId): GoldProduct => {
    const found = DAFTAR_EMAS.find((p) => p.id === brandId);
    return found || DAFTAR_EMAS[0];
  }, []);

  // Calculate total gold valuation for a user
  const hitungTotalNilaiEmas = useCallback(
    (user: UserAccount | null = currentUser): number => {
      if (!user || !user.emas) return 0;
      return user.emas.reduce((acc, item) => {
        const brand = getBrandInfo(item.jenis);
        const itemPrice = hargaDasar + (brand?.marjinalBeli || 0);
        return acc + item.gram * itemPrice;
      }, 0);
    },
    [currentUser, hargaDasar, getBrandInfo]
  );

  const hitungTotalGramEmas = useCallback(
    (user: UserAccount | null = currentUser): number => {
      if (!user || !user.emas) return 0;
      return user.emas.reduce((acc, item) => acc + item.gram, 0);
    },
    [currentUser]
  );

  // Daily profit claim eligibility
  const todayStr = new Date().toISOString().slice(0, 10);
  const canClaimProfit = !!(currentUser && currentUser.terakhirKeuntungan !== todayStr);

  // Auth: Login
  const login = (email: string, sandi: string) => {
    const user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Email tidak ditemukan di sistem' };
    }
    if (user.sandi !== sandi) {
      return { success: false, message: 'Kata sandi salah. Coba lagi.' };
    }
    setCurrentUid(user.uid);
    showToast(`Selamat datang kembali, ${user.nama}!`, 'success');
    return { success: true, message: 'Berhasil masuk' };
  };

  // Auth: Register (Real starting balance = Rp 0, 0 gram gold)
  const register = async (nama: string, email: string, sandi: string, kodeRef?: string) => {
    if (!nama.trim() || !email.trim() || sandi.length < 6) {
      return { success: false, message: 'Lengkapi data. Kata sandi minimal 6 karakter' };
    }
    const exists = allUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email ini sudah terdaftar. Silakan login' };
    }

    const newUid = 'usr-' + Date.now();
    const newRefCode = generateReferralCode(nama);
    let referrer: UserAccount | undefined;

    if (kodeRef && kodeRef.trim()) {
      const trimmedRef = kodeRef.trim().toUpperCase();
      referrer = allUsers.find((u) => u.kodeRef.toUpperCase() === trimmedRef);
    }

    // 1. Saldo bonus pendaftaran otomatis: Rp 20.000
    // 2. Bonus tambahan jika pakai referral: Rp 10.000 untuk pendaftar + Rp 15.000 untuk pengundang
    let saldoAwal = BONUS_PENDAFTARAN;
    const bonusTrxList: Transaction[] = [];

    // Transaksi bonus pendaftaran untuk pengguna baru
    const trxBonusDaftar: Transaction = {
      id: generateId('TRX'),
      uid: newUid,
      namaUser: nama.trim(),
      emailUser: email.trim(),
      teks: '🎁 Saldo Bonus Pendaftaran Pengguna Baru',
      jumlah: BONUS_PENDAFTARAN,
      jenis: 'bonus',
      status: 'disetujui',
      waktu: new Date().toISOString()
    };
    bonusTrxList.push(trxBonusDaftar);

    let updatedReferrer: UserAccount | undefined;
    let trxBonusReferrer: Transaction | undefined;

    if (referrer) {
      saldoAwal += BONUS_REFERRAL_USER;

      // Transaksi bonus referral untuk pengguna baru
      const trxBonusRefUser: Transaction = {
        id: generateId('TRX'),
        uid: newUid,
        namaUser: nama.trim(),
        emailUser: email.trim(),
        teks: `🎉 Bonus Penggunaan Kode Referral (${referrer.kodeRef})`,
        jumlah: BONUS_REFERRAL_USER,
        jenis: 'bonus',
        status: 'disetujui',
        waktu: new Date().toISOString()
      };
      bonusTrxList.push(trxBonusRefUser);

      // Pemilik referral mendapatkan komisi yang langsung masuk ke saldo
      const referrerNewSaldo = (referrer.saldo || 0) + BONUS_REFERRAL_PENGUNDANG;
      updatedReferrer = {
        ...referrer,
        saldo: referrerNewSaldo
      };

      trxBonusReferrer = {
        id: generateId('TRX'),
        uid: referrer.uid,
        namaUser: referrer.nama,
        emailUser: referrer.email,
        teks: `👥 Komisi Referral — Nasabah Baru: ${nama.trim()}`,
        jumlah: BONUS_REFERRAL_PENGUNDANG,
        jenis: 'bonus',
        status: 'disetujui',
        waktu: new Date().toISOString()
      };
      bonusTrxList.push(trxBonusReferrer);
    }

    const newUser: UserAccount = {
      uid: newUid,
      nama: nama.trim(),
      email: email.trim(),
      sandi,
      saldo: saldoAwal,
      emas: [],
      kodeRef: newRefCode,
      dirujukOleh: referrer ? referrer.kodeRef : undefined,
      terakhirKeuntungan: '',
      daftarPada: new Date().toISOString(),
      isAdmin: false
    };

    try {
      // 1. Simpan user baru ke Firestore
      await setDoc(doc(db, 'users', newUid), newUser);

      // 2. Simpan setiap transaksi bonus ke Firestore
      for (const t of bonusTrxList) {
        await setDoc(doc(db, 'transactions', t.id), t);
      }

      // 3. Jika ada pengundang, perbarui saldo pengundang di Firestore
      if (updatedReferrer && trxBonusReferrer) {
        await updateDoc(doc(db, 'users', updatedReferrer.uid), {
          saldo: updatedReferrer.saldo
        });
      }

      // Update local state
      setAllUsers((prev) => {
        const withoutNew = prev.filter((u) => u.uid !== newUid);
        if (updatedReferrer) {
          return [...withoutNew.map((u) => (u.uid === updatedReferrer!.uid ? updatedReferrer! : u)), newUser];
        }
        return [...withoutNew, newUser];
      });

      setTransactions((prev) => [...bonusTrxList, ...prev]);
      setCurrentUid(newUid);

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      if (referrer) {
        showToast(
          `Pendaftaran berhasil! Bonus pendaftaran Rp 20.000 + Bonus referral Rp 10.000 (Total Rp 30.000) langsung masuk ke akun Anda!`,
          'success'
        );
      } else {
        showToast(
          `Pendaftaran berhasil! Saldo bonus pendaftaran Rp 20.000 langsung masuk ke akun Anda.`,
          'success'
        );
      }
      return { success: true, message: 'Pendaftaran berhasil' };
    } catch (err: unknown) {
      console.error('Error saving user to Firestore:', err);
      // Local fallback
      setAllUsers((prev) => {
        const withoutNew = prev.filter((u) => u.uid !== newUid);
        if (updatedReferrer) {
          return [...withoutNew.map((u) => (u.uid === updatedReferrer!.uid ? updatedReferrer! : u)), newUser];
        }
        return [...withoutNew, newUser];
      });
      setTransactions((prev) => [...bonusTrxList, ...prev]);
      setCurrentUid(newUid);

      showToast(
        `Pendaftaran berhasil! Saldo bonus Rp ${saldoAwal.toLocaleString('id-ID')} telah aktif di platform.`,
        'success'
      );
      return { success: true, message: 'Pendaftaran berhasil' };
    }
  };

  const logout = () => {
    setCurrentUid(null);
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const switchUser = (uid: string) => {
    const target = allUsers.find((u) => u.uid === uid);
    if (target) {
      setCurrentUid(uid);
      showToast(`Beralih ke akun: ${target.nama}`, 'info');
    }
  };

  // Buy Gold (Real trade with real cash balance)
  const buyGold = async (brandId: GoldBrandId, gram: number) => {
    if (!currentUser) return { success: false, message: 'Silakan login terlebih dahulu' };
    if (!gram || gram <= 0) return { success: false, message: 'Masukkan gram emas yang valid' };

    const brand = getBrandInfo(brandId);
    const unitPrice = hargaDasar + brand.marjinalBeli;
    const totalCost = Math.round(unitPrice * gram);

    if (currentUser.saldo < totalCost) {
      return {
        success: false,
        message: `Saldo kas tidak mencukupi! Diperlukan Rp ${totalCost.toLocaleString('id-ID')}, saldo riil Anda Rp ${currentUser.saldo.toLocaleString('id-ID')}. Silakan lakukan deposit terlebih dahulu.`
      };
    }

    // Deduct real cash balance and add gold
    const updatedEmas = [...currentUser.emas];
    const existingIndex = updatedEmas.findIndex((e) => e.jenis === brandId);

    if (existingIndex >= 0) {
      const currentHolding = updatedEmas[existingIndex];
      const newTotalGram = currentHolding.gram + gram;
      const newWeightedAvg =
        (currentHolding.gram * currentHolding.rataRataBeli + gram * unitPrice) / newTotalGram;
      updatedEmas[existingIndex] = {
        jenis: brandId,
        gram: newTotalGram,
        rataRataBeli: Math.round(newWeightedAvg)
      };
    } else {
      updatedEmas.push({
        jenis: brandId,
        gram: gram,
        rataRataBeli: unitPrice
      });
    }

    const newSaldo = currentUser.saldo - totalCost;

    const newTrx: Transaction = {
      id: generateId('TRX'),
      uid: currentUser.uid,
      namaUser: currentUser.nama,
      emailUser: currentUser.email,
      teks: `✅ Beli ${brand.nama} × ${gram.toFixed(2)} gr`,
      jumlah: totalCost,
      jenis: 'beli',
      status: 'disetujui',
      waktu: new Date().toISOString(),
      detail: {
        jenisEmas: brandId,
        gram: gram,
        hargaPerGram: unitPrice
      }
    };

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        saldo: newSaldo,
        emas: updatedEmas
      });
      await setDoc(doc(db, 'transactions', newTrx.id), newTrx);
    } catch (err) {
      console.warn('Firestore update warning:', err);
    }

    // Update local state
    setAllUsers((prev) =>
      prev.map((u) => (u.uid === currentUser.uid ? { ...u, saldo: newSaldo, emas: updatedEmas } : u))
    );
    setTransactions((prev) => [newTrx, ...prev]);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    } catch {}

    showToast(`Berhasil membeli ${gram} gr ${brand.nama}!`, 'success');
    return { success: true, message: 'Transaksi berhasil' };
  };

  // Sell Gold (Real trade: deducts gold, credits real cash balance)
  const sellGold = async (brandId: GoldBrandId, gram: number) => {
    if (!currentUser) return { success: false, message: 'Silakan login terlebih dahulu' };
    if (!gram || gram <= 0) return { success: false, message: 'Masukkan gram emas yang valid' };

    const holding = currentUser.emas.find((e) => e.jenis === brandId);
    if (!holding || holding.gram < gram) {
      return {
        success: false,
        message: `Jumlah gram melebihi kepemilikan Anda (${holding ? holding.gram.toFixed(2) : 0} gr)`
      };
    }

    const brand = getBrandInfo(brandId);
    const unitBuybackPrice = hargaDasar - brand.marjinalJual;
    const totalEarnings = Math.round(unitBuybackPrice * gram);

    // Update gold array
    const updatedEmas = currentUser.emas
      .map((e) => {
        if (e.jenis === brandId) {
          const remaining = e.gram - gram;
          return { ...e, gram: remaining };
        }
        return e;
      })
      .filter((e) => e.gram > 0.0001);

    const newSaldo = currentUser.saldo + totalEarnings;

    const newTrx: Transaction = {
      id: generateId('TRX'),
      uid: currentUser.uid,
      namaUser: currentUser.nama,
      emailUser: currentUser.email,
      teks: `💰 Jual ${brand.nama} × ${gram.toFixed(2)} gr`,
      jumlah: totalEarnings,
      jenis: 'jual',
      status: 'disetujui',
      waktu: new Date().toISOString(),
      detail: {
        jenisEmas: brandId,
        gram: gram,
        hargaPerGram: unitBuybackPrice
      }
    };

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        saldo: newSaldo,
        emas: updatedEmas
      });
      await setDoc(doc(db, 'transactions', newTrx.id), newTrx);
    } catch (err) {
      console.warn('Firestore update warning:', err);
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.uid === currentUser.uid ? { ...u, saldo: newSaldo, emas: updatedEmas } : u))
    );
    setTransactions((prev) => [newTrx, ...prev]);

    showToast(`Penjualan berhasil! Dana Rp ${totalEarnings.toLocaleString('id-ID')} masuk ke saldo kas riil.`, 'success');
    return { success: true, message: 'Penjualan berhasil' };
  };

  // Submit Real Deposit Request
  const submitDeposit = async ({
    jumlah,
    metode,
    namaPengirim,
    nomorPengirim,
    buktiFoto
  }: {
    jumlah: number;
    metode: string;
    namaPengirim: string;
    nomorPengirim: string;
    buktiFoto?: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Silakan login terlebih dahulu' };
    if (!jumlah || jumlah < 10000) return { success: false, message: 'Jumlah deposit minimal Rp 10.000' };
    if (!metode || !namaPengirim.trim() || !nomorPengirim.trim()) {
      return { success: false, message: 'Lengkapi semua kolom formulir deposit' };
    }

    const newTrx: Transaction = {
      id: generateId('DEP'),
      uid: currentUser.uid,
      namaUser: currentUser.nama,
      emailUser: currentUser.email,
      teks: `💵 Deposit ${metode.toUpperCase()} — A.n: ${namaPengirim} — No: ${nomorPengirim}`,
      jumlah,
      jenis: 'deposit',
      status: 'menunggu',
      waktu: new Date().toISOString(),
      buktiFoto,
      detail: {
        metode,
        namaTujuan: namaPengirim,
        nomorTujuan: nomorPengirim
      }
    };

    try {
      await setDoc(doc(db, 'transactions', newTrx.id), newTrx);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    setTransactions((prev) => [newTrx, ...prev]);
    showToast('Permintaan deposit riil terkirim! Admin akan memverifikasi mutasi bank sebelum saldo dikreditkan.', 'info');
    return { success: true, message: 'Deposit dikirim' };
  };

  // Submit Real Withdrawal Request
  const submitWithdraw = async ({
    jumlah,
    metode,
    namaTujuan,
    nomorTujuan
  }: {
    jumlah: number;
    metode: string;
    namaTujuan: string;
    nomorTujuan: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Silakan login terlebih dahulu' };
    if (!jumlah || jumlah < 10000) return { success: false, message: 'Minimal penarikan Rp 10.000' };
    if (currentUser.saldo < jumlah) {
      return { success: false, message: `Saldo kas Anda tidak mencukupi (Rp ${currentUser.saldo.toLocaleString('id-ID')})` };
    }
    if (!metode || !namaTujuan.trim() || !nomorTujuan.trim()) {
      return { success: false, message: 'Lengkapi seluruh data tujuan penarikan' };
    }

    // Deduct immediately on withdrawal request to hold funds
    const newSaldo = currentUser.saldo - jumlah;

    const newTrx: Transaction = {
      id: generateId('WD'),
      uid: currentUser.uid,
      namaUser: currentUser.nama,
      emailUser: currentUser.email,
      teks: `💳 Penarikan ke ${metode} — A.n: ${namaTujuan} — No: ${nomorTujuan}`,
      jumlah,
      jenis: 'tarik',
      status: 'menunggu',
      waktu: new Date().toISOString(),
      detail: {
        metode,
        namaTujuan,
        nomorTujuan
      }
    };

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { saldo: newSaldo });
      await setDoc(doc(db, 'transactions', newTrx.id), newTrx);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.uid === currentUser.uid ? { ...u, saldo: newSaldo } : u))
    );
    setTransactions((prev) => [newTrx, ...prev]);

    showToast('Permintaan penarikan dikirim! Saldo kas diamankan menunggu transfer dari Admin.', 'info');
    return { success: true, message: 'Permintaan penarikan dikirim' };
  };

  // Claim Daily Profit (3% of total assets)
  const claimDailyProfit = async () => {
    if (!currentUser) return { success: false, amount: 0, message: 'Silakan login' };
    const today = new Date().toISOString().slice(0, 10);
    if (currentUser.terakhirKeuntungan === today) {
      return { success: false, amount: 0, message: 'Anda sudah mengklaim keuntungan harian hari ini!' };
    }

    const totalAset = currentUser.saldo + hitungTotalNilaiEmas(currentUser);
    const profit = Math.floor(totalAset * PERSEN_UNTUNG_HARIAN);

    if (profit <= 0) {
      return { success: false, amount: 0, message: 'Total portofolio Anda masih 0 untuk menghasilkan dividen.' };
    }

    const newSaldo = currentUser.saldo + profit;

    const newTrx: Transaction = {
      id: generateId('TRX'),
      uid: currentUser.uid,
      namaUser: currentUser.nama,
      emailUser: currentUser.email,
      teks: `💰 Dividen Harian 3% (Aset: Rp ${totalAset.toLocaleString('id-ID')})`,
      jumlah: profit,
      jenis: 'untung',
      status: 'disetujui',
      waktu: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        saldo: newSaldo,
        terakhirKeuntungan: today
      });
      await setDoc(doc(db, 'transactions', newTrx.id), newTrx);
    } catch (err) {
      console.warn('Firestore update warning:', err);
    }

    setAllUsers((prev) =>
      prev.map((u) =>
        u.uid === currentUser.uid ? { ...u, saldo: newSaldo, terakhirKeuntungan: today } : u
      )
    );
    setTransactions((prev) => [newTrx, ...prev]);

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
    } catch {}

    showToast(`Selamat! Dividen harian Rp ${profit.toLocaleString('id-ID')} berhasil diklaim!`, 'success');
    return { success: true, amount: profit, message: 'Keuntungan berhasil diklaim' };
  };

  // Admin: Approve Transaction
  const adminApproveTransaction = async (trxId: string) => {
    const trx = transactions.find((t) => t.id === trxId);
    if (!trx) return { success: false, message: 'Transaksi tidak ditemukan' };
    if (trx.status !== 'menunggu') return { success: false, message: 'Transaksi sudah diproses sebelumnya' };

    try {
      await updateDoc(doc(db, 'transactions', trxId), { status: 'disetujui' });

      // If deposit, credit user's real balance
      if (trx.jenis === 'deposit') {
        const targetUser = allUsers.find((u) => u.uid === trx.uid);
        if (targetUser) {
          const updatedSaldo = targetUser.saldo + trx.jumlah;
          await updateDoc(doc(db, 'users', trx.uid), { saldo: updatedSaldo });
          setAllUsers((prev) =>
            prev.map((u) => (u.uid === trx.uid ? { ...u, saldo: updatedSaldo } : u))
          );
        }
      }
    } catch (err) {
      console.warn('Firestore admin approve error:', err);
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === trxId ? { ...t, status: 'disetujui' } : t))
    );

    showToast(`Transaksi ${trx.id} (${trx.jenis.toUpperCase()}) disetujui!`, 'success');
    return { success: true, message: 'Berhasil disetujui' };
  };

  // Admin: Reject Transaction
  const adminRejectTransaction = async (trxId: string, alasan?: string) => {
    const trx = transactions.find((t) => t.id === trxId);
    if (!trx) return { success: false, message: 'Transaksi tidak ditemukan' };
    if (trx.status !== 'menunggu') return { success: false, message: 'Transaksi sudah diproses sebelumnya' };

    try {
      await updateDoc(doc(db, 'transactions', trxId), {
        status: 'ditolak',
        detail: { ...trx.detail, alasanPenolakan: alasan || 'Verifikasi tidak valid' }
      });

      // If withdrawal is rejected, refund the held amount back to user's balance!
      if (trx.jenis === 'tarik') {
        const targetUser = allUsers.find((u) => u.uid === trx.uid);
        if (targetUser) {
          const refundedSaldo = targetUser.saldo + trx.jumlah;
          await updateDoc(doc(db, 'users', trx.uid), { saldo: refundedSaldo });
          setAllUsers((prev) =>
            prev.map((u) => (u.uid === trx.uid ? { ...u, saldo: refundedSaldo } : u))
          );
        }
      }
    } catch (err) {
      console.warn('Firestore admin reject error:', err);
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === trxId
          ? {
              ...t,
              status: 'ditolak',
              detail: { ...t.detail, alasanPenolakan: alasan || 'Verifikasi tidak valid' }
            }
          : t
      )
    );

    showToast(`Transaksi ${trx.id} ditolak.`, 'info');
    return { success: true, message: 'Transaksi ditolak' };
  };

  // Admin: Adjust Balance
  const adminAdjustBalance = async (uid: string, delta: number, note?: string) => {
    const targetUser = allUsers.find((u) => u.uid === uid);
    if (!targetUser) return { success: false, message: 'Pengguna tidak ditemukan' };

    const newSaldo = Math.max(0, targetUser.saldo + delta);

    const adjTrx: Transaction = {
      id: generateId('ADJ'),
      uid,
      namaUser: targetUser.nama,
      emailUser: targetUser.email,
      teks: `⚖️ Penyesuaian Saldo oleh Admin ${delta >= 0 ? '+' : ''}Rp ${delta.toLocaleString('id-ID')}${
        note ? ` (${note})` : ''
      }`,
      jumlah: Math.abs(delta),
      jenis: 'bonus',
      status: 'disetujui',
      waktu: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'users', uid), { saldo: newSaldo });
      await setDoc(doc(db, 'transactions', adjTrx.id), adjTrx);
    } catch (err) {
      console.warn('Firestore adjust balance error:', err);
    }

    setAllUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, saldo: newSaldo } : u)));
    setTransactions((prev) => [adjTrx, ...prev]);

    showToast(`Saldo ${targetUser.nama} berhasil disesuaikan!`, 'success');
    return { success: true, message: 'Saldo disesuaikan' };
  };

  // Admin: Set Price
  const adminSetPrice = (newPrice: number) => {
    setHargaDasar(newPrice);
    setRiwayatHarga((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, harga: newPrice };
      return updated;
    });
    showToast(`Harga dasar emas diperbarui ke Rp ${newPrice.toLocaleString('id-ID')}/gr`, 'info');
  };

  const togglePriceFluctuation = () => {
    setIsPriceFluctuating((prev) => !prev);
    showToast(`Fluktuasi harga otomatis ${!isPriceFluctuating ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
  };

  const resetToFactoryData = async () => {
    setAllUsers(INITIAL_USERS);
    setTransactions([]);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    setCurrentUid(null);
    showToast('Seluruh data aplikasi direset ke setelan awal pabrik.', 'info');
  };

  return (
    <GoldContext.Provider
      value={{
        currentUser,
        allUsers,
        transactions,
        userTransactions,
        hargaDasar,
        riwayatHarga,
        perubahanPersen,
        toast,
        showToast,
        hideToast,
        login,
        register,
        logout,
        switchUser,
        buyGold,
        sellGold,
        submitDeposit,
        submitWithdraw,
        claimDailyProfit,
        canClaimProfit,
        adminApproveTransaction,
        adminRejectTransaction,
        adminAdjustBalance,
        adminSetPrice,
        togglePriceFluctuation,
        isPriceFluctuating,
        resetToFactoryData,
        hitungTotalNilaiEmas,
        hitungTotalGramEmas,
        getBrandInfo
      }}
    >
      {children}
    </GoldContext.Provider>
  );
};

export const useGold = () => {
  const context = useContext(GoldContext);
  if (!context) {
    throw new Error('useGold must be used within a GoldProvider');
  }
  return context;
};

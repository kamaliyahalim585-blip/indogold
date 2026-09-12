export type GoldBrandId = 'ANTAM' | 'PAMP' | 'UBS' | 'GALERI24' | 'LOTUS' | 'HARTADINATA';

export interface GoldProduct {
  id: GoldBrandId;
  nama: string;
  flag: string;
  marjinalBeli: number; // additional margin for buying
  marjinalJual: number; // discount margin for selling (buyback spread)
  sertifikasi: string;
  kemurnian: string;
  deskripsi: string;
}

export interface GoldHolding {
  jenis: GoldBrandId;
  gram: number;
  rataRataBeli: number;
}

export type TransactionType = 'deposit' | 'tarik' | 'beli' | 'jual' | 'untung' | 'bonus';
export type TransactionStatus = 'menunggu' | 'disetujui' | 'ditolak';

export interface Transaction {
  id: string;
  uid: string;
  namaUser: string;
  emailUser: string;
  teks: string;
  jumlah: number;
  jenis: TransactionType;
  status: TransactionStatus;
  waktu: string; // ISO string
  buktiFoto?: string; // base64 or url
  detail?: {
    jenisEmas?: GoldBrandId;
    gram?: number;
    hargaPerGram?: number;
    metode?: string;
    nomorTujuan?: string;
    namaTujuan?: string;
    alasanPenolakan?: string;
  };
}

export interface UserAccount {
  uid: string;
  nama: string;
  email: string;
  sandi: string;
  saldo: number;
  emas: GoldHolding[];
  kodeRef: string;
  dirujukOleh?: string;
  terakhirKeuntungan?: string; // date string YYYY-MM-DD
  daftarPada: string;
  isAdmin?: boolean;
}

export interface BankOrWalletOption {
  id: string;
  nama: string;
  tipe: 'ewallet' | 'bank' | 'qris';
  no: string;
  an: string;
  instruksi: string[];
}

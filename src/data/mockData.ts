import { GoldProduct, BankOrWalletOption, UserAccount, Transaction } from '../types/gold';

export const BONUS_PENDAFTARAN = 20000; // Rp 20.000 saldo bonus pendaftaran otomatis
export const BONUS_REFERRAL_USER = 10000; // Rp 10.000 saldo bonus tambahan jika memakai kode referral
export const BONUS_REFERRAL_PENGUNDANG = 15000; // Rp 15.000 komisi saldo untuk pemilik kode referral

export const DAFTAR_EMAS: GoldProduct[] = [
  {
    id: 'ANTAM',
    nama: 'Emas ANTAM Logam Mulia',
    flag: '🇮🇩',
    marjinalBeli: 0,
    marjinalJual: 12000,
    sertifikasi: 'LBMA / CertiCard',
    kemurnian: '99.99% (24 Karat)',
    deskripsi: 'Standar emas batangan Indonesia dengan sertifikat CertiCard berteknologi cetak keamanan tinggi.'
  },
  {
    id: 'UBS',
    nama: 'UBS Gold Classic',
    flag: '🇮🇩',
    marjinalBeli: -3000,
    marjinalJual: 14000,
    sertifikasi: 'SNI / PT Untung Bersama Sejahtera',
    kemurnian: '99.99% (24 Karat)',
    deskripsi: 'Produk emas batangan swasta terkemuka di Indonesia dengan kemasan terlindung berstandar internasional.'
  },
  {
    id: 'GALERI24',
    nama: 'Galeri 24 Pegadaian',
    flag: '🇮🇩',
    marjinalBeli: -4500,
    marjinalJual: 15000,
    sertifikasi: 'PT Pegadaian Galeri 24',
    kemurnian: '99.99% (24 Karat)',
    deskripsi: 'Emas batangan resmi anak perusahaan PT Pegadaian (Persero) dengan jaminan buyback terluas di Nusantara.'
  },
  {
    id: 'PAMP',
    nama: 'PAMP Suisse Lady Fortuna',
    flag: '🇨🇭',
    marjinalBeli: 25000,
    marjinalJual: 10000,
    sertifikasi: 'Swiss LBMA Good Delivery',
    kemurnian: '99.99% (24 Karat)',
    deskripsi: 'Emas batangan Swiss nomor satu dunia dengan motif ikonik dewi keberuntungan Lady Fortuna.'
  },
  {
    id: 'LOTUS',
    nama: 'Lotus Archi Gold',
    flag: '🇮🇩',
    marjinalBeli: -2000,
    marjinalJual: 13500,
    sertifikasi: 'PT Lotus Lingga Pratama & PT Archi Indonesia',
    kemurnian: '99.99% (24 Karat)',
    deskripsi: 'Diproduksi dari tambang emas murni Indonesia dengan QR code verifikasi keaslian via aplikasi CertiEye.'
  },
  {
    id: 'HARTADINATA',
    nama: 'Hartadinata Emas Kita',
    flag: '🇮🇩',
    marjinalBeli: -1500,
    marjinalJual: 14000,
    sertifikasi: 'Kerjasama PT Hartadinata & Antam',
    kemurnian: '99.99% (24 Karat)',
    deskripsi: 'Emas mikro dan batangan dengan fitur keamanan BullionProtect generasi terkini.'
  }
];

export const REKENING_TUJUAN: BankOrWalletOption[] = [
  {
    id: 'permata',
    nama: 'Bank Permata',
    tipe: 'bank',
    no: '009960243614',
    an: 'muhammad yusuf amiinuddiin',
    instruksi: [
      'Buka aplikasi PermataMobile X, ATM Permata, atau Mobile/Internet Banking bank lain',
      'Pilih menu Transfer > Antar Rekening Permata (atau Transfer Antar Bank / BI-FAST / Online)',
      'Masukkan nomor rekening tujuan 009960243614',
      'Pastikan nama penerima tertera: muhammad yusuf amiinuddiin',
      'Simpan bukti transfer dan unggah foto/screenshot pada formulir ini'
    ]
  },
  {
    id: 'ovo',
    nama: 'OVO',
    tipe: 'ewallet',
    no: '087889999393',
    an: 'muhammad yusuf amiinuddiin',
    instruksi: [
      'Buka aplikasi OVO Anda',
      'Pilih menu Transfer > Sesama OVO (atau Kirim Uang)',
      'Ketik nomor HP tujuan 087889999393',
      'Pastikan nama penerima tertera: muhammad yusuf amiinuddiin',
      'Selesaikan pembayaran dan unggah bukti transaksi di bawah ini'
    ]
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    uid: 'admin-001',
    nama: 'Admin Pusat IndoGold',
    email: 'admin@indogold.com',
    sandi: 'admin123',
    saldo: 0,
    emas: [],
    kodeRef: 'INDOGOLD',
    terakhirKeuntungan: '',
    daftarPada: new Date().toISOString(),
    isAdmin: true
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_PRICE_POINTS = [
  { label: 'H-6', harga: 1078000, waktu: '06 Sep' },
  { label: 'H-5', harga: 1080000, waktu: '07 Sep' },
  { label: 'H-4', harga: 1079500, waktu: '08 Sep' },
  { label: 'H-3', harga: 1082000, waktu: '09 Sep' },
  { label: 'H-2', harga: 1081500, waktu: '10 Sep' },
  { label: 'H-1', harga: 1084000, waktu: '11 Sep' },
  { label: 'Hari Ini', harga: 1088500, waktu: '12 Sep' }
];

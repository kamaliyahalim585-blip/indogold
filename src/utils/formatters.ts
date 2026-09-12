export function formatRupiah(amount: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(Math.floor(amount || 0));
}

export function formatGrams(grams: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(grams || 0);
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return isoString;
  }
}

export function generateId(prefix: string = 'TRX'): string {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
}

export function generateReferralCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'GOLD';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${rand}`;
}

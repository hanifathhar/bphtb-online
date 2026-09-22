/**
 * Utility functions for BPHTB & SSPD documents
 */

export function terbilang(n: number): string {
  if (isNaN(n) || n === 0) return "(Nol rupiah)";
  
  const satuan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];

  function bilang(x: number): string {
    x = Math.floor(Math.abs(x));
    if (x < 12) return satuan[x];
    if (x < 20) return bilang(x - 10) + " Belas";
    if (x < 100) return bilang(Math.floor(x / 10)) + " Puluh " + (x % 10 > 0 ? satuan[x % 10] : "");
    if (x < 200) return "Seratus " + (x - 100 > 0 ? bilang(x - 100) : "");
    if (x < 1000) return bilang(Math.floor(x / 100)) + " Ratus " + (x % 100 > 0 ? bilang(x % 100) : "");
    if (x < 2000) return "Seribu " + (x - 1000 > 0 ? bilang(x - 1000) : "");
    if (x < 1000000) return bilang(Math.floor(x / 1000)) + " Ribu " + (x % 1000 > 0 ? bilang(x % 1000) : "");
    if (x < 1000000000) return bilang(Math.floor(x / 1000000)) + " Juta " + (x % 1000000 > 0 ? bilang(x % 1000000) : "");
    if (x < 1000000000000) return bilang(Math.floor(x / 1000000000)) + " Miliar " + (x % 1000000000 > 0 ? bilang(x % 1000000000) : "");
    return bilang(Math.floor(x / 1000000000000)) + " Triliun " + (x % 1000000000000 > 0 ? bilang(x % 1000000000000) : "");
  }

  const clean = bilang(n).replace(/\s+/g, " ").trim();
  const formatted = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  return `(${formatted} rupiah)`;
}

export function formatRupiahNumber(val: number | string | null | undefined): string {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatRupiah(val: number | string | null | undefined): string {
  return "Rp. " + formatRupiahNumber(val);
}

/**
 * Format No STS / No SSPD:
 * 12964111301 + [tahun 4 digit] + 09 + [no urut 4 digit]
 * e.g. 129641113012026090001
 */
export function formatNoSts(
  idBerkas?: number | string,
  tahun?: string | number | null,
  existingNoSts?: string | null
): string {
  if (existingNoSts && existingNoSts.trim()) {
    return existingNoSts.trim();
  }
  const yearStr = (tahun ? String(tahun) : new Date().getFullYear().toString()).slice(0, 4);
  const numId = parseInt(String(idBerkas || 1), 10) || 1;
  const seqStr = numId.toString().padStart(4, "0");
  return `12964111301${yearStr}09${seqStr}`;
}

/**
 * Format Kd Kohir:
 * 9 + [no urut 4 digit] + / + [tahun 4 digit]
 * e.g. 90001/2026
 */
export function formatKdKohir(
  idBerkas?: number | string,
  tahun?: string | number | null,
  existingKdKohir?: string | null
): string {
  if (existingKdKohir && existingKdKohir.trim()) {
    return existingKdKohir.trim();
  }
  const yearStr = (tahun ? String(tahun) : new Date().getFullYear().toString()).slice(0, 4);
  const numId = parseInt(String(idBerkas || 1), 10) || 1;
  const seqStr = numId.toString().padStart(4, "0");
  return `9${seqStr}/${yearStr}`;
}

export const JENIS_TRANSAKSI_LABELS: Record<string, string> = {
  "1": "Jual Beli",
  "2": "Tukar Menukar",
  "3": "Hibah",
  "4": "Hibah Wasiat",
  "5": "Waris",
  "6": "Pemisahan Hak",
  "7": "Lelang",
  "8": "Putusan Hakim",
  "9": "Pemberian Hak Baru",
  "10": "Penggabungan Usaha",
  "11": "Pemekaran Usaha",
  "12": "Hadiah",
};

export function getJenisTransaksiLabel(codeOrText: string | number | null | undefined): string {
  if (!codeOrText) return "Jual Beli";
  const str = String(codeOrText);
  if (JENIS_TRANSAKSI_LABELS[str]) {
    return JENIS_TRANSAKSI_LABELS[str];
  }
  return str;
}

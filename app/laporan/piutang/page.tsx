"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import {
  BadgeAlert,
  Printer,
  FileSpreadsheet,
  Search,
  X,
  AlertTriangle,
  Clock,
} from "lucide-react";
import * as XLSX from "xlsx";
import logoTapsel from "@/public/Logo-Tapsel.png";
import ReportSignatures from "@/components/ReportSignatures";
import Pagination from "@/components/Pagination";

const BULAN_OPTIONS = [
  { value: "1", label: "JANUARI" },
  { value: "2", label: "FEBRUARI" },
  { value: "3", label: "MARET" },
  { value: "4", label: "APRIL" },
  { value: "5", label: "MEI" },
  { value: "6", label: "JUNI" },
  { value: "7", label: "JULI" },
  { value: "8", label: "AGUSTUS" },
  { value: "9", label: "SEPTEMBER" },
  { value: "10", label: "OKTOBER" },
  { value: "11", label: "NOVEMBER" },
  { value: "12", label: "DESEMBER" },
];

export default function RekapPiutangPage() {
  const currentYearStr = new Date().getFullYear().toString();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(currentYearStr);
  const [bulanAwal, setBulanAwal] = useState("1"); // Januari
  const [bulanAkhir, setBulanAkhir] = useState("12"); // Desember
  const [kategoriTempo, setKategoriTempo] = useState<"semua" | "lewat_tempo" | "belum_tempo">("semua");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("jenis", "piutang");
      if (tahun) params.append("tahun", tahun);
      if (bulanAwal) params.append("bulanAwal", bulanAwal);
      if (bulanAkhir) params.append("bulanAkhir", bulanAkhir);

      const res = await fetch(`/api/laporan?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch (e) {
      console.error("Gagal mengambil data rekap piutang:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tahun, bulanAwal, bulanAkhir]);

  useEffect(() => {
    setPage(1);
  }, [tahun, bulanAwal, bulanAkhir, kategoriTempo, search, limit]);

  const formatNumber = (val: number | string) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  const formatDateYYYYMMDD = (d: string | Date) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "-";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();

  const filteredData = data.filter((item) => {
    // Kategori jatuh tempo filter
    if (kategoriTempo === "lewat_tempo") {
      if (!item.tglTempo) return false;
      const tempo = new Date(item.tglTempo);
      if (tempo >= today) return false;
    } else if (kategoriTempo === "belum_tempo") {
      if (item.tglTempo) {
        const tempo = new Date(item.tglTempo);
        if (tempo < today) return false;
      }
    }

    if (!search.trim()) return true;
    const s = search.toLowerCase().trim();
    return (
      item.kdKohir?.toLowerCase().includes(s) ||
      item.noSts?.toLowerCase().includes(s) ||
      item.namaWpBaru?.toLowerCase().includes(s) ||
      item.namaWp?.toLowerCase().includes(s) ||
      item.alamatWpBaru?.toLowerCase().includes(s) ||
      item.lokasiOp?.toLowerCase().includes(s) ||
      item.nop?.toLowerCase().includes(s) ||
      item.noBerkas?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const paginatedData =
    limit === -1 ? filteredData : filteredData.slice((page - 1) * limit, page * limit);

  const totalKetetapan = filteredData.reduce((acc, curr) => acc + Number(curr.bphtb || 0), 0);
  const totalDibayar = filteredData.reduce(
    (acc, curr) => acc + Number(curr.nilaiSudahDibayar || 0),
    0
  );
  const totalTunggakan = filteredData.reduce(
    (acc, curr) => acc + Number(curr.nilaiBelumDibayar ?? curr.bphtb ?? 0),
    0
  );

  const bulanAwalLabel =
    BULAN_OPTIONS.find((b) => b.value === bulanAwal)?.label || "JANUARI";
  const bulanAkhirLabel =
    BULAN_OPTIONS.find((b) => b.value === bulanAkhir)?.label || "DESEMBER";

  const handleExportExcel = () => {
    const exportRows = filteredData.map((item, index) => {
      const ketetapanNominal = Number(item.bphtb || 0);
      const sudahDibayar = Number(item.nilaiSudahDibayar || 0);
      const tunggakan = Number(item.nilaiBelumDibayar ?? ketetapanNominal);
      const tglKetetapan = item.tglSkp
        ? formatDateYYYYMMDD(item.tglSkp)
        : item.tglBerkas
        ? formatDateYYYYMMDD(item.tglBerkas)
        : "-";

      const isLewatTempo = item.tglTempo && new Date(item.tglTempo) < today;

      return {
        No: index + 1,
        "No. Kohir": item.kdKohir || "-",
        "Tanggal Ketetapan": tglKetetapan,
        "Jumlah Ketetapan Pajak (Rp)": ketetapanNominal,
        "Nama Wajib Pajak": item.namaWpBaru || item.namaWp || "-",
        Alamat: item.alamatWpBaru || item.lokasiOp || item.kelurahanOp || "-",
        "Dinas/Badan": "Pejabat Pengelola Keuangan Daerah",
        "Nomor STS": item.noSts || "-",
        "Tanggal Pembayaran": "",
        "Denda (Rp)": 0,
        "Jumlah Dibayar (Rp)": sudahDibayar,
        "Tunggakan (Rp)": tunggakan,
        "Status Pembayaran": isLewatTempo ? "Lewat Jatuh Tempo" : "Belum Bayar",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap_Piutang_BPHTB");
    XLSX.writeFile(
      workbook,
      `Daftar_Piutang_Tunggakan_BPHTB_${tahun}_Bulan_${bulanAwal}_sd_${bulanAkhir}.xlsx`
    );
  };

  return (
    <DashboardShell active="laporan">
      {/* Print Page Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm 6mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 7.5pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .no-print, nav, aside, header {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            font-size: 6.5pt !important;
          }
          th, td {
            padding: 2px 2px !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            hyphens: auto !important;
            border: 1px solid #000000 !important;
            line-height: 1.15 !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Screen Controls Header (Hidden on Print) */}
      <div className="no-print space-y-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold mb-2">
              <BadgeAlert size={14} /> Daftar Piutang & Tunggakan BPHTB
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Rekap Piutang & Tunggakan BPHTB
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Monitoring seluruh ketetapan pajak BPHTB terutang yang belum dilunasi oleh Wajib Pajak ke Kas Daerah.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <FileSpreadsheet size={16} /> Export Excel
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-slate-900/20 active:scale-95 transition"
            >
              <Printer size={16} /> Cetak Rekap Piutang (Landscape)
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          {/* Tahun Anggaran */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tahun Anggaran</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {[2026, 2025, 2024, 2023, 2022].map((y) => (
                <option key={y} value={y.toString()}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          {/* Bulan Awal */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bulan Dari</label>
            <select
              value={bulanAwal}
              onChange={(e) => setBulanAwal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {BULAN_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bulan Akhir */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bulan Sampai</label>
            <select
              value={bulanAkhir}
              onChange={(e) => setBulanAkhir(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {BULAN_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori Tempo */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status Jatuh Tempo</label>
            <select
              value={kategoriTempo}
              onChange={(e) => setKategoriTempo(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="semua">Semua Piutang</option>
              <option value="lewat_tempo">Lewat Jatuh Tempo</option>
              <option value="belum_tempo">Belum Jatuh Tempo</option>
            </select>
          </div>

          {/* Limit / Tampilkan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tampilkan</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={10}>10 Baris</option>
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
              <option value={-1}>Semua Baris</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pencarian Cepat</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari Kohir, WP, NOP..."
                className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-slate-500">Jumlah Berkas Piutang</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{filteredData.length} Berkas</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-slate-500">Total Ketetapan Terutang</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{formatNumber(totalKetetapan)}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
            <p className="text-amber-800 font-medium">Total Sisa Piutang BPHTB</p>
            <p className="text-lg font-black text-amber-700 mt-0.5">{formatNumber(totalTunggakan)}</p>
          </div>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="print-full bg-white border border-slate-200 sm:rounded-3xl p-4 sm:p-8 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
        {/* Official Header with Logo Tapsel */}
        <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-black print:border-none">
          <div className="w-14 h-16 sm:w-16 sm:h-20 relative flex items-center justify-center shrink-0">
            <Image
              src={logoTapsel}
              alt="Logo Kabupaten Tapanuli Selatan"
              width={60}
              height={75}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex-1 text-center pr-14 sm:pr-16">
            <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wide text-black uppercase leading-tight">
              PEMERINTAH KABUPATEN TAPANULI SELATAN
            </h2>
            <h1 className="text-[11px] sm:text-xs md:text-sm font-black tracking-wide text-black uppercase leading-tight mt-0.5">
              DAFTAR PIUTANG DAN TUNGGAKAN PAJAK BPHTB
            </h1>
            <h3 className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wider mt-0.5">
              BULAN {bulanAwalLabel} S/D {bulanAkhirLabel}
            </h3>
            <h3 className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wider">
              TAHUN ANGGARAN {tahun}
            </h3>
          </div>
        </div>

        {/* 13-Column Master Report Table (SCREEN: Paginated) */}
        <div className="overflow-x-auto print:hidden">
          <table className="w-full border-collapse border border-black text-[9.5px] sm:text-[10px] text-black table-fixed">
            <colgroup>
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "9.5%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "9.5%" }} />
              <col style={{ width: "9.5%" }} />
              <col style={{ width: "6.5%" }} />
            </colgroup>
            <thead>
              {/* Row 1: Group Headers */}
              <tr className="bg-slate-100/90 font-bold text-center border-b border-black">
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  No.
                </th>
                <th
                  colSpan={3}
                  className="border border-black px-1 py-1 text-center align-middle"
                >
                  Surat Ketetapan Pajak Daerah
                </th>
                <th
                  colSpan={2}
                  className="border border-black px-1 py-1 text-center align-middle"
                >
                  Wajib Pajak
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  Dinas/Badan
                </th>
                <th
                  colSpan={4}
                  className="border border-black px-1 py-1 text-center align-middle"
                >
                  Pembayaran
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  Tunggakan (Rp.)
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  Status Pembayaran
                </th>
              </tr>

              {/* Row 2: Sub Headers */}
              <tr className="bg-slate-100/90 font-bold text-center border-b border-black">
                <th className="border border-black px-1 py-1 text-center">
                  No. Kohir
                </th>
                <th className="border border-black px-1 py-1 text-center">
                  Tanggal Ketetapan
                </th>
                <th className="border border-black px-1 py-1 text-right">
                  Jumlah Ketetapan Pajak (Rp.)
                </th>
                <th className="border border-black px-1 py-1 text-left">
                  Nama
                </th>
                <th className="border border-black px-1 py-1 text-left">
                  Alamat
                </th>
                <th className="border border-black px-1 py-1 text-center">
                  Nomor STS
                </th>
                <th className="border border-black px-1 py-1 text-center">
                  Tanggal Pembayaran
                </th>
                <th className="border border-black px-1 py-1 text-right">
                  Denda (Rp.)
                </th>
                <th className="border border-black px-1 py-1 text-right">
                  Jumlah Dibayar
                </th>
              </tr>

              {/* Row 3: Column Reference Numbers */}
              <tr className="bg-slate-200/60 font-bold text-center border-b border-black text-[8.5px] sm:text-[9.5px]">
                <th className="border border-black py-0.5">1</th>
                <th className="border border-black py-0.5">2</th>
                <th className="border border-black py-0.5">3</th>
                <th className="border border-black py-0.5">4</th>
                <th className="border border-black py-0.5">5</th>
                <th className="border border-black py-0.5">6</th>
                <th className="border border-black py-0.5">7</th>
                <th className="border border-black py-0.5">8</th>
                <th className="border border-black py-0.5">9</th>
                <th className="border border-black py-0.5">10</th>
                <th className="border border-black py-0.5">11</th>
                <th className="border border-black py-0.5">12</th>
                <th className="border border-black py-0.5">13</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black font-normal">
              {loading ? (
                <tr>
                  <td colSpan={13} className="border border-black px-4 py-8 text-center text-slate-500">
                    Memuat data daftar piutang BPHTB...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="border border-black px-4 py-8 text-center text-slate-500">
                    Tidak ada catatan piutang / tunggakan BPHTB pada periode ini.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const displayIndex = (limit === -1 ? 0 : (page - 1) * limit) + index + 1;
                  const ketetapanNominal = Number(item.bphtb || 0);
                  const sudahDibayar = Number(item.nilaiSudahDibayar || 0);
                  const tunggakan = Number(item.nilaiBelumDibayar ?? ketetapanNominal);
                  const tglKetetapan = item.tglSkp
                    ? formatDateYYYYMMDD(item.tglSkp)
                    : item.tglBerkas
                    ? formatDateYYYYMMDD(item.tglBerkas)
                    : "-";

                  const isLewatTempo = item.tglTempo && new Date(item.tglTempo) < today;

                  return (
                    <tr
                      key={item.idBerkas}
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* 1. No */}
                      <td className="border border-black px-1 py-1 text-center align-top font-medium">
                        {displayIndex}.
                      </td>

                      {/* 2. No. Kohir */}
                      <td className="border border-black px-1 py-1 text-center align-top font-mono break-all">
                        {item.kdKohir || "-"}
                      </td>

                      {/* 3. Tanggal Ketetapan */}
                      <td className="border border-black px-1 py-1 text-center align-top font-mono">
                        {tglKetetapan}
                      </td>

                      {/* 4. Jumlah Ketetapan Pajak (Rp.) */}
                      <td className="border border-black px-1 py-1 text-right align-top font-semibold whitespace-nowrap">
                        {formatNumber(ketetapanNominal)}
                      </td>

                      {/* 5. Nama Wajib Pajak */}
                      <td className="border border-black px-1 py-1 text-left align-top font-bold uppercase break-words leading-tight">
                        {item.namaWpBaru || item.namaWp || "-"}
                      </td>

                      {/* 6. Alamat */}
                      <td className="border border-black px-1 py-1 text-left align-top uppercase text-[8.5px] sm:text-[9.5px] leading-tight break-words">
                        {item.alamatWpBaru || item.lokasiOp || item.kelurahanOp || "-"}
                      </td>

                      {/* 7. Dinas/Badan */}
                      <td className="border border-black px-1 py-1 text-left align-top text-[8.5px] sm:text-[9.5px] leading-tight break-words">
                        Pejabat Pengelola Keuangan Daerah
                      </td>

                      {/* 8. Nomor STS */}
                      <td className="border border-black px-1 py-1 text-center align-top font-mono text-[8.5px] sm:text-[9.5px] break-all">
                        {item.noSts || "-"}
                      </td>

                      {/* 9. Tanggal Pembayaran */}
                      <td className="border border-black px-1 py-1 text-center align-top font-mono text-slate-400">
                        -
                      </td>

                      {/* 10. Denda (Rp.) */}
                      <td className="border border-black px-1 py-1 text-right align-top font-medium">
                        0.00
                      </td>

                      {/* 11. Jumlah Dibayar */}
                      <td className="border border-black px-1 py-1 text-right align-top font-semibold whitespace-nowrap">
                        {formatNumber(sudahDibayar)}
                      </td>

                      {/* 12. Tunggakan (Rp.) */}
                      <td className="border border-black px-1 py-1 text-right align-top font-black text-rose-700 whitespace-nowrap">
                        {formatNumber(tunggakan)}
                      </td>

                      {/* 13. Status Pembayaran */}
                      <td className="border border-black px-1 py-1 text-center align-top font-semibold text-[8.5px] sm:text-[9.5px] break-words">
                        {isLewatTempo ? (
                          <span className="text-rose-700 font-bold">Lewat Tempo</span>
                        ) : (
                          <span className="text-amber-700">Belum Bayar</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Footer Row */}
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-black text-black">
                  <td
                    colSpan={3}
                    className="border border-black px-1 py-1.5 text-center uppercase tracking-wider"
                  >
                    TOTAL
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right whitespace-nowrap">
                    {formatNumber(totalKetetapan)}
                  </td>
                  <td colSpan={5} className="border border-black px-1 py-1.5 text-center">
                    -
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right">
                    0.00
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right whitespace-nowrap font-black">
                    {formatNumber(totalDibayar)}
                  </td>
                  <td className="border border-black px-1 py-1.5 text-right whitespace-nowrap font-black text-rose-700">
                    {formatNumber(totalTunggakan)}
                  </td>
                  <td className="border border-black px-1 py-1.5 text-center">
                    -
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* 13-Column Master Report Table (PRINT: Complete Full Dataset) */}
        <div className="hidden print:block">
          <table className="w-full border-collapse border border-black text-[6.5pt] text-black table-fixed">
            <colgroup>
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "9.5%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "9.5%" }} />
              <col style={{ width: "9.5%" }} />
              <col style={{ width: "6.5%" }} />
            </colgroup>
            <thead>
              {/* Row 1: Group Headers */}
              <tr className="bg-slate-100 font-bold text-center border-b border-black">
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  No.
                </th>
                <th
                  colSpan={3}
                  className="border border-black px-1 py-1 text-center align-middle"
                >
                  Surat Ketetapan Pajak Daerah
                </th>
                <th
                  colSpan={2}
                  className="border border-black px-1 py-1 text-center align-middle"
                >
                  Wajib Pajak
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  Dinas/Badan
                </th>
                <th
                  colSpan={4}
                  className="border border-black px-1 py-1 text-center align-middle"
                >
                  Pembayaran
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  Tunggakan (Rp.)
                </th>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1.5 text-center align-middle"
                >
                  Status Pembayaran
                </th>
              </tr>

              {/* Row 2: Sub Headers */}
              <tr className="bg-slate-100 font-bold text-center border-b border-black">
                <th className="border border-black px-1 py-1 text-center">
                  No. Kohir
                </th>
                <th className="border border-black px-1 py-1 text-center">
                  Tanggal Ketetapan
                </th>
                <th className="border border-black px-1 py-1 text-right">
                  Jumlah Ketetapan Pajak (Rp.)
                </th>
                <th className="border border-black px-1 py-1 text-left">
                  Nama
                </th>
                <th className="border border-black px-1 py-1 text-left">
                  Alamat
                </th>
                <th className="border border-black px-1 py-1 text-center">
                  Nomor STS
                </th>
                <th className="border border-black px-1 py-1 text-center">
                  Tanggal Pembayaran
                </th>
                <th className="border border-black px-1 py-1 text-right">
                  Denda (Rp.)
                </th>
                <th className="border border-black px-1 py-1 text-right">
                  Jumlah Dibayar
                </th>
              </tr>

              {/* Row 3: Column Reference Numbers */}
              <tr className="bg-slate-200/50 font-bold text-center border-b border-black text-[6pt]">
                <th className="border border-black py-0.5">1</th>
                <th className="border border-black py-0.5">2</th>
                <th className="border border-black py-0.5">3</th>
                <th className="border border-black py-0.5">4</th>
                <th className="border border-black py-0.5">5</th>
                <th className="border border-black py-0.5">6</th>
                <th className="border border-black py-0.5">7</th>
                <th className="border border-black py-0.5">8</th>
                <th className="border border-black py-0.5">9</th>
                <th className="border border-black py-0.5">10</th>
                <th className="border border-black py-0.5">11</th>
                <th className="border border-black py-0.5">12</th>
                <th className="border border-black py-0.5">13</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black font-normal">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="border border-black px-4 py-8 text-center">
                    Tidak ada catatan piutang / tunggakan BPHTB pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const ketetapanNominal = Number(item.bphtb || 0);
                  const sudahDibayar = Number(item.nilaiSudahDibayar || 0);
                  const tunggakan = Number(item.nilaiBelumDibayar ?? ketetapanNominal);
                  const tglKetetapan = item.tglSkp
                    ? formatDateYYYYMMDD(item.tglSkp)
                    : item.tglBerkas
                    ? formatDateYYYYMMDD(item.tglBerkas)
                    : "-";

                  const isLewatTempo = item.tglTempo && new Date(item.tglTempo) < today;

                  return (
                    <tr
                      key={item.idBerkas}
                      className="print:break-inside-avoid"
                    >
                      <td className="border border-black px-1 py-1 text-center align-top font-medium">
                        {index + 1}.
                      </td>
                      <td className="border border-black px-1 py-1 text-center align-top font-mono break-all">
                        {item.kdKohir || "-"}
                      </td>
                      <td className="border border-black px-1 py-1 text-center align-top font-mono">
                        {tglKetetapan}
                      </td>
                      <td className="border border-black px-1 py-1 text-right align-top font-semibold whitespace-nowrap">
                        {formatNumber(ketetapanNominal)}
                      </td>
                      <td className="border border-black px-1 py-1 text-left align-top font-bold uppercase break-words leading-tight">
                        {item.namaWpBaru || item.namaWp || "-"}
                      </td>
                      <td className="border border-black px-1 py-1 text-left align-top uppercase text-[6pt] leading-tight break-words">
                        {item.alamatWpBaru || item.lokasiOp || item.kelurahanOp || "-"}
                      </td>
                      <td className="border border-black px-1 py-1 text-left align-top text-[6pt] leading-tight break-words">
                        Pejabat Pengelola Keuangan Daerah
                      </td>
                      <td className="border border-black px-1 py-1 text-center align-top font-mono text-[6pt] break-all">
                        {item.noSts || "-"}
                      </td>
                      <td className="border border-black px-1 py-1 text-center align-top font-mono text-slate-400">
                        -
                      </td>
                      <td className="border border-black px-1 py-1 text-right align-top font-medium">
                        0.00
                      </td>
                      <td className="border border-black px-1 py-1 text-right align-top font-semibold whitespace-nowrap">
                        {formatNumber(sudahDibayar)}
                      </td>
                      <td className="border border-black px-1 py-1 text-right align-top font-semibold whitespace-nowrap">
                        {formatNumber(tunggakan)}
                      </td>
                      <td className="border border-black px-1 py-1 text-center align-top font-semibold text-[6pt] break-words">
                        {isLewatTempo ? (
                          <span className="font-bold">Lewat Tempo</span>
                        ) : (
                          <span>Belum Bayar</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-black text-black">
                <td
                  colSpan={3}
                  className="border border-black px-1 py-1.5 text-center uppercase tracking-wider"
                >
                  TOTAL
                </td>
                <td className="border border-black px-1 py-1.5 text-right whitespace-nowrap">
                  {formatNumber(totalKetetapan)}
                </td>
                <td colSpan={5} className="border border-black px-1 py-1.5 text-center">
                  -
                </td>
                <td className="border border-black px-1 py-1.5 text-right">
                  0.00
                </td>
                <td className="border border-black px-1 py-1.5 text-right whitespace-nowrap font-black">
                  {formatNumber(totalDibayar)}
                </td>
                <td className="border border-black px-1 py-1.5 text-right whitespace-nowrap font-black">
                  {formatNumber(totalTunggakan)}
                </td>
                <td className="border border-black px-1 py-1.5 text-center">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination in Screen Mode */}
        {limit !== -1 && (
          <div className="no-print">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredData.length}
              limit={limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}

        {/* Official Report Signatures Component (Shown on Print) */}
        <div className="mt-6 print:mt-4">
          <ReportSignatures
            leftTitle="Pejabat Pengelola Keuangan Daerah"
            rightTitle="Kepala Bidang Pendapatan Daerah"
          />
        </div>
      </div>
    </DashboardShell>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import ReportSignatures from "@/components/ReportSignatures";
import {
  Receipt,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  Building2,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";
import logoTapsel from "@/public/Logo-Tapsel.png";
import { formatRupiahNumber } from "@/lib/sspd";

export default function RekapKetetapanPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(currentYearStr);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [kecamatans, setKecamatans] = useState<any[]>([]);

  useEffect(() => {
    setPage(1);
  }, [tahun, startDate, endDate, kecamatan, search, limit]);

  const fetchKecamatans = async () => {
    try {
      const res = await fetch("/api/master/kecamatan");
      if (res.ok) {
        const json = await res.json();
        setKecamatans(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("jenis", "ketetapan");
      if (tahun) params.append("tahun", tahun);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (kecamatan) params.append("kecamatan", kecamatan);
      if (search) params.append("q", search);

      const res = await fetch(`/api/laporan?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setSummary(json.summary || {});
      }
    } catch (err) {
      console.error("Gagal mengambil data ketetapan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKecamatans();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [tahun, startDate, endDate, kecamatan]);

  const handleResetFilter = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setKecamatan("");
    setTahun(currentYearStr);
  };

  // Client search filtering
  const filteredData = useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (item) =>
        item.kdKohir?.toLowerCase().includes(s) ||
        item.noSts?.toLowerCase().includes(s) ||
        item.noBerkas?.toLowerCase().includes(s) ||
        item.nop?.toLowerCase().includes(s) ||
        item.namaWpBaru?.toLowerCase().includes(s) ||
        item.namaWp?.toLowerCase().includes(s) ||
        item.keterangan?.toLowerCase().includes(s) ||
        item.alamatWpBaru?.toLowerCase().includes(s)
    );
  }, [data, search]);

  // Total calculation
  const totalKetetapan = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + Number(curr.bphtb || 0), 0);
  }, [filteredData]);

  // Format date to DD-MM-YYYY
  const formatDateDMY = (dateStr: any) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format currency with decimals e.g. 7,500,000.00
  const formatCurrency = (val: number | string | null | undefined) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Export to Excel according to exact layout in image
  const handleExportExcel = () => {
    const rows = filteredData.map((item, idx) => ({
      No: idx + 1,
      "No. Kohir": item.kdKohir || "-",
      "Tanggal Ketetapan": formatDateDMY(item.tglSkp || item.tglBerkas),
      "Jenis Kegiatan": "Bea Perolehan Hak Atas Tanah dan Bangunan",
      Keterangan: `${(item.keterangan || item.jenisPerolehan || "Jual Beli Tanah dan Bangunan").toUpperCase()}\nNOP : ${item.nop || "-"}`,
      "Jumlah Ketetapan Pajak (Rp.)": Number(item.bphtb || 0),
      Nama: (item.namaWpBaru || item.namaWp || "-").toUpperCase(),
      Alamat: (item.alamatWpBaru || item.alamatWp || item.lokasiOp || "-").toUpperCase(),
      NPWP: item.npwpWpBaru || item.npwpWp || "-",
      "Dinas/Badan": "Pejabat Pengelola Keuangan Daerah",
    }));

    // Add TOTAL row at bottom
    const totalRow = {
      No: "",
      "No. Kohir": "",
      "Tanggal Ketetapan": "",
      "Jenis Kegiatan": "",
      Keterangan: "TOTAL",
      "Jumlah Ketetapan Pajak (Rp.)": totalKetetapan,
      Nama: "",
      Alamat: "",
      NPWP: "",
      "Dinas/Badan": "",
    };

    rows.push(totalRow as any);

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto fit columns
    worksheet["!cols"] = [
      { wch: 6 },  // No
      { wch: 16 }, // No Kohir
      { wch: 18 }, // Tanggal Ketetapan
      { wch: 28 }, // Jenis Kegiatan
      { wch: 45 }, // Keterangan
      { wch: 24 }, // Jumlah Ketetapan Pajak
      { wch: 28 }, // Nama
      { wch: 32 }, // Alamat
      { wch: 18 }, // NPWP
      { wch: 28 }, // Dinas/Badan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Ketetapan SKPD");

    const fileName = `Daftar_Ketetapan_SKPD_BPHTB_${tahun || "Semua"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const paginatedData = limit === -1 
    ? filteredData 
    : filteredData.slice((page - 1) * limit, page * limit);

  return (
    <DashboardShell active="laporan">
      {/* Landscape Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm 8mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 8pt !important;
          }
          .no-print, nav, aside, header {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8pt !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th, td {
            padding: 3px 5px !important;
            border: 1px solid #1e293b !important;
          }
          th {
            background-color: #f8fafc !important;
            font-weight: bold !important;
            color: #000000 !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-semibold mb-2">
            <Receipt size={14} /> Pelaporan & Rekapitulasi BPHTB
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Rekap Ketetapan SKPD BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar Surat Ketetapan Pajak Daerah (SKPD) BPHTB dan Nomor Kohir resmi Badan Pendapatan Daerah (Format Resmi Landscape).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet size={15} /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Printer size={15} /> Cetak Landscape (PDF)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs items-end">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tahun Anggaran</label>
            <YearFilter
              selectedYear={tahun}
              onChange={(y) => setTahun(y)}
              className="w-full justify-between"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Kecamatan</label>
            <select
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatans.map((k) => (
                <option key={k.idKecamatan} value={k.kecamatan}>
                  {k.kecamatan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Cari No. Kohir, NOP, Nama WP, Keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Tampilkan:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={100}>100 Baris</option>
                <option value={-1}>Semua Baris</option>
              </select>
            </div>

            <button
              onClick={handleResetFilter}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw size={13} /> Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total SKP & Kohir Ditetapkan</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{filteredData.length} Ketetapan</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Pokok Ketetapan BPHTB</p>
          <p className="text-2xl font-bold text-cyan-700 mt-1">Rp {formatRupiahNumber(totalKetetapan)}</p>
        </div>
      </div>

      {/* Official Print Header (Exact Match to User Image) */}
      <div className="hidden print:block mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="w-16 h-16 relative shrink-0">
            <Image
              src={logoTapsel}
              alt="Logo Tapanuli Selatan"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <div className="text-center flex-1">
            <h2 className="text-xs font-bold tracking-wider uppercase text-black">
              PEMERINTAH KABUPATEN TAPANULI SELATAN
            </h2>
            <h1 className="text-sm font-extrabold uppercase text-black tracking-wide">
              DAFTAR SURAT KETETAPAN PAJAK BPHTB
            </h1>
            <p className="text-[10px] font-bold text-black uppercase">
              {startDate && endDate 
                ? `BULAN ${formatDateDMY(startDate)} S/D ${formatDateDMY(endDate)}`
                : "BULAN JANUARI S/D DESEMBER"}
            </p>
            <p className="text-[10px] font-bold text-black uppercase">
              TAHUN ANGGARAN {tahun || currentYearStr}
            </p>
          </div>
          <div className="w-16 h-16 shrink-0" />
        </div>
      </div>

      {/* Main Table (Exact 3-Level Header Layout Matching User Format) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 print:border-none print:p-0 print:shadow-none">
        <div className="overflow-x-auto">
          {/* SCREEN TABLE (Paginated) */}
          <table className="w-full text-left text-xs border-collapse border border-slate-300 print:hidden">
            <thead>
              {/* Row 1: Header Grouping */}
              <tr className="bg-slate-100 text-slate-900 font-bold border border-slate-300 text-center">
                <th rowSpan={2} className="px-2 py-2 border border-slate-300 w-10">
                  No.
                </th>
                <th colSpan={5} className="px-3 py-1.5 border border-slate-300">
                  Surat Ketetapan Pajak Daerah
                </th>
                <th colSpan={3} className="px-3 py-1.5 border border-slate-300">
                  Wajib Pajak
                </th>
                <th rowSpan={2} className="px-3 py-2 border border-slate-300 whitespace-nowrap">
                  Dinas/Badan
                </th>
              </tr>

              {/* Row 2: Sub-headers */}
              <tr className="bg-slate-100 text-slate-900 font-bold border border-slate-300 text-center">
                <th className="px-2.5 py-1.5 border border-slate-300 whitespace-nowrap">No. Kohir</th>
                <th className="px-2.5 py-1.5 border border-slate-300 whitespace-nowrap">Tanggal Ketetapan</th>
                <th className="px-3 py-1.5 border border-slate-300 whitespace-nowrap">Jenis Kegiatan</th>
                <th className="px-4 py-1.5 border border-slate-300">Keterangan</th>
                <th className="px-3 py-1.5 border border-slate-300 whitespace-nowrap">Jumlah Ketetapan Pajak (Rp.)</th>
                <th className="px-3 py-1.5 border border-slate-300">Nama</th>
                <th className="px-3 py-1.5 border border-slate-300">Alamat</th>
                <th className="px-2 py-1.5 border border-slate-300 whitespace-nowrap">NPWP</th>
              </tr>

              {/* Row 3: Column Numbers */}
              <tr className="bg-slate-50 text-slate-500 font-semibold border border-slate-300 text-center text-[10px]">
                <th className="py-1 border border-slate-300">1</th>
                <th className="py-1 border border-slate-300">2</th>
                <th className="py-1 border border-slate-300">3</th>
                <th className="py-1 border border-slate-300">4</th>
                <th className="py-1 border border-slate-300">5</th>
                <th className="py-1 border border-slate-300">6</th>
                <th className="py-1 border border-slate-300">7</th>
                <th className="py-1 border border-slate-300">8</th>
                <th className="py-1 border border-slate-300">9</th>
                <th className="py-1 border border-slate-300">10</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-500 border border-slate-300">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data rekap ketetapan SKPD BPHTB...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-500 border border-slate-300">
                    Tidak ada data ketetapan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const itemIndex = limit === -1 ? idx + 1 : (page - 1) * limit + idx + 1;
                  return (
                    <tr key={item.idBerkas} className="hover:bg-slate-50/80 transition">
                      {/* 1. No */}
                      <td className="px-2 py-2.5 text-center border border-slate-300 font-mono text-slate-700">
                        {itemIndex}.
                      </td>

                      {/* 2. No. Kohir */}
                      <td className="px-2.5 py-2.5 border border-slate-300 font-mono font-bold text-cyan-800 whitespace-nowrap text-center">
                        {item.kdKohir || "-"}
                      </td>

                      {/* 3. Tanggal Ketetapan */}
                      <td className="px-2.5 py-2.5 border border-slate-300 text-center font-mono whitespace-nowrap text-slate-700">
                        {formatDateDMY(item.tglSkp || item.tglBerkas)}
                      </td>

                      {/* 4. Jenis Kegiatan */}
                      <td className="px-3 py-2.5 border border-slate-300 text-slate-800 text-[11px] leading-snug">
                        Bea Perolehan Hak Atas Tanah dan Bangunan
                      </td>

                      {/* 5. Keterangan */}
                      <td className="px-3 py-2.5 border border-slate-300 text-[11px] leading-tight text-slate-900">
                        <p className="font-semibold uppercase">
                          {item.keterangan || item.jenisPerolehan || "Jual Beli Tanah dan Bangunan"}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600 mt-0.5">
                          NOP : {item.nop || "-"}
                        </p>
                      </td>

                      {/* 6. Jumlah Ketetapan Pajak (Rp.) */}
                      <td className="px-3 py-2.5 border border-slate-300 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(item.bphtb)}
                      </td>

                      {/* 7. Nama */}
                      <td className="px-3 py-2.5 border border-slate-300 font-semibold uppercase text-slate-900">
                        {item.namaWpBaru || item.namaWp || "-"}
                      </td>

                      {/* 8. Alamat */}
                      <td className="px-3 py-2.5 border border-slate-300 text-[11px] uppercase text-slate-700">
                        {item.alamatWpBaru || item.alamatWp || item.lokasiOp || "-"}
                      </td>

                      {/* 9. NPWP */}
                      <td className="px-2 py-2.5 border border-slate-300 text-center font-mono text-slate-600">
                        {item.npwpWpBaru || item.npwpWp || "-"}
                      </td>

                      {/* 10. Dinas/Badan */}
                      <td className="px-3 py-2.5 border border-slate-300 text-center text-[11px] text-slate-800">
                        Pejabat Pengelola Keuangan Daerah
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-black border-2 border-slate-400 text-slate-900">
                  <td colSpan={5} className="px-3 py-2.5 text-center border border-slate-300 uppercase tracking-wider">
                    TOTAL KETETAPAN
                  </td>
                  <td className="px-3 py-2.5 border border-slate-300 text-right font-mono font-black text-xs text-cyan-900 whitespace-nowrap">
                    {formatCurrency(totalKetetapan)}
                  </td>
                  <td colSpan={4} className="px-3 py-2.5 text-center border border-slate-300 text-slate-400">
                    -
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* PRINT-ONLY TABLE (Renders all items for printing in Landscape) */}
          <table className="hidden print:table w-full text-left border-collapse border border-black text-[7.5pt]">
            <thead>
              {/* Row 1: Group headers */}
              <tr className="bg-gray-100 text-black font-bold border border-black text-center">
                <th rowSpan={2} className="px-1 py-1 border border-black w-7">
                  No.
                </th>
                <th colSpan={5} className="px-2 py-1 border border-black">
                  Surat Ketetapan Pajak Daerah
                </th>
                <th colSpan={3} className="px-2 py-1 border border-black">
                  Wajib Pajak
                </th>
                <th rowSpan={2} className="px-2 py-1 border border-black whitespace-nowrap">
                  Dinas/Badan
                </th>
              </tr>

              {/* Row 2: Sub-headers */}
              <tr className="bg-gray-100 text-black font-bold border border-black text-center">
                <th className="px-1.5 py-1 border border-black whitespace-nowrap">No. Kohir</th>
                <th className="px-1.5 py-1 border border-black whitespace-nowrap">Tanggal Ketetapan</th>
                <th className="px-2 py-1 border border-black whitespace-nowrap">Jenis Kegiatan</th>
                <th className="px-2 py-1 border border-black">Keterangan</th>
                <th className="px-2 py-1 border border-black whitespace-nowrap">Jumlah Ketetapan Pajak (Rp.)</th>
                <th className="px-2 py-1 border border-black">Nama</th>
                <th className="px-2 py-1 border border-black">Alamat</th>
                <th className="px-1 py-1 border border-black whitespace-nowrap">NPWP</th>
              </tr>

              {/* Row 3: Column Numbers */}
              <tr className="bg-gray-50 text-black font-semibold border border-black text-center text-[7pt]">
                <th className="py-0.5 border border-black">1</th>
                <th className="py-0.5 border border-black">2</th>
                <th className="py-0.5 border border-black">3</th>
                <th className="py-0.5 border border-black">4</th>
                <th className="py-0.5 border border-black">5</th>
                <th className="py-0.5 border border-black">6</th>
                <th className="py-0.5 border border-black">7</th>
                <th className="py-0.5 border border-black">8</th>
                <th className="py-0.5 border border-black">9</th>
                <th className="py-0.5 border border-black">10</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {filteredData.map((item, idx) => (
                <tr key={item.idBerkas} className="border border-black">
                  <td className="px-1 py-1 text-center border border-black font-mono">{idx + 1}.</td>
                  <td className="px-1.5 py-1 border border-black font-mono font-bold text-center whitespace-nowrap">{item.kdKohir || "-"}</td>
                  <td className="px-1.5 py-1 border border-black text-center font-mono whitespace-nowrap">{formatDateDMY(item.tglSkp || item.tglBerkas)}</td>
                  <td className="px-1.5 py-1 border border-black text-[7pt] leading-tight">Bea Perolehan Hak Atas Tanah dan Bangunan</td>
                  <td className="px-2 py-1 border border-black text-[7pt] leading-tight">
                    <p className="font-semibold uppercase">{item.keterangan || item.jenisPerolehan || "Jual Beli Tanah dan Bangunan"}</p>
                    <p className="font-mono text-[6.5pt] text-gray-800">NOP :{item.nop || "-"}</p>
                  </td>
                  <td className="px-2 py-1 border border-black text-right font-mono font-bold whitespace-nowrap">{formatCurrency(item.bphtb)}</td>
                  <td className="px-2 py-1 border border-black uppercase font-semibold">{item.namaWpBaru || item.namaWp || "-"}</td>
                  <td className="px-2 py-1 border border-black uppercase text-[7pt]">{item.alamatWpBaru || item.alamatWp || item.lokasiOp || "-"}</td>
                  <td className="px-1 py-1 border border-black text-center font-mono">{item.npwpWpBaru || item.npwpWp || "-"}</td>
                  <td className="px-1.5 py-1 border border-black text-center text-[7pt]">Pejabat Pengelola Keuangan Daerah</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 font-black border-2 border-black text-black">
                <td colSpan={5} className="px-2 py-1.5 text-center border border-black uppercase">
                  TOTAL
                </td>
                <td className="px-2 py-1.5 border border-black text-right font-mono font-black whitespace-nowrap">
                  {formatCurrency(totalKetetapan)}
                </td>
                <td colSpan={4} className="px-2 py-1.5 text-center border border-black">-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination in Screen Mode */}
        {limit !== -1 && (
          <div className="print:hidden">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredData.length}
              limit={limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}

        {/* Print Signature Section from Master Pejabat */}
        <ReportSignatures />
      </div>
    </DashboardShell>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import {
  FileText,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";
import logoTapsel from "@/public/Logo-Tapsel.png";
import { formatRupiahNumber } from "@/lib/sspd";
import ReportSignatures from "@/components/ReportSignatures";

export default function RekapPendaftaranPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [statusBayar, setStatusBayar] = useState("");
  const [tahun, setTahun] = useState(currentYearStr);
  const [kecamatans, setKecamatans] = useState<any[]>([]);

  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, kecamatan, statusBayar, tahun, limit]);

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
      params.append("jenis", "pendaftaran");
      if (search) params.append("q", search);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (kecamatan) params.append("kecamatan", kecamatan);
      if (statusBayar !== "") params.append("statusBayar", statusBayar);
      if (tahun) params.append("tahun", tahun);

      const res = await fetch(`/api/laporan?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setSummary(json.summary || {});
      }
    } catch (err) {
      console.error("Gagal mengambil laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKecamatans();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, kecamatan, statusBayar, tahun]);

  const handleResetFilter = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setKecamatan("");
    setStatusBayar("");
    setTahun(currentYearStr);
  };

  // Filter on client if search is typed
  const filteredData = useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (item) =>
        item.noBerkas?.toLowerCase().includes(s) ||
        item.nop?.toLowerCase().includes(s) ||
        item.namaWpBaru?.toLowerCase().includes(s) ||
        item.namaWp?.toLowerCase().includes(s) ||
        item.jenisPerolehan?.toLowerCase().includes(s)
    );
  }, [data, search]);

  // Recalculate totals for active filtered dataset
  const currentTotals = useMemo(() => {
    let totNpop = 0;
    let totNpoptkp = 0;
    let totNpopkp = 0;
    let totBphtb = 0;
    let countLunas = 0;
    let countBelumLunas = 0;

    filteredData.forEach((item) => {
      totNpop += Number(item.npop || 0);
      totNpoptkp += Number(item.npoptkp || 0);
      totNpopkp += Number(item.npopkp || 0);
      totBphtb += Number(item.bphtb || 0);
      if (item.statusBayar === 1) countLunas++;
      else countBelumLunas++;
    });

    return {
      totNpop,
      totNpoptkp,
      totNpopkp,
      totBphtb,
      countLunas,
      countBelumLunas,
      totalCount: filteredData.length,
    };
  }, [filteredData]);

  // Format date to DD/MM/YYYY
  const formatDateDMY = (dateStr: any) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format standard NOP
  const formatNop = (nopStr: string | null) => {
    if (!nopStr) return "-";
    const clean = nopStr.replace(/\D/g, "");
    if (clean.length === 18) {
      return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4, 7)}.${clean.slice(7, 10)}.${clean.slice(10, 13)}-${clean.slice(13, 17)}.${clean.slice(17, 18)}`;
    }
    return nopStr;
  };

  // Export to Excel according to exact layout
  const handleExportExcel = () => {
    const rows = filteredData.map((item, idx) => ({
      No: idx + 1,
      "No. SSPD/BPHTB": item.noBerkas || "-",
      Tanggal: formatDateDMY(item.tglBerkas),
      "Nama Wajib Pajak": item.namaWpBaru || item.namaWp || "-",
      "NOP/NOPD": formatNop(item.nop),
      "Jenis Perolehan": item.jenisPerolehan || item.keterangan || "Jual Beli",
      NPOP: Number(item.npop || 0),
      NPOPTKP: Number(item.npoptkp || 0),
      "NPOP Kena Pajak": Number(item.npopkp || 0),
      Tarif: `${item.tarif || 5}%`,
      "BPHTB Terutang": Number(item.bphtb || 0),
      Status: item.statusBayar === 1 ? "Lunas" : "Belum Lunas",
    }));

    // Add TOTAL row at the bottom
    const totalRow = {
      No: "",
      "No. SSPD/BPHTB": "",
      Tanggal: "",
      "Nama Wajib Pajak": "",
      "NOP/NOPD": "",
      "Jenis Perolehan": "TOTAL",
      NPOP: currentTotals.totNpop,
      NPOPTKP: "",
      "NPOP Kena Pajak": currentTotals.totNpopkp,
      Tarif: "",
      "BPHTB Terutang": currentTotals.totBphtb,
      Status: "",
    };

    rows.push(totalRow as any);

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto fit column widths
    worksheet["!cols"] = [
      { wch: 6 },  // No
      { wch: 22 }, // No. SSPD/BPHTB
      { wch: 14 }, // Tanggal
      { wch: 28 }, // Nama Wajib Pajak
      { wch: 26 }, // NOP/NOPD
      { wch: 20 }, // Jenis Perolehan
      { wch: 18 }, // NPOP
      { wch: 16 }, // NPOPTKP
      { wch: 18 }, // NPOP Kena Pajak
      { wch: 8 },  // Tarif
      { wch: 18 }, // BPHTB Terutang
      { wch: 14 }, // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Pendaftaran BPHTB");

    const fileName = `Rekap_Pendaftaran_BPHTB_${tahun || "Semua"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
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
            padding: 3px 4px !important;
            border: 1px solid #475569 !important;
          }
          th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
            color: #0f172a !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
            <FileText size={14} /> Pelaporan & Rekapitulasi BPHTB
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Rekap Pendaftaran BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Laporan rekapitulasi data pendaftaran permohonan BPHTB, ketetapan nilai perolehan objek pajak (NPOP), dan status pembayaran (Format Landscape).
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs items-end">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tahun Pajak</label>
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
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Kecamatan</label>
            <select
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatans.map((k) => (
                <option key={k.idKecamatan} value={k.kecamatan}>
                  {k.kecamatan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Status Pembayaran</label>
            <select
              value={statusBayar}
              onChange={(e) => setStatusBayar(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="1">Lunas</option>
              <option value="0">Belum Lunas</option>
            </select>
          </div>
        </div>

        {/* Second Filter Row: Search & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Cari No. SSPD/BPHTB, NOP, Nama WP, Jenis Perolehan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Berkas Terdaftar</p>
          <div className="flex items-baseline justify-between mt-1.5">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{currentTotals.totalCount} <span className="text-xs font-normal text-slate-500">Berkas</span></p>
            <div className="text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-600 font-bold">{currentTotals.countLunas} Lunas</span> • <span className="text-amber-600 font-bold">{currentTotals.countBelumLunas} Belum</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total NPOP</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5">
            Rp {formatRupiahNumber(currentTotals.totNpop)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total NPOP Kena Pajak</p>
          <p className="text-lg sm:text-xl font-bold text-blue-700 mt-1.5">
            Rp {formatRupiahNumber(currentTotals.totNpopkp)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total BPHTB Terutang</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-700 mt-1.5">
            Rp {formatRupiahNumber(currentTotals.totBphtb)}
          </p>
        </div>
      </div>

      {/* Official Print Header (Visible Only When Printing in Landscape) */}
      <div className="hidden print:block mb-4 border-b-2 border-black pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="w-16 h-16 relative shrink-0">
            <Image
              src={logoTapsel}
              alt="Logo Tapanuli Selatan"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div className="text-center flex-1">
            <h2 className="text-sm font-bold tracking-widest uppercase text-black">
              PEMERINTAH KABUPATEN TAPANULI SELATAN
            </h2>
            <h1 className="text-base font-extrabold uppercase text-black tracking-wider">
              BADAN PENDAPATAN DAERAH
            </h1>
            <p className="text-[9px] text-gray-700">
              Komplek Perkantoran Pemerintah Kabupaten Tapanuli Selatan, Jl. Prof. Lafran Pane, Sipirok
            </p>
          </div>
          <div className="w-16 h-16 shrink-0" />
        </div>

        <div className="mt-2 pt-2 border-t border-gray-400 text-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            LAPORAN REKAPITULASI PENDAFTARAN BPHTB
          </h3>
          <p className="text-[10px] text-gray-800">
            Tahun Pajak: <span className="font-bold">{tahun || "Semua Tahun"}</span>
            {startDate && endDate ? ` | Periode: ${formatDateDMY(startDate)} s/d ${formatDateDMY(endDate)}` : ""}
            {kecamatan ? ` | Kecamatan: ${kecamatan}` : ""}
            {statusBayar !== "" ? ` | Status: ${statusBayar === "1" ? "Lunas" : "Belum Lunas"}` : ""}
          </p>
        </div>
      </div>

      {/* Main Report Table (Exact Format as Requested) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 print:border-none print:p-0 print:shadow-none">
        <div className="overflow-x-auto">
          {/* SCREEN TABLE (Paginated) */}
          <table className="w-full text-left text-xs border-collapse print:hidden">
            <thead>
              <tr className="bg-slate-50 text-slate-800 font-bold border border-slate-300">
                <th className="px-2.5 py-3 text-center border border-slate-300 w-10">No</th>
                <th className="px-3 py-3 text-left border border-slate-300 whitespace-nowrap">No. SSPD/BPHTB</th>
                <th className="px-3 py-3 text-center border border-slate-300 whitespace-nowrap">Tanggal</th>
                <th className="px-3 py-3 text-left border border-slate-300">Nama Wajib Pajak</th>
                <th className="px-3 py-3 text-center border border-slate-300 whitespace-nowrap">NOP/NOPD</th>
                <th className="px-3 py-3 text-left border border-slate-300 whitespace-nowrap">Jenis Perolehan</th>
                <th className="px-3 py-3 text-right border border-slate-300 whitespace-nowrap">NPOP</th>
                <th className="px-3 py-3 text-right border border-slate-300 whitespace-nowrap">NPOPTKP</th>
                <th className="px-3 py-3 text-right border border-slate-300 whitespace-nowrap">NPOP Kena Pajak</th>
                <th className="px-2.5 py-3 text-center border border-slate-300 whitespace-nowrap">Tarif</th>
                <th className="px-3 py-3 text-right border border-slate-300 whitespace-nowrap">BPHTB Terutang</th>
                <th className="px-3 py-3 text-center border border-slate-300 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center text-slate-500 border border-slate-300">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data rekap pendaftaran BPHTB...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center text-slate-500 border border-slate-300">
                    Tidak ada data pendaftaran BPHTB yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const itemIndex = limit === -1 ? idx + 1 : (page - 1) * limit + idx + 1;
                  const isLunas = item.statusBayar === 1;

                  return (
                    <tr key={item.idBerkas} className="hover:bg-slate-50/80 transition">
                      <td className="px-2.5 py-2.5 text-center border border-slate-300 font-mono text-slate-600">
                        {itemIndex}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 font-semibold font-mono text-slate-900 whitespace-nowrap">
                        {item.noBerkas || "-"}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-center font-mono text-slate-700 whitespace-nowrap">
                        {formatDateDMY(item.tglBerkas)}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 font-medium text-slate-900">
                        {item.namaWpBaru || item.namaWp || "-"}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-center font-mono text-slate-700 whitespace-nowrap">
                        {formatNop(item.nop)}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-slate-800 whitespace-nowrap">
                        {item.jenisPerolehan || item.keterangan || "Jual Beli"}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-right font-mono text-slate-900 whitespace-nowrap">
                        {formatRupiahNumber(item.npop)}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-right font-mono text-slate-600 whitespace-nowrap">
                        {formatRupiahNumber(item.npoptkp)}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-right font-mono text-slate-900 whitespace-nowrap">
                        {formatRupiahNumber(item.npopkp)}
                      </td>
                      <td className="px-2.5 py-2.5 border border-slate-300 text-center font-mono text-slate-700 whitespace-nowrap">
                        {Number(item.tarif || 5)}%
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiahNumber(item.bphtb)}
                      </td>
                      <td className="px-3 py-2.5 border border-slate-300 text-center whitespace-nowrap">
                        {isLunas ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            Belum Lunas
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/90 text-slate-900 font-extrabold border-2 border-slate-400">
                  <td colSpan={5} className="px-3 py-3 text-center border border-slate-300 text-slate-400">
                    -
                  </td>
                  <td className="px-3 py-3 border border-slate-300 text-left font-black text-xs uppercase tracking-wider text-slate-900 whitespace-nowrap">
                    TOTAL
                  </td>
                  <td className="px-3 py-3 border border-slate-300 text-right font-mono font-black text-xs text-slate-900 whitespace-nowrap">
                    {formatRupiahNumber(currentTotals.totNpop)}
                  </td>
                  <td className="px-3 py-3 border border-slate-300 text-right font-mono font-bold text-slate-600 whitespace-nowrap">
                    {formatRupiahNumber(currentTotals.totNpoptkp)}
                  </td>
                  <td className="px-3 py-3 border border-slate-300 text-right font-mono font-black text-xs text-slate-900 whitespace-nowrap">
                    {formatRupiahNumber(currentTotals.totNpopkp)}
                  </td>
                  <td className="px-2.5 py-3 border border-slate-300 text-center text-slate-400">
                    -
                  </td>
                  <td className="px-3 py-3 border border-slate-300 text-right font-mono font-black text-xs text-slate-900 whitespace-nowrap">
                    {formatRupiahNumber(currentTotals.totBphtb)}
                  </td>
                  <td className="px-3 py-3 border border-slate-300 text-center text-slate-400">
                    -
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* PRINT-ONLY TABLE (Renders all filtered items across landscape pages) */}
          <table className="hidden print:table w-full text-left border-collapse text-[8pt]">
            <thead>
              <tr className="bg-gray-100 text-black font-bold border border-black">
                <th className="px-1 py-1.5 text-center border border-black w-8">No</th>
                <th className="px-2 py-1.5 text-left border border-black whitespace-nowrap">No. SSPD/BPHTB</th>
                <th className="px-1.5 py-1.5 text-center border border-black whitespace-nowrap">Tanggal</th>
                <th className="px-2 py-1.5 text-left border border-black">Nama Wajib Pajak</th>
                <th className="px-2 py-1.5 text-center border border-black whitespace-nowrap">NOP/NOPD</th>
                <th className="px-2 py-1.5 text-left border border-black whitespace-nowrap">Jenis Perolehan</th>
                <th className="px-2 py-1.5 text-right border border-black whitespace-nowrap">NPOP</th>
                <th className="px-2 py-1.5 text-right border border-black whitespace-nowrap">NPOPTKP</th>
                <th className="px-2 py-1.5 text-right border border-black whitespace-nowrap">NPOP Kena Pajak</th>
                <th className="px-1 py-1.5 text-center border border-black whitespace-nowrap">Tarif</th>
                <th className="px-2 py-1.5 text-right border border-black whitespace-nowrap">BPHTB Terutang</th>
                <th className="px-1.5 py-1.5 text-center border border-black whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="text-black font-medium">
              {filteredData.map((item, idx) => (
                <tr key={item.idBerkas} className="border border-black">
                  <td className="px-1 py-1 text-center border border-black font-mono">{idx + 1}</td>
                  <td className="px-2 py-1 border border-black font-mono font-bold whitespace-nowrap">{item.noBerkas || "-"}</td>
                  <td className="px-1.5 py-1 border border-black text-center font-mono whitespace-nowrap">{formatDateDMY(item.tglBerkas)}</td>
                  <td className="px-2 py-1 border border-black">{item.namaWpBaru || item.namaWp || "-"}</td>
                  <td className="px-2 py-1 border border-black text-center font-mono whitespace-nowrap">{formatNop(item.nop)}</td>
                  <td className="px-2 py-1 border border-black whitespace-nowrap">{item.jenisPerolehan || item.keterangan || "Jual Beli"}</td>
                  <td className="px-2 py-1 border border-black text-right font-mono whitespace-nowrap">{formatRupiahNumber(item.npop)}</td>
                  <td className="px-2 py-1 border border-black text-right font-mono whitespace-nowrap">{formatRupiahNumber(item.npoptkp)}</td>
                  <td className="px-2 py-1 border border-black text-right font-mono whitespace-nowrap">{formatRupiahNumber(item.npopkp)}</td>
                  <td className="px-1 py-1 border border-black text-center font-mono whitespace-nowrap">{Number(item.tarif || 5)}%</td>
                  <td className="px-2 py-1 border border-black text-right font-mono font-bold whitespace-nowrap">{formatRupiahNumber(item.bphtb)}</td>
                  <td className="px-1.5 py-1 border border-black text-center font-semibold whitespace-nowrap">
                    {item.statusBayar === 1 ? "Lunas" : "Belum Lunas"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 text-black font-black border-2 border-black">
                <td colSpan={5} className="px-2 py-1.5 text-center border border-black">-</td>
                <td className="px-2 py-1.5 border border-black text-left font-black uppercase whitespace-nowrap">TOTAL</td>
                <td className="px-2 py-1.5 border border-black text-right font-mono font-black whitespace-nowrap">{formatRupiahNumber(currentTotals.totNpop)}</td>
                <td className="px-2 py-1.5 border border-black text-right font-mono font-bold whitespace-nowrap">{formatRupiahNumber(currentTotals.totNpoptkp)}</td>
                <td className="px-2 py-1.5 border border-black text-right font-mono font-black whitespace-nowrap">{formatRupiahNumber(currentTotals.totNpopkp)}</td>
                <td className="px-1 py-1.5 border border-black text-center">-</td>
                <td className="px-2 py-1.5 border border-black text-right font-mono font-black whitespace-nowrap">{formatRupiahNumber(currentTotals.totBphtb)}</td>
                <td className="px-1.5 py-1.5 border border-black text-center">-</td>
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

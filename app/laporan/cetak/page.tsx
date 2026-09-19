"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  FileBarChart2,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Building,
} from "lucide-react";
import * as XLSX from "xlsx";
import ReportSignatures from "@/components/ReportSignatures";

export default function CetakLaporanKomprehensifPage() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [statusBayar, setStatusBayar] = useState("");
  const [kecamatans, setKecamatans] = useState<any[]>([]);

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
      params.append("jenis", "semua");
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (kecamatan) params.append("kecamatan", kecamatan);
      if (statusBayar !== "") params.append("statusBayar", statusBayar);

      const res = await fetch(`/api/laporan?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setSummary(json.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKecamatans();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, kecamatan, statusBayar]);

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const handleExportExcel = () => {
    const exportRows = data.map((item, index) => ({
      No: index + 1,
      "No. Berkas": item.noBerkas,
      "Tgl Berkas": item.tglBerkas ? new Date(item.tglBerkas).toLocaleDateString("id-ID") : "-",
      NOP: item.nop,
      "Nama WP Lama": item.namaWp,
      "Nama WP Baru": item.namaWpBaru,
      "Lokasi Objek": item.lokasiOp,
      Kecamatan: item.kecamatanOp,
      "Luas Bumi (m2)": Number(item.luasBumi || 0),
      "Luas Bangunan (m2)": Number(item.luasBangunan || 0),
      "Total NJOP (Rp)": Number(item.nilaiPbb || 0),
      "Nilai Transaksi (Rp)": Number(item.nilaiTransaksi || 0),
      "NPOP (Rp)": Number(item.npop || 0),
      "NPOPTKP (Rp)": Number(item.npoptkp || 0),
      "NPOPKP (Rp)": Number(item.npopkp || 0),
      "BPHTB Terutang (Rp)": Number(item.bphtb || 0),
      "No. Kohir": item.kdKohir || "-",
      "No. STS": item.noSts || "-",
      "Status Bayar": item.statusBayar === 1 ? "LUNAS" : "BELUM BAYAR",
      "Tgl Bayar": item.tglBayar ? new Date(item.tglBayar).toLocaleDateString("id-ID") : "-",
      PPAT: item.ppat || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan_BPHTB");
    XLSX.writeFile(workbook, `Laporan_BPHTB_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <DashboardShell active="laporan">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-red-600 text-xs font-semibold mb-2">
            <FileBarChart2 size={14} /> Cetak & Export
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Cetak Laporan Komprehensif BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kustomisasi filter data, export ke Excel, atau cetak dokumen resmi untuk laporan berkala pimpinan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-500/30 text-emerald-700 font-bold text-xs flex items-center gap-2 border border-emerald-500/30 transition"
          >
            <FileSpreadsheet size={15} /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition"
          >
            <Printer size={15} /> Cetak Dokumen Resmi
          </button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white border border-slate-200 p-4 rounded-2xl text-xs print:hidden">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Periode Dari</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Sampai Dengan</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Kecamatan</label>
          <select
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500"
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
          <label className="block text-slate-500 font-semibold mb-1">Status Pembayaran</label>
          <select
            value={statusBayar}
            onChange={(e) => setStatusBayar(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500"
          >
            <option value="">Semua Status</option>
            <option value="1">Lunas</option>
            <option value="0">Belum Bayar / Piutang</option>
          </select>
        </div>
      </div>

      {/* Official Printable Report Container */}
      <div className="bg-white/95 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Printable Official Header */}
        <div className="text-center border-b-2 border-slate-200 print:border-black pb-4 space-y-1">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 print:text-black">
            PEMERINTAH DAERAH KABUPATEN / KOTA
          </h2>
          <h3 className="text-lg sm:text-xl font-black uppercase text-red-600 print:text-black">
            BADAN PENDAPATAN DAERAH (BAPENDA)
          </h3>
          <p className="text-xs text-slate-500 print:text-gray-600">
            Laporan Rekapitulasi Pelayanan & Realisasi Pajak Bea Perolehan Hak Atas Tanah dan Bangunan (BPHTB)
          </p>
          <p className="text-[11px] text-slate-500 print:text-gray-600 font-medium">
            Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}
          </p>
        </div>

        {/* Aggregate Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 print:bg-gray-100 border border-slate-200 print:border-gray-300">
            <p className="text-slate-500 print:text-gray-600">Total Berkas:</p>
            <p className="text-lg font-bold text-slate-900 print:text-black">{data.length} Berkas</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 print:bg-gray-100 border border-slate-200 print:border-gray-300">
            <p className="text-slate-500 print:text-gray-600">Total NPOP:</p>
            <p className="text-base font-bold text-red-700 print:text-black">{formatRupiah(summary.totalNpop || 0)}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 print:bg-gray-100 border border-slate-200 print:border-gray-300">
            <p className="text-slate-500 print:text-gray-600">Total Ketetapan:</p>
            <p className="text-base font-bold text-slate-900 print:text-black">{formatRupiah(summary.totalBphtb || 0)}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 print:bg-gray-100 border border-emerald-500/30 print:border-gray-300">
            <p className="text-emerald-600 print:text-gray-600 font-semibold">Total Realisasi Lunas:</p>
            <p className="text-base font-black text-emerald-600 print:text-black">{formatRupiah(summary.totalSudahBayar || 0)}</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 print:text-black print:border-collapse">
            <thead className="bg-slate-50 print:bg-gray-200 text-slate-500 print:text-black uppercase tracking-wider font-semibold border-b border-slate-200 print:border-black">
              <tr>
                <th className="px-3 py-2.5 print:border print:border-black">No</th>
                <th className="px-3 py-2.5 print:border print:border-black">No. Berkas & Tgl</th>
                <th className="px-3 py-2.5 print:border print:border-black">NOP</th>
                <th className="px-3 py-2.5 print:border print:border-black">Nama Wajib Pajak Baru</th>
                <th className="px-3 py-2.5 print:border print:border-black">Kecamatan</th>
                <th className="px-3 py-2.5 text-right print:border print:border-black">NPOP (Rp)</th>
                <th className="px-3 py-2.5 text-right print:border print:border-black">BPHTB (Rp)</th>
                <th className="px-3 py-2.5 text-center print:border print:border-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-black font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data yang sesuai filter laporan.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.idBerkas} className="hover:bg-slate-100">
                    <td className="px-3 py-2 text-slate-500 print:text-black font-mono print:border print:border-black">{idx + 1}</td>
                    <td className="px-3 py-2 print:border print:border-black">
                      <p className="font-bold text-slate-900 print:text-black">{item.noBerkas}</p>
                      <p className="text-[10px] text-slate-500 print:text-gray-600">
                        {item.tglBerkas ? new Date(item.tglBerkas).toLocaleDateString("id-ID") : "-"}
                      </p>
                    </td>
                    <td className="px-3 py-2 font-mono text-red-600 print:text-black print:border print:border-black">
                      {item.nop}
                    </td>
                    <td className="px-3 py-2 text-slate-900 print:text-black font-semibold print:border print:border-black">
                      {item.namaWpBaru}
                    </td>
                    <td className="px-3 py-2 text-slate-700 print:text-black print:border print:border-black">
                      {item.kecamatanOp}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-800 print:text-black print:border print:border-black">
                      {formatRupiah(item.npop)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-600 print:text-black print:border print:border-black">
                      {formatRupiah(item.bphtb)}
                    </td>
                    <td className="px-3 py-2 text-center print:border print:border-black">
                      {item.statusBayar === 1 ? (
                        <span className="text-emerald-600 print:text-black font-bold text-[11px]">
                          LUNAS
                        </span>
                      ) : (
                        <span className="text-amber-600 print:text-black font-bold text-[11px]">
                          TERTUNDA
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signature Box for Official Print from Master Pejabat */}
        <ReportSignatures />
      </div>
    </DashboardShell>
  );
}

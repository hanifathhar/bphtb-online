"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { BadgeAlert, Printer, Clock } from "lucide-react";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import ReportSignatures from "@/components/ReportSignatures";

export default function RekapPiutangPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(currentYearStr);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [tahun]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("jenis", "piutang");
        if (tahun) params.append("tahun", tahun);

        const res = await fetch(`/api/laporan?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
          setSummary(json.summary || {});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tahun]);

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const totalPages = Math.ceil(data.length / limit) || 1;
  const paginatedData = data.slice((page - 1) * limit, page * limit);

  return (
    <DashboardShell active="laporan">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-amber-600 text-xs font-semibold mb-2">
            <BadgeAlert size={14} /> Monitoring Tunggakan
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Rekap Piutang BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar penetapan ketetapan pajak BPHTB yang belum disetorkan atau telah melewati tanggal jatuh tempo pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <YearFilter
            selectedYear={tahun}
            onChange={(y) => setTahun(y)}
          />
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 border border-slate-200"
          >
            <Printer size={15} /> Cetak Rekap Piutang
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Jumlah Berkas Belum Bayar</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.length} Berkas</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Potensi Piutang BPHTB</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatRupiah(summary.totalBelumBayar || 0)}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Kohir / Berkas</th>
                <th className="px-4 py-3">NOP Objek Pajak</th>
                <th className="px-4 py-3">Nama Wajib Pajak</th>
                <th className="px-4 py-3">Jatuh Tempo</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Piutang Terutang (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Memuat data piutang BPHTB...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Tidak ada piutang BPHTB yang tercatat.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.idBerkas} className="hover:bg-slate-100 transition">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 font-mono">{item.kdKohir || "BELUM_SKP"}</p>
                      <p className="text-[11px] text-slate-500">{item.noBerkas}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-red-600">
                      {item.nop}
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 font-bold">
                      {item.namaWpBaru}
                    </td>
                    <td className="px-4 py-3.5 text-amber-600 font-semibold">
                      {item.tglTempo ? new Date(item.tglTempo).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-amber-600 text-sm">
                      {formatRupiah(item.nilaiBelumDibayar || item.bphtb)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={data.length}
          limit={limit}
        />

        {/* Print Signature Section from Master Pejabat */}
        <ReportSignatures />
      </div>
    </DashboardShell>
  );
}

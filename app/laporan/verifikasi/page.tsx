"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import { CheckSquare, Printer, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import ReportSignatures from "@/components/ReportSignatures";

export default function RekapVerifikasiPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState(currentYearStr);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [search, tahun]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("jenis", "verifikasi");
        if (tahun) params.append("tahun", tahun);

        const res = await fetch(`/api/laporan?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
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

  const filteredData = data.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      item.noBerkas?.toLowerCase().includes(s) ||
      item.nop?.toLowerCase().includes(s) ||
      item.namaWpBaru?.toLowerCase().includes(s) ||
      item.userVerif1?.toLowerCase().includes(s) ||
      item.userVerif2?.toLowerCase().includes(s) ||
      item.userVerif3?.toLowerCase().includes(s)
    );
  });

  return (
    <DashboardShell active="laporan">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-red-600 text-xs font-semibold mb-2">
            <CheckSquare size={14} /> Pelaporan & Monitoring
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Rekap Verifikasi Berjenjang
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitoring rekam jejak petugas dan waktu persetujuan Verifikasi 1 (Staf), Verifikasi 2 (Kasie), dan Verifikasi 3 (Kabid).
          </p>
        </div>


      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari No. Berkas, NOP, WP, Petugas Verifikasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs"
          />
        </div>

        <YearFilter
          selectedYear={tahun}
          onChange={(y) => setTahun(y)}
        />
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Berkas</th>
                <th className="px-4 py-3">Wajib Pajak Baru</th>
                <th className="px-4 py-3 text-center">Verifikasi 1 (Staf)</th>
                <th className="px-4 py-3 text-center">Verifikasi 2 (Kasie)</th>
                <th className="px-4 py-3 text-center">Verifikasi 3 (Kabid)</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Nilai Pajak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat data rekap verifikasi...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Belum ada data verifikasi yang sesuai.
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(filteredData.length / limit) || 1;
                  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.idBerkas} className="hover:bg-slate-100 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{item.noBerkas}</p>
                        <p className="text-[11px] text-red-600 font-mono">{item.nop}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-bold">
                        {item.namaWpBaru}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.verif1 === 1 ? (
                          <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <CheckCircle size={13} /> {item.userVerif1 || "Disetujui"}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium flex items-center justify-center gap-1">
                            <Clock size={13} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.verif2 === 1 ? (
                          <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <CheckCircle size={13} /> {item.userVerif2 || "Disetujui"}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium flex items-center justify-center gap-1">
                            <Clock size={13} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.verif3 === 1 ? (
                          <span className="text-purple-700 font-bold flex items-center justify-center gap-1">
                            <CheckCircle size={13} /> {item.userVerif3 || "Ditetapkan"}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium flex items-center justify-center gap-1">
                            <Clock size={13} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatRupiah(item.bphtb)}
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(data.length / limit) || 1}
          totalItems={data.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />

        {/* Print Signature Section from Master Pejabat */}
        <ReportSignatures />
      </div>
    </DashboardShell>
  );
}

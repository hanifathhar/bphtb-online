"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import {
  Receipt,
  Search,
  Eye,
  Printer,
  ChevronDown,
} from "lucide-react";
import { formatNoSts } from "@/lib/sspd";

export default function KetetapanSkpPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState(currentYearStr);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, tahun]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("statusBerkas", "4,5");
      if (tahun) params.append("tahun", tahun);
      params.append("limit", "2000");

      const res = await fetch(`/api/bphtb?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      item.kdKohir?.toLowerCase().includes(s) ||
      item.noSts?.toLowerCase().includes(s)
    );
  });

  return (
    <DashboardShell active="ketetapan">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 text-xs font-semibold mb-2">
            <Receipt size={14} /> Penetapan SKP & Kohir Pajak
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Ketetapan SKPD BPHTB & Nomor Kohir
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar Surat Ketetapan Pajak Daerah (SKPD) BPHTB resmi yang telah diterbitkan dan siap dibayar oleh Wajib Pajak.
          </p>
        </div>
      </div>

      {/* Search & Year Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari No. Kohir, No. Berkas, NOP, WP, No. STS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-xs"
          />
        </div>

        <YearFilter
          selectedYear={tahun}
          onChange={(y) => {
            setTahun(y);
            setPage(1);
          }}
        />
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto min-h-[320px] pb-12">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Kohir / SKP</th>
                <th className="px-4 py-3">No. Berkas & NOP</th>
                <th className="px-4 py-3">Nama Wajib Pajak Baru</th>
                <th className="px-4 py-3">No. STS / Tgl Tempo</th>
                <th className="px-4 py-3 text-right">Nominal Ketetapan</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat daftar ketetapan SKP...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Tidak ditemukan berkas ketetapan SKP yang sesuai.
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(filteredData.length / limit) || 1;
                  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.idBerkas} className="hover:bg-slate-100 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 font-mono">{item.kdKohir || "KOHIR-PENDING"}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.tglSkp ? new Date(item.tglSkp).toLocaleDateString("id-ID") : "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{item.noBerkas}</p>
                        <p className="text-[11px] font-mono text-red-600">{item.nop}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-900 font-bold">{item.namaWpBaru}</p>
                        <p className="text-[11px] text-slate-500">PPAT: {item.ppat || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-800 font-mono">
                          {item.noSts || "-"}
                        </p>
                        <p className="text-[11px] text-amber-600 font-semibold">
                          Tempo: {item.tglTempo ? new Date(item.tglTempo).toLocaleDateString("id-ID") : "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-emerald-600 text-sm">
                        {formatRupiah(item.bphtb)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === item.idBerkas ? null : item.idBerkas);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold shadow-xs transition"
                          >
                            <span>Aksi</span>
                            <ChevronDown
                              size={14}
                              className={`text-slate-500 transition-transform duration-200 ${
                                openDropdownId === item.idBerkas ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {openDropdownId === item.idBerkas && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 text-left"
                            >
                              <div className="py-1">
                                <Link
                                  href={`/bphtb/berkas/${item.idBerkas}`}
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                                >
                                  <Eye size={14} className="text-slate-500" />
                                  <span>Lihat Detail</span>
                                </Link>
                                <Link
                                  href={`/bphtb/berkas/${item.idBerkas}/cetak-skp`}
                                  target="_blank"
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-cyan-700 hover:bg-cyan-50 font-semibold transition"
                                >
                                  <Printer size={14} className="text-cyan-600" />
                                  <span>Cetak SKP</span>
                                </Link>
                                <Link
                                  href={`/bphtb/berkas/${item.idBerkas}/cetak`}
                                  target="_blank"
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                                >
                                  <Printer size={14} className="text-red-500" />
                                  <span>Cetak SSPD</span>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
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
          totalPages={Math.ceil(filteredData.length / limit) || 1}
          totalItems={filteredData.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </DashboardShell>
  );
}

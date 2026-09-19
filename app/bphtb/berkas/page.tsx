"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import {
  Files,
  Search,
  Filter,
  PlusCircle,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Printer,
  Edit,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function DaftarBerkasBphtbPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusBerkas, setStatusBerkas] = useState("");
  const [statusBayar, setStatusBayar] = useState("");
  const [tahun, setTahun] = useState(currentYearStr);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const fetchBerkas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (statusBerkas !== "") params.append("statusBerkas", statusBerkas);
      if (statusBayar !== "") params.append("statusBayar", statusBayar);
      if (tahun !== "") params.append("tahun", tahun);
      params.append("page", String(page));
      params.append("limit", "10");

      const res = await fetch(`/api/bphtb?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setTotalPages(json.totalPages || 1);
        setTotalItems(json.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerkas();
  }, [page, statusBerkas, statusBayar, tahun]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBerkas();
  };

  const handleQuickRollback = async (idBerkas: number, noBerkas: string) => {
    if (!confirm(`Rollback berkas ${noBerkas} dan masukkan kembali ke antrean Verifikasi 1?`)) return;
    try {
      const res = await fetch(`/api/bphtb/${idBerkas}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus: 1, catatan: "Rollback dari tabel daftar berkas" }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Berkas berhasil di-rollback");
        fetchBerkas();
      } else {
        toast.error(json.error || "Gagal melakukan rollback");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    }
  };

  const handleQuickDelete = async (idBerkas: number, noBerkas: string) => {
    if (!confirm(`Hapus berkas ${noBerkas} secara permanen? Data yang dihapus tidak dapat dikembalikan.`)) return;
    try {
      const res = await fetch(`/api/bphtb/${idBerkas}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Berkas berhasil dihapus");
        fetchBerkas();
      } else {
        toast.error(json.error || "Gagal menghapus berkas");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    }
  };

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const getStatusBadge = (bStatus: number, bayarStatus: number) => {
    if (bayarStatus === 1) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 text-emerald-600 border border-emerald-500/30 flex items-center gap-1 w-fit">
          <CheckCircle size={12} /> Lunas
        </span>
      );
    }
    switch (bStatus) {
      case 1:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit">
            <Clock size={12} /> Menunggu Verif 1
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 text-amber-600 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock size={12} /> Menunggu Verif 2
          </span>
        );
      case 3:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 text-purple-700 border border-purple-500/30 flex items-center gap-1 w-fit">
            <Clock size={12} /> Menunggu Verif 3
          </span>
        );
      case 4:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 text-cyan-700 border border-cyan-500/30 flex items-center gap-1 w-fit">
            <Receipt size={12} /> SKP Terbit (Belum Bayar)
          </span>
        );
      case 9:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 text-rose-600 border border-rose-500/30 flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> Ditolak / Revisi
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-500 border border-slate-500/30 w-fit">
            Draft
          </span>
        );
    }
  };

  return (
    <DashboardShell active="berkas">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-red-600 text-xs font-semibold mb-2">
            <Files size={14} /> Pelayanan Pajak Daerah
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Daftar Berkas Permohonan BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencarian, pemantauan status proses, dan riwayat berkas BPHTB.
          </p>
        </div>

        <Link
          href="/bphtb/pendaftaran"
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold  text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition w-fit"
        >
          <PlusCircle size={16} />
          <span>Pendaftaran Baru</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Status Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { label: "Semua Status", status: "", bayar: "" },
            { label: "Menunggu Verif 1", status: "1", bayar: "" },
            { label: "Menunggu Verif 2", status: "2", bayar: "" },
            { label: "Menunggu Verif 3", status: "3", bayar: "" },
            { label: "SKP Siap Bayar", status: "4", bayar: "0" },
            { label: "Lunas", status: "", bayar: "1" },
            { label: "Ditolak / Revisi", status: "9", bayar: "" },
          ].map((tab, i) => {
            const isActive =
              statusBerkas === tab.status && statusBayar === tab.bayar;
            return (
              <button
                key={i}
                onClick={() => {
                  setStatusBerkas(tab.status);
                  setStatusBayar(tab.bayar);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                    : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Year Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan No. Berkas, NOP, Nama WP, atau No. Kohir..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 transition"
            >
              Cari
            </button>
          </form>

          <YearFilter
            selectedYear={tahun}
            onChange={(y) => {
              setTahun(y);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan total <strong>{totalItems}</strong> berkas</span>
          <span>Halaman {page} dari {totalPages}</span>
        </div>

        <div className="overflow-x-auto min-h-[320px] pb-12">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Berkas & Tgl</th>
                <th className="px-4 py-3">NOP Objek Pajak</th>
                <th className="px-4 py-3">Wajib Pajak Baru (Pembeli)</th>
                <th className="px-4 py-3">Kecamatan / Lokasi</th>
                <th className="px-4 py-3 text-right">Nilai BPHTB</th>
                <th className="px-4 py-3 text-center">Status Alur</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Memuat data berkas BPHTB...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Tidak ditemukan berkas BPHTB yang sesuai.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.idBerkas} className="hover:bg-slate-100 transition">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{item.noBerkas || "DRAFT"}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.tglBerkas ? new Date(item.tglBerkas).toLocaleDateString("id-ID") : "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-red-600 font-semibold">{item.nop || "-"}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        PPAT: {item.ppat || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-800 font-semibold">{item.namaWpBaru || "-"}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        NIK: {item.nikWpBaru || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-800">{item.kecamatanOp || "-"}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {item.lokasiOp || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatRupiah(item.bphtb)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(item.statusBerkas, item.statusBayar)}
                      </div>
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
                              {item.statusBerkas >= 4 && item.statusBerkas !== 9 && (
                                <Link
                                  href={`/bphtb/berkas/${item.idBerkas}/cetak-skp`}
                                  target="_blank"
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-cyan-700 hover:bg-cyan-50 font-semibold transition"
                                >
                                  <Printer size={14} className="text-cyan-600" />
                                  <span>Cetak SKP</span>
                                </Link>
                              )}
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

                            {item.statusBerkas === 9 && (
                              <div className="py-1">
                                <Link
                                  href={`/bphtb/berkas/${item.idBerkas}/edit`}
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50 font-medium transition"
                                >
                                  <Edit size={14} className="text-amber-600" />
                                  <span>Perbaiki Data</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleQuickRollback(item.idBerkas, item.noBerkas);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-blue-700 hover:bg-blue-50 font-medium transition text-left"
                                >
                                  <RotateCcw size={14} className="text-blue-600" />
                                  <span>Rollback Berkas</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleQuickDelete(item.idBerkas, item.noBerkas);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 font-medium transition text-left"
                                >
                                  <Trash2 size={14} className="text-rose-600" />
                                  <span>Hapus Berkas</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </DashboardShell>
  );
}

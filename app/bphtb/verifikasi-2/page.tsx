"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import {
  ShieldCheck,
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function Verifikasi2Page() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState(currentYearStr);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedBerkas, setSelectedBerkas] = useState<any>(null);
  const [actionModal, setActionModal] = useState({
    open: false,
    status: 1, // 1: setuju, 2: tolak
    catatan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, tahun]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("statusBerkas", "2");
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

  const handleVerifSubmit = async () => {
    if (!selectedBerkas) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${selectedBerkas.idBerkas}/verifikasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tahap: 2,
          status: actionModal.status,
          catatan: actionModal.catatan || (actionModal.status === 1 ? "Perhitungan NPOP, NPOPTKP, dan tarif BPHTB telah divalidasi." : "Terdapat ketidaksesuaian nilai transaksi/NJOP."),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal memproses verifikasi 2");
        setSubmitting(false);
        return;
      }

      toast.success("Verifikasi 2 berhasil disimpan. Berkas diteruskan ke Verifikasi 3.");
      setActionModal({ open: false, status: 1, catatan: "" });
      setSelectedBerkas(null);
      fetchData();
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

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
      item.userVerif1?.toLowerCase().includes(s)
    );
  });

  return (
    <DashboardShell active="verif2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-amber-600 text-xs font-semibold mb-2">
            <ShieldCheck size={14} /> Tahap 2: Verifikasi Teknis Kasie
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Antrean Verifikasi 2 (Kasie Teknis)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Validasi perhitungan matematis NPOP, pengurangan NPOPTKP, tarif 5%, serta kelayakan dasar pengenaan pajak.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari berdasarkan No. Berkas, NOP, Nama WP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Berkas & NOP</th>
                <th className="px-4 py-3">Wajib Pajak Baru</th>
                <th className="px-4 py-3">Total NJOP PBB</th>
                <th className="px-4 py-3">Nilai Transaksi Pasar</th>
                <th className="px-4 py-3 text-right">BPHTB Terutang</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi Kasie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat antrean verifikasi 2...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Tidak ada berkas yang menunggu Verifikasi 2 yang sesuai.
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
                        <p className="text-[11px] font-mono text-red-600">{item.nop}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-900 font-bold">{item.namaWpBaru}</p>
                        <p className="text-[11px] text-slate-500">Verif 1 oleh: {item.userVerif1 || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-800">
                        {formatRupiah(item.nilaiPbb)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800">
                        {formatRupiah(item.nilaiTransaksi)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatRupiah(item.bphtb)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/bphtb/berkas/${item.idBerkas}`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedBerkas(item);
                              setActionModal({ open: true, status: 1, catatan: "Perhitungan NPOP, NPOPTKP, dan tarif BPHTB telah divalidasi." });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md shadow-amber-500/20"
                          >
                            <ShieldCheck size={13} />
                            Proses Verif 2
                          </button>
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

      {/* Verification Modal */}
      {actionModal.open && selectedBerkas && (
        <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-amber-600" />
              Verifikasi 2 - Berkas {selectedBerkas.noBerkas}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="text-slate-500">Total NJOP: <strong className="text-slate-800">{formatRupiah(selectedBerkas.nilaiPbb)}</strong></p>
              <p className="text-slate-500">Nilai Transaksi: <strong className="text-slate-800">{formatRupiah(selectedBerkas.nilaiTransaksi)}</strong></p>
              <p className="text-slate-500">NPOPKP: <strong className="text-red-600">{formatRupiah(selectedBerkas.npopkp)}</strong></p>
              <p className="text-slate-500">BPHTB Terutang: <strong className="text-emerald-600 font-bold">{formatRupiah(selectedBerkas.bphtb)}</strong></p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keputusan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionModal({ ...actionModal, status: 1 })}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      actionModal.status === 1
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200 text-emerald-700 border-emerald-500/50"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    Setujui & Lanjut V3
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionModal({ ...actionModal, status: 2 })}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      actionModal.status === 2
                        ? "bg-rose-50 text-rose-700 border border-rose-200 text-rose-700 border-rose-500/50"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    Tolak / Koreksi
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Kasie Teknis</label>
                <textarea
                  rows={3}
                  value={actionModal.catatan}
                  onChange={(e) => setActionModal({ ...actionModal, catatan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActionModal({ ...actionModal, open: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleVerifSubmit}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Simpan Keputusan Kasie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import {
  CheckSquare,
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function Verifikasi1Page() {
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
      params.append("statusBerkas", "1");
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
          tahap: 1,
          status: actionModal.status,
          catatan: actionModal.catatan || (actionModal.status === 1 ? "Dokumen fisik & digital lengkap sesuai ketentuan." : "Dokumen belum lengkap."),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal memproses verifikasi 1");
        setSubmitting(false);
        return;
      }

      toast.success("Verifikasi 1 berhasil disimpan. Berkas diteruskan ke Verifikasi 2.");
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
      item.kelurahanOp?.toLowerCase().includes(s) ||
      item.kecamatanOp?.toLowerCase().includes(s)
    );
  });

  return (
    <DashboardShell active="verif1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-blue-600 text-xs font-semibold mb-2">
            <CheckSquare size={14} /> Tahap 1: Verifikasi Lapangan & Administrasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Antrean Verifikasi 1 (Petugas Staf)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pemeriksaan keabsahan berkas permohonan, dokumen identitas (KTP/NPWP), dan kesesuaian fisik objek pajak.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari berdasarkan No. Berkas, NOP, Nama WP, Kelurahan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
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
                <th className="px-4 py-3 rounded-l-xl">No. Berkas & Tgl</th>
                <th className="px-4 py-3">NOP Objek Pajak</th>
                <th className="px-4 py-3">Nama Wajib Pajak Baru</th>
                <th className="px-4 py-3">Lokasi Tanah / Bangunan</th>
                <th className="px-4 py-3 text-right">BPHTB Terutang</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi Pemeriksaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat antrean verifikasi 1...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Tidak ada berkas yang menunggu Verifikasi 1 yang sesuai.
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
                        <p className="text-[11px] text-slate-500">
                          {item.tglBerkas ? new Date(item.tglBerkas).toLocaleDateString("id-ID") : "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-red-600 font-semibold">
                        {item.nop}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-900 font-bold">{item.namaWpBaru}</p>
                        <p className="text-[11px] text-slate-500">NIK: {item.nikWpBaru || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-800">{item.kelurahanOp}, {item.kecamatanOp}</p>
                        <p className="text-[11px] text-slate-500">Luas: {Number(item.luasBumi || 0)}m² / {Number(item.luasBangunan || 0)}m²</p>
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
                              setActionModal({ open: true, status: 1, catatan: "Dokumen fisik & digital lengkap sesuai ketentuan." });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md shadow-blue-500/20"
                          >
                            <CheckSquare size={13} />
                            Proses Verif 1
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
              <CheckSquare size={20} className="text-blue-400" />
              Verifikasi 1 - Berkas {selectedBerkas.noBerkas}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="text-slate-500">Pemohon / Pembeli: <strong className="text-slate-900">{selectedBerkas.namaWpBaru}</strong></p>
              <p className="text-slate-500">NOP: <strong className="text-red-600 font-mono">{selectedBerkas.nop}</strong></p>
              <p className="text-slate-500">Ketetapan BPHTB: <strong className="text-emerald-600">{formatRupiah(selectedBerkas.bphtb)}</strong></p>
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
                    Setujui & Lanjut V2
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
                    Tolak / Minta Revisi
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Pemeriksaan</label>
                <textarea
                  rows={3}
                  value={actionModal.catatan}
                  onChange={(e) => setActionModal({ ...actionModal, catatan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Simpan Hasil Verifikasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

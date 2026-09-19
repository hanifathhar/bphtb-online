"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import {
  Award,
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  Receipt,
  RotateCcw,
  Printer,
  History,
  Clock,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { formatNoSts } from "@/lib/sspd";

export default function Verifikasi3Page() {
  const currentYearStr = new Date().getFullYear().toString();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState(currentYearStr);
  const [selectedBerkas, setSelectedBerkas] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, tahun]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Modal Verifikasi (Setujui / Tolak)
  const [actionModal, setActionModal] = useState({
    open: false,
    status: 1, // 1: setuju, 2: tolak
    catatan: "",
  });

  // Modal Batal Verifikasi
  const [batalModal, setBatalModal] = useState({
    open: false,
    catatan: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("statusBerkas", activeTab === "pending" ? "3" : "4,5");
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
  }, [activeTab, tahun]);

  const handleVerifSubmit = async () => {
    if (!selectedBerkas) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${selectedBerkas.idBerkas}/verifikasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tahap: 3,
          status: actionModal.status,
          catatan:
            actionModal.catatan ||
            (actionModal.status === 1
              ? "Penetapan SKP & Kohir disetujui secara resmi."
              : "Ditolak oleh Kabid."),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal memproses verifikasi 3");
        setSubmitting(false);
        return;
      }

      toast.success(
        actionModal.status === 1
          ? "SKP dan Kohir berhasil diterbitkan! Berkas siap dilakukan pembayaran."
          : "Berkas berhasil ditolak / dikembalikan."
      );
      setActionModal({ open: false, status: 1, catatan: "" });
      setSelectedBerkas(null);
      fetchData();
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatalVerifSubmit = async () => {
    if (!selectedBerkas) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${selectedBerkas.idBerkas}/verifikasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tahap: 3,
          status: 0, // 0 = Batal Verifikasi
          catatan:
            batalModal.catatan || "Verifikasi Kabid dibatalkan / dikembalikan ke antrean.",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal membatalkan verifikasi");
        setSubmitting(false);
        return;
      }

      toast.success("Verifikasi Kabid berhasil dibatalkan. Berkas dikembalikan ke antrean verifikasi.");
      setBatalModal({ open: false, catatan: "" });
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
      item.kdKohir?.toLowerCase().includes(s)
    );
  });

  return (
    <DashboardShell active="verif3">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold mb-2">
            <Award size={14} /> Tahap 3: Penetapan Akhir & Penerbitan Kohir / SKP
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Menu Verifikasi & Penetapan (Kabid)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Otorisasi Surat Ketetapan Pajak Daerah (SKPD) BPHTB, penerbitan Nomor Kohir, dan pembatalan verifikasi jika diperlukan.
          </p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 w-fit text-xs font-semibold">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === "pending"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock size={14} />
            <span>Menunggu Penetapan</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === "history"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History size={14} />
            <span>Riwayat Penetapan (Bisa Batal Verifikasi)</span>
          </button>
        </div>

        {/* Search & Year Filter */}
        <div className="flex items-center gap-2">
          <YearFilter
            selectedYear={tahun}
            onChange={(y) => {
              setTahun(y);
              setPage(1);
            }}
          />

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Cari No. Berkas, NOP, WP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto min-h-[320px] pb-12">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Berkas & NOP</th>
                <th className="px-4 py-3">Wajib Pajak Baru</th>
                <th className="px-4 py-3">
                  {activeTab === "pending" ? "Verifikator 1 & 2" : "Info Kohir & STS"}
                </th>
                <th className="px-4 py-3 text-right">Ketetapan Pajak</th>
                <th className="px-4 py-3 text-center">Status Bayar</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat antrean berkas...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    {activeTab === "pending"
                      ? "Tidak ada berkas yang menunggu Verifikasi 3 saat ini."
                      : "Belum ada riwayat berkas yang ditetapkan."}
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(filteredData.length / limit) || 1;
                  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.idBerkas} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{item.noBerkas}</p>
                        <p className="text-[11px] font-mono text-red-600">{item.nop}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-900 font-bold">{item.namaWpBaru}</p>
                        <p className="text-[11px] text-slate-500">{item.kelurahanOp}, {item.kecamatanOp}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {activeTab === "pending" ? (
                          <>
                            <p>V1: <span className="text-blue-600 font-semibold">{item.userVerif1 || "-"}</span></p>
                            <p>V2: <span className="text-amber-600 font-semibold">{item.userVerif2 || "-"}</span></p>
                          </>
                        ) : (
                          <>
                            <p className="font-mono text-slate-900 font-semibold">{item.kdKohir || "-"}</p>
                            <p className="text-[11px] font-mono text-slate-500">
                              STS: {item.noSts ? formatNoSts(item.idBerkas, item.tahun, item.noSts) : "-"}
                            </p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-emerald-600 text-sm">
                        {formatRupiah(item.bphtb)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.statusBayar === 1 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle size={12} /> Lunas
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                            <Clock size={12} /> Belum Bayar
                          </span>
                        )}
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
                              className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 text-left"
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

                                {activeTab === "history" && (
                                  <>
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
                                  </>
                                )}
                              </div>

                              {activeTab === "pending" ? (
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      setSelectedBerkas(item);
                                      setActionModal({
                                        open: true,
                                        status: 1,
                                        catatan: "Penetapan SKP & Kohir disetujui secara resmi.",
                                      });
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-purple-700 hover:bg-purple-50 font-semibold transition text-left"
                                  >
                                    <Receipt size={14} className="text-purple-600" />
                                    <span>Terbitkan SKP</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      setSelectedBerkas(item);
                                      setActionModal({
                                        open: true,
                                        status: 2,
                                        catatan: "",
                                      });
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 font-medium transition text-left"
                                  >
                                    <ShieldAlert size={14} className="text-rose-600" />
                                    <span>Tolak Berkas</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="py-1">
                                  {item.statusBayar === 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        setSelectedBerkas(item);
                                        setBatalModal({
                                          open: true,
                                          catatan: "",
                                        });
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 font-bold transition text-left"
                                    >
                                      <RotateCcw size={14} className="text-rose-600" />
                                      <span>Batal Verifikasi</span>
                                    </button>
                                  ) : (
                                    <div className="px-3.5 py-2 text-xs text-slate-400 italic">
                                      Terkunci (Lunas)
                                    </div>
                                  )}
                                </div>
                              )}
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

      {/* Verification Modal (Setujui / Tolak) */}
      {actionModal.open && selectedBerkas && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt size={20} className="text-purple-600" />
              Penetapan SKP - {selectedBerkas.noBerkas}
            </h3>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-2">
              <p className="text-slate-700">Wajib Pajak: <strong className="text-slate-900">{selectedBerkas.namaWpBaru}</strong></p>
              <p className="text-slate-700">NOP: <strong className="text-red-600 font-mono">{selectedBerkas.nop}</strong></p>
              <div className="pt-2 border-t border-purple-200 flex justify-between items-center">
                <span className="text-slate-600">Nilai Ketetapan BPHTB:</span>
                <span className="text-base font-black text-emerald-600">{formatRupiah(selectedBerkas.bphtb)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keputusan Penetapan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionModal({ ...actionModal, status: 1 })}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      actionModal.status === 1
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    Setujui & Terbitkan SKP
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionModal({ ...actionModal, status: 2 })}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      actionModal.status === 2
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    Tolak / Kembalikan
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Penetapan Kabid</label>
                <textarea
                  rows={3}
                  value={actionModal.catatan}
                  onChange={(e) => setActionModal({ ...actionModal, catatan: e.target.value })}
                  placeholder="Catatan resmi otorisasi..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActionModal({ ...actionModal, open: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleVerifSubmit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Konfirmasi Penetapan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Batal Verifikasi Kabid */}
      {batalModal.open && selectedBerkas && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert size={20} className="text-rose-600" />
              Batalkan Verifikasi & SKP Kabid
            </h3>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
              <p className="text-slate-700">No. Berkas: <strong className="text-slate-900">{selectedBerkas.noBerkas}</strong></p>
              <p className="text-slate-700">Wajib Pajak: <strong className="text-slate-900">{selectedBerkas.namaWpBaru}</strong></p>
              <p className="text-slate-700">Nomor Kohir: <strong className="font-mono text-slate-900">{selectedBerkas.kdKohir}</strong></p>
              <p className="text-[11px] text-rose-700 font-medium">
                Peringatan: Berkas akan dikembalikan statusnya ke antrean <strong>Menunggu Verifikasi 3 (Kabid)</strong> dan penetapan SKP sebelumnya akan di-reset.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">
                Alasan / Catatan Pembatalan Verifikasi *
              </label>
              <textarea
                rows={3}
                value={batalModal.catatan}
                onChange={(e) => setBatalModal({ ...batalModal, catatan: e.target.value })}
                placeholder="Misal: Perlu koreksi data NJOP / perhitungan sebelum SKP diterbitkan kembali..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setBatalModal({ ...batalModal, open: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleBatalVerifSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <RotateCcw size={14} />
                {submitting ? "Memproses..." : "Ya, Batalkan Verifikasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

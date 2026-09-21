"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import Pagination from "@/components/Pagination";
import YearFilter from "@/components/YearFilter";
import {
  CreditCard,
  Search,
  CheckCircle,
  Eye,
  Clock,
  Printer,
  ShieldCheck,
  Receipt,
  Building,
  RotateCcw,
  Calendar,
  X,
  AlertTriangle,
  Building2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { formatNoSts } from "@/lib/sspd";

const BANK_OPTIONS = [
  "Bank Sumut",
  "Bank Sumut Syariah",
  "Bank Mandiri",
  "Bank BRI",
  "Bank BNI",
  "Bank BCA",
  "Bank BPD Jateng",
  "Bank BPD Jabar Banten (BJB)",
  "Kasir Loket Bapenda Kab. Tapanuli Selatan",
  "__CUSTOM__",
];

export default function PembayaranBphtbPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const todayStr = new Date().toISOString().split("T")[0];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"belum" | "lunas">("belum");
  const [tahun, setTahun] = useState(currentYearStr);
  const [search, setSearch] = useState("");
  const [selectedBerkas, setSelectedBerkas] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Pay Modal State
  const [payModal, setPayModal] = useState({
    open: false,
    bankSelect: "Bank Sumut",
    customBank: "",
    tglBayar: todayStr,
    noBuktiBayar: "",
    nilaiBayar: 0,
  });

  // Batal Bayar Modal State
  const [batalModal, setBatalModal] = useState<{
    open: boolean;
    berkas: any | null;
    alasan: string;
  }>({
    open: false,
    berkas: null,
    alasan: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [filterTab, tahun, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusBayarParam = filterTab === "lunas" ? "1" : "0";
      const params = new URLSearchParams();
      params.append("statusBayar", statusBayarParam);
      params.append("statusBerkas", filterTab === "lunas" ? "5" : "4");
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
  }, [filterTab, tahun]);

  const handlePaymentSubmit = async () => {
    if (!selectedBerkas) return;

    const finalBank =
      payModal.bankSelect === "__CUSTOM__"
        ? payModal.customBank.trim() || "Bank Persepsi / Mitra Kasir"
        : payModal.bankSelect;

    if (!finalBank) {
      toast.error("Silakan isi atau pilih Bank Persepsi / Kasir Penerima.");
      return;
    }

    if (!payModal.tglBayar) {
      toast.error("Silakan pilih tanggal pembayaran.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${selectedBerkas.idBerkas}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankBayar: finalBank,
          tglBayar: payModal.tglBayar,
          noBuktiBayar: payModal.noBuktiBayar || `TRX-${Date.now().toString().slice(-6)}`,
          nilaiBayar: payModal.nilaiBayar,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal memproses pembayaran");
        setSubmitting(false);
        return;
      }

      toast.success("Pembayaran berhasil dikonfirmasi! Status berkas LUNAS.");
      setPayModal({
        open: false,
        bankSelect: "Bank Sumut",
        customBank: "",
        tglBayar: todayStr,
        noBuktiBayar: "",
        nilaiBayar: 0,
      });
      setSelectedBerkas(null);
      fetchData();
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatalBayarSubmit = async () => {
    if (!batalModal.berkas) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${batalModal.berkas.idBerkas}/batal-bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alasan: batalModal.alasan || "Pembatalan pembayaran oleh kasir/petugas.",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal membatalkan pembayaran");
        setSubmitting(false);
        return;
      }

      toast.success(json.message || "Pembayaran berhasil dibatalkan. Berkas kembali Siap Bayar.");
      setBatalModal({ open: false, berkas: null, alasan: "" });
      fetchData();
    } catch (err) {
      toast.error("Terjadi kesalahan server saat membatalkan pembayaran");
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

  // Client-side search filter
  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase().trim();
    return (
      item.noBerkas?.toLowerCase().includes(s) ||
      item.nop?.toLowerCase().includes(s) ||
      item.namaWpBaru?.toLowerCase().includes(s) ||
      item.namaWp?.toLowerCase().includes(s) ||
      item.nikWpBaru?.toLowerCase().includes(s) ||
      item.kdKohir?.toLowerCase().includes(s) ||
      item.noSts?.toLowerCase().includes(s) ||
      item.noBuktiBayar?.toLowerCase().includes(s) ||
      item.bankBayar?.toLowerCase().includes(s) ||
      item.kecamatanOp?.toLowerCase().includes(s) ||
      item.kelurahanOp?.toLowerCase().includes(s) ||
      item.lokasiOp?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  return (
    <DashboardShell active="pembayaran">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
            <CreditCard size={14} /> Modul Kasir & Pembayaran Bank
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pencatatan Pembayaran & SSPD BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan pelunasan setoran bank / teller kasir dan penerbitan Surat Setoran Pajak Daerah (SSPD) sah.
          </p>
        </div>

        {/* Tab switcher & Year Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <YearFilter
            selectedYear={tahun}
            onChange={(y) => {
              setTahun(y);
              setPage(1);
            }}
          />

          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 text-xs">
            <button
              onClick={() => setFilterTab("belum")}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                filterTab === "belum"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Siap Bayar (Belum Lunas)
            </button>
            <button
              onClick={() => setFilterTab("lunas")}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                filterTab === "lunas"
                  ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sudah Lunas
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Kohir, STS, No. Berkas, NOP, Nama WP, Bukti Bayar..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Ditemukan:{" "}
          <strong className="text-slate-900">{filteredData.length}</strong> transaksi{" "}
          {filterTab === "lunas" ? "Lunas" : "Siap Bayar"}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Kohir & STS</th>
                <th className="px-4 py-3">Wajib Pajak Baru</th>
                <th className="px-4 py-3">NOP & Lokasi</th>
                <th className="px-4 py-3 text-right">Tagihan BPHTB</th>
                <th className="px-4 py-3 text-center">Status & Info Bayar</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat data pembayaran BPHTB...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    {search
                      ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian."
                      : "Tidak ada transaksi dalam kategori ini."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.idBerkas} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 font-mono">
                        {item.kdKohir || "-"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        STS: {item.noSts || "-"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.noBerkas}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-900 font-bold">{item.namaWpBaru}</p>
                      <p className="text-[11px] text-slate-500">
                        NIK: {item.nikWpBaru || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-red-600 font-semibold">{item.nop}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.kelurahanOp ? `${item.kelurahanOp}, ` : ""}
                        {item.kecamatanOp}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                      {formatRupiah(item.bphtb)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.statusBayar === 1 ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle size={12} /> LUNAS
                          </span>
                          {item.bankBayar && (
                            <span className="text-[10px] text-slate-500 max-w-[140px] truncate" title={item.bankBayar}>
                              {item.bankBayar}
                            </span>
                          )}
                          {item.tglBayar && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.tglBayar).toLocaleDateString("id-ID")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Clock size={12} /> Menunggu Bayar
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
                                <span>Lihat Detail Berkas</span>
                              </Link>

                              {item.statusBayar === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setSelectedBerkas(item);
                                    setPayModal({
                                      open: true,
                                      bankSelect: "Bank Sumut",
                                      customBank: "",
                                      tglBayar: todayStr,
                                      noBuktiBayar: `TRX-${Date.now().toString().slice(-6)}`,
                                      nilaiBayar: Number(item.bphtb || 0),
                                    });
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 font-semibold transition text-left"
                                >
                                  <CreditCard size={14} className="text-emerald-600" />
                                  <span>Input Bayar</span>
                                </button>
                              ) : (
                                <>
                                  <Link
                                    href={`/bphtb/berkas/${item.idBerkas}/cetak`}
                                    target="_blank"
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 font-semibold transition"
                                  >
                                    <Printer size={14} className="text-emerald-600" />
                                    <span>Cetak SSPD BPHTB</span>
                                  </Link>
                                  <Link
                                    href={`/bphtb/berkas/${item.idBerkas}/cetak-skp`}
                                    target="_blank"
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-cyan-700 hover:bg-cyan-50 font-semibold transition"
                                  >
                                    <Printer size={14} className="text-cyan-600" />
                                    <span>Cetak SKPD</span>
                                  </Link>
                                </>
                              )}
                            </div>

                            {item.statusBayar === 1 && (
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setBatalModal({
                                      open: true,
                                      berkas: item,
                                      alasan: "",
                                    });
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 font-semibold transition text-left"
                                >
                                  <RotateCcw size={14} className="text-rose-600" />
                                  <span>Batalkan Pembayaran</span>
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredData.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Input Bayar */}
      {payModal.open && selectedBerkas && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-600" />
                Pencatatan Setoran Kas / Bank BPHTB
              </h3>
              <button
                type="button"
                onClick={() => setPayModal({ ...payModal, open: false })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info Berkas Ringkas */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Kohir:</span>
                <strong className="text-cyan-700 font-mono font-bold">
                  {selectedBerkas.kdKohir || "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. STS:</span>
                <strong className="text-slate-800 font-mono">
                  {selectedBerkas.noSts || "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wajib Pajak:</span>
                <strong className="text-slate-900">{selectedBerkas.namaWpBaru}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NOP:</span>
                <span className="font-mono text-red-600 font-semibold">
                  {selectedBerkas.nop}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Total Tagihan BPHTB:</span>
                <span className="text-base font-black text-emerald-600">
                  {formatRupiah(selectedBerkas.bphtb)}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              {/* Tanggal Bayar Custom */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-600" />
                  Tanggal Pembayaran (Custom) *
                </label>
                <input
                  type="date"
                  value={payModal.tglBayar}
                  onChange={(e) => setPayModal({ ...payModal, tglBayar: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Dapat disesuaikan dengan tanggal validasi bukti cetak/slip setoran bank.
                </p>
              </div>

              {/* Bank Persepsi / Kasir Penerima Custom */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 size={14} className="text-emerald-600" />
                  Bank Persepsi / Kasir Penerima *
                </label>
                <select
                  value={payModal.bankSelect}
                  onChange={(e) =>
                    setPayModal({
                      ...payModal,
                      bankSelect: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Bank Sumut">Bank Sumut</option>
                  <option value="Bank Sumut Syariah">Bank Sumut Syariah</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank BRI">Bank BRI</option>
                  <option value="Bank BNI">Bank BNI</option>
                  <option value="Bank BCA">Bank BCA</option>
                  <option value="Bank BPD Jateng">Bank BPD Jateng</option>
                  <option value="Bank BPD Jabar Banten (BJB)">Bank BJB</option>
                  <option value="Kasir Loket Bapenda Kab. Tapanuli Selatan">
                    Kasir Loket Bapenda Kab. Tapanuli Selatan
                  </option>
                  <option value="__CUSTOM__">
                    -- Lainnya / Input Nama Bank / Kasir Custom --
                  </option>
                </select>

                {payModal.bankSelect === "__CUSTOM__" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={payModal.customBank}
                      onChange={(e) =>
                        setPayModal({ ...payModal, customBank: e.target.value })
                      }
                      placeholder="Ketik nama Bank / Kasir penerima secara manual..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Nomor Bukti Setor */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Bukti Transaksi Bank / Kasir *
                </label>
                <input
                  type="text"
                  value={payModal.noBuktiBayar}
                  onChange={(e) => setPayModal({ ...payModal, noBuktiBayar: e.target.value })}
                  placeholder="Contoh: BPD-TRX-2026-991 atau 09182312"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Nominal Setoran */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Setoran (Rp) *
                </label>
                <input
                  type="number"
                  value={payModal.nilaiBayar}
                  onChange={(e) =>
                    setPayModal({
                      ...payModal,
                      nilaiBayar: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPayModal({ ...payModal, open: false })}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handlePaymentSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
              >
                <CreditCard size={14} />
                {submitting ? "Memproses..." : "Validasi & Simpan Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pembatalan Pembayaran (Batal Bayar) */}
      {batalModal.open && batalModal.berkas && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Batalkan Pembayaran BPHTB
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pembatalan pelunasan transaksi dan reset bukti SSPD
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">No. Kohir:</span>
                <strong className="font-mono text-slate-900">
                  {batalModal.berkas.kdKohir || "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">No. STS:</span>
                <strong className="font-mono text-slate-900">
                  {batalModal.berkas.noSts || "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Wajib Pajak:</span>
                <strong className="text-slate-900">{batalModal.berkas.namaWpBaru}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Bank / Kasir:</span>
                <span className="text-slate-800 font-medium">
                  {batalModal.berkas.bankBayar || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">No. Bukti Bayar:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {batalModal.berkas.noBuktiBayar || "-"}
                </span>
              </div>
              <div className="pt-2 border-t border-rose-200 flex justify-between items-center">
                <span className="text-slate-700 font-semibold">Nominal Terbayar:</span>
                <span className="text-sm font-black text-rose-700">
                  {formatRupiah(batalModal.berkas.nilaiSudahDibayar || batalModal.berkas.bphtb)}
                </span>
              </div>
            </div>

            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 leading-relaxed">
              <strong>Perhatian:</strong> Berkas ini akan dikembalikan ke status{" "}
              <strong>Siap Bayar (Belum Lunas)</strong>. Nomor bukti setor dan tanggal bayar akan dihapus dari sistem.
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">
                Alasan / Catatan Pembatalan Pembayaran
              </label>
              <textarea
                rows={3}
                value={batalModal.alasan}
                onChange={(e) => setBatalModal({ ...batalModal, alasan: e.target.value })}
                placeholder="Contoh: Salah input nomor transaksi bank / setoran dibatalkan oleh bank..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setBatalModal({ open: false, berkas: null, alasan: "" })}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleBatalBayarSubmit}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition"
              >
                <RotateCcw size={14} />
                {submitting ? "Memproses..." : "Ya, Batalkan Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

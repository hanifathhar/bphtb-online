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
} from "lucide-react";
import { toast } from "sonner";
import { formatNoSts } from "@/lib/sspd";

export default function PembayaranBphtbPage() {
  const currentYearStr = new Date().getFullYear().toString();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"belum" | "lunas">("belum");
  const [tahun, setTahun] = useState(currentYearStr);
  const [selectedBerkas, setSelectedBerkas] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [filterTab, tahun]);
  const [payModal, setPayModal] = useState({
    open: false,
    bankBayar: "Bank BPD Jateng",
    noBuktiBayar: "",
    nilaiBayar: 0,
  });
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${selectedBerkas.idBerkas}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payModal),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal memproses pembayaran");
        setSubmitting(false);
        return;
      }

      toast.success("Pembayaran berhasil dikonfirmasi! Status berkas LUNAS.");
      setPayModal({ open: false, bankBayar: "Bank BPD Jateng", noBuktiBayar: "", nilaiBayar: 0 });
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

  return (
    <DashboardShell active="pembayaran">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-emerald-600 text-xs font-semibold mb-2">
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
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Memuat data pembayaran BPHTB...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Tidak ada transaksi dalam kategori ini.
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(data.length / limit) || 1;
                  const paginatedData = data.slice((page - 1) * limit, page * limit);
                  return paginatedData.map((item) => (
                    <tr key={item.idBerkas} className="hover:bg-slate-100 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 font-mono">{item.kdKohir || "-"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          STS: {item.noSts || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-900 font-bold">{item.namaWpBaru}</p>
                        <p className="text-[11px] text-slate-500">NIK: {item.nikWpBaru || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-red-600 font-semibold">{item.nop}</p>
                        <p className="text-[11px] text-slate-500">{item.kecamatanOp}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                        {formatRupiah(item.bphtb)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.statusBayar === 1 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 text-emerald-600 border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle size={12} /> LUNAS
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 text-amber-600 border border-amber-500/30 inline-flex items-center gap-1">
                            <Clock size={12} /> Menunggu Bayar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/bphtb/berkas/${item.idBerkas}`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                            title="Lihat Detail Berkas"
                          >
                            <Eye size={13} />
                          </Link>
                          {item.statusBayar === 0 ? (
                            <button
                              onClick={() => {
                                setSelectedBerkas(item);
                                setPayModal({
                                  open: true,
                                  bankBayar: "Bank BPD Jateng",
                                  noBuktiBayar: `TRX-${Date.now().toString().slice(-6)}`,
                                  nilaiBayar: Number(item.bphtb || 0),
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-500/20"
                            >
                              <CreditCard size={13} />
                              Input Bayar
                            </button>
                          ) : (
                            <Link
                              href={`/bphtb/berkas/${item.idBerkas}/cetak`}
                              target="_blank"
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1"
                              title="Cetak SSPD BPHTB"
                            >
                              <Printer size={13} />
                              Cetak SSPD
                            </Link>
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
          totalPages={Math.ceil(data.length / limit) || 1}
          totalItems={data.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Input Bayar */}
      {payModal.open && selectedBerkas && (
        <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-600" />
              Pencatatan Setoran Kas / Bank BPHTB
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="text-slate-500">Kohir: <strong className="text-cyan-700 font-mono">{selectedBerkas.kdKohir}</strong></p>
              <p className="text-slate-500">Wajib Pajak: <strong className="text-slate-900">{selectedBerkas.namaWpBaru}</strong></p>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Total Tagihan BPHTB:</span>
                <span className="text-base font-black text-emerald-600">{formatRupiah(selectedBerkas.bphtb)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Persepsi / Kasir Penerima *</label>
                <select
                  value={payModal.bankBayar}
                  onChange={(e) => setPayModal({ ...payModal, bankBayar: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Bank BPD Jateng">Bank BPD Jateng</option>
                  <option value="Bank BPD Jabar Banten (BJB)">Bank BJB</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank BRI">Bank BRI</option>
                  <option value="Bank BCA">Bank BCA</option>
                  <option value="Kasir Loket Bapenda">Kasir Loket Bapenda</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Bukti Transaksi Bank *</label>
                <input
                  type="text"
                  value={payModal.noBuktiBayar}
                  onChange={(e) => setPayModal({ ...payModal, noBuktiBayar: e.target.value })}
                  placeholder="Contoh: BPD-TRX-2026-991"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Setoran (Rp) *</label>
                <input
                  type="number"
                  value={payModal.nilaiBayar}
                  onChange={(e) => setPayModal({ ...payModal, nilaiBayar: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPayModal({ ...payModal, open: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handlePaymentSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Validasi & Cetak Bukti Setor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

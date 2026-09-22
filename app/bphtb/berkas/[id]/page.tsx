"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  FileText,
  User,
  UserCheck,
  Building,
  Calculator,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  CreditCard,
  Printer,
  ShieldCheck,
  ArrowLeft,
  CheckSquare,
  XCircle,
  FileCheck,
  Calendar,
  Building2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Edit,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatNoSts } from "@/lib/sspd";

export default function DetailBerkasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const todayStr = new Date().toISOString().split("T")[0];

  const [berkas, setBerkas] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal Verifikasi / Bayar
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    tahap: number;
    action: "setuju" | "tolak";
    catatan: string;
  }>({
    open: false,
    tahap: 1,
    action: "setuju",
    catatan: "",
  });

  const [payModal, setPayModal] = useState({
    open: false,
    bankSelect: "Bank Sumut",
    customBank: "",
    tglBayar: todayStr,
    noBuktiBayar: `TRX-${Date.now().toString().slice(-6)}`,
    nilaiBayar: 0,
  });

  const [batalPayModal, setBatalPayModal] = useState({
    open: false,
    alasan: "",
  });

  const [batalModal, setBatalModal] = useState({
    open: false,
    catatan: "",
  });

  const [rollbackModal, setRollbackModal] = useState({
    open: false,
    catatan: "",
  });

  const [deleteModal, setDeleteModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      const [res, meRes] = await Promise.all([
        fetch(`/api/bphtb/${id}`),
        fetch("/api/me"),
      ]);

      if (res.ok) {
        const json = await res.json();
        setBerkas(json.data);
        setPayModal((prev) => ({
          ...prev,
          nilaiBayar: Number(json.data?.bphtb || 0),
        }));
      }

      if (meRes.ok) {
        const meJson = await meRes.json();
        setCurrentUser(meJson.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const handleVerifikasiSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${id}/verifikasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tahap: actionModal.tahap,
          status: actionModal.action === "setuju" ? 1 : 2,
          catatan: actionModal.catatan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memproses verifikasi");
        setSubmitting(false);
        return;
      }

      toast.success(data.message || "Verifikasi berhasil disimpan");
      setActionModal({ open: false, tahap: 1, action: "setuju", catatan: "" });
      fetchDetail();
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
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
      const res = await fetch(`/api/bphtb/${id}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankBayar: finalBank,
          tglBayar: payModal.tglBayar,
          noBuktiBayar: payModal.noBuktiBayar || `TRX-${Date.now().toString().slice(-6)}`,
          nilaiBayar: payModal.nilaiBayar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memproses pembayaran");
        setSubmitting(false);
        return;
      }

      toast.success("Pembayaran berhasil dikonfirmasi! Berkas kini berstatus Lunas.");
      setPayModal((prev) => ({ ...prev, open: false }));
      fetchDetail();
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatalPaySubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${id}/batal-bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alasan: batalPayModal.alasan || "Pembatalan pembayaran dari detail berkas.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membatalkan pembayaran");
        setSubmitting(false);
        return;
      }

      toast.success(data.message || "Pembayaran berhasil dibatalkan. Berkas kembali Siap Bayar.");
      setBatalPayModal({ open: false, alasan: "" });
      fetchDetail();
    } catch (err) {
      toast.error("Terjadi kesalahan server saat membatalkan pembayaran");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatalVerifSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${id}/verifikasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tahap: 3,
          status: 0, // 0 = Batal Verifikasi
          catatan:
            batalModal.catatan || "Verifikasi Kabid dibatalkan / dikembalikan ke tahap 3.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membatalkan verifikasi");
        setSubmitting(false);
        return;
      }

      toast.success("Verifikasi Kabid berhasil dibatalkan. Berkas dikembalikan ke antrean.");
      setBatalModal({ open: false, catatan: "" });
      fetchDetail();
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRollbackBerkas = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${id}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: 1, // Rollback ke antrean Verifikasi 1
          catatan: rollbackModal.catatan || "Berkas dikembalikan ke antrean verifikasi untuk diproses ulang.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal melakukan rollback berkas");
        setSubmitting(false);
        return;
      }

      toast.success("Berkas berhasil di-rollback dan dimasukkan kembali ke antrean Verifikasi 1!");
      setRollbackModal({ open: false, catatan: "" });
      fetchDetail();
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBerkas = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bphtb/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus berkas");
        setSubmitting(false);
        return;
      }

      toast.success("Berkas berhasil dihapus secara permanen.");
      router.push("/bphtb/berkas");
    } catch (err) {
      toast.error("Terjadi kesalahan server");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell active="berkas">
        <div className="py-20 text-center text-slate-500">
          Memuat detail berkas BPHTB...
        </div>
      </DashboardShell>
    );
  }

  if (!berkas) {
    return (
      <DashboardShell active="berkas">
        <div className="py-20 text-center text-slate-500">
          Berkas tidak ditemukan.
        </div>
      </DashboardShell>
    );
  }

  // Workflow steps status evaluation
  const isVerif1Done = berkas.verif1 === 1;
  const isVerif2Done = berkas.verif2 === 1;
  const isVerif3Done = berkas.verif3 === 1;
  const isSkpReady = berkas.statusBerkas >= 4;
  const isLunas = berkas.statusBayar === 1;

  const userLevel = currentUser?.level || 1;
  const canVerif1 = (userLevel === 1 || userLevel === 3) && berkas.statusBerkas === 1;
  const canVerif2 = (userLevel === 1 || userLevel === 4) && berkas.statusBerkas === 2;
  const canVerif3 = (userLevel === 1 || userLevel === 5) && berkas.statusBerkas === 3;
  const canBatalVerif3 = (userLevel === 1 || userLevel === 5) && berkas.statusBerkas === 4 && berkas.statusBayar === 0;
  const canPay = (userLevel === 1 || userLevel === 6) && berkas.statusBerkas === 4 && berkas.statusBayar === 0;
  const canBatalPay = (userLevel === 1 || userLevel === 6) && isLunas;

  return (
    <DashboardShell active="berkas">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/bphtb/berkas"
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {berkas.noBerkas || "DRAFT"}
              </h1>
              {isLunas ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 text-emerald-600 border border-emerald-500/30">
                  LUNAS
                </span>
              ) : berkas.statusBerkas === 9 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 text-rose-600 border border-rose-500/30">
                  DITOLAK / REVISI
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 text-cyan-700 border border-cyan-500/30">
                  PROSES TAHAP {berkas.statusBerkas}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              NOP: <span className="text-red-600 font-mono">{berkas.nop}</span> • Terdaftar tanggal {berkas.tglBerkas ? new Date(berkas.tglBerkas).toLocaleDateString("id-ID") : "-"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canVerif1 && (
            <button
              onClick={() => setActionModal({ open: true, tahap: 1, action: "setuju", catatan: "" })}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
            >
              <CheckSquare size={16} /> Verifikasi 1 (Staf)
            </button>
          )}

          {canVerif2 && (
            <button
              onClick={() => setActionModal({ open: true, tahap: 2, action: "setuju", catatan: "" })}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <CheckSquare size={16} /> Verifikasi 2 (Kasi)
            </button>
          )}

          {canVerif3 && (
            <button
              onClick={() => setActionModal({ open: true, tahap: 3, action: "setuju", catatan: "" })}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
            >
              <Receipt size={16} /> Verifikasi 3 & Terbitkan SKP
            </button>
          )}

          {canBatalVerif3 && (
            <button
              onClick={() => setBatalModal({ open: true, catatan: "" })}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Batalkan Verifikasi & SKP Kabid"
            >
              <RotateCcw size={15} /> Batal Verifikasi Kabid
            </button>
          )}

          {canBatalPay && (
            <button
              onClick={() => setBatalPayModal({ open: true, alasan: "" })}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Batalkan Pembayaran BPHTB"
            >
              <RotateCcw size={15} /> Batal Bayar
            </button>
          )}

          {berkas.statusBerkas === 9 && (
            <>
              <Link
                href={`/bphtb/berkas/${id}/edit`}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition"
              >
                <Edit size={15} /> Perbaiki Data
              </Link>
              <button
                onClick={() => setRollbackModal({ open: true, catatan: "" })}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition"
              >
                <Undo2 size={15} /> Rollback Status
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition"
              >
                <Trash2 size={15} /> Hapus Berkas
              </button>
            </>
          )}

          {canPay && (
            <button
              onClick={() => setPayModal((p) => ({ ...p, open: true }))}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <CreditCard size={16} /> Bayar / Pelunasan
            </button>
          )}

          {isSkpReady && (
            <Link
              href={`/bphtb/berkas/${id}/cetak-skp`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95 transition"
            >
              <Printer size={15} /> Cetak SKPD
            </Link>
          )}

          <Link
            href={`/bphtb/berkas/${id}/cetak`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition"
          >
            <Printer size={15} /> Cetak SSPD BPHTB
          </Link>
        </div>
      </div>

      {/* Rejection Alert Banner */}
      {berkas.statusBerkas === 9 && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 text-rose-700">
              <AlertCircle size={22} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-900">Berkas Ditolak / Perlu Perbaikan</p>
                <p className="text-xs text-slate-700 mt-0.5">
                  Catatan: {berkas.ketVerif3 || berkas.ketVerif2 || berkas.ketVerif1 || "Terdapat catatan perbaikan dari petugas verifikator."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/bphtb/berkas/${id}/edit`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Edit size={14} /> Perbaiki Data
              </Link>
              <button
                onClick={() => setRollbackModal({ open: true, catatan: "" })}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Undo2 size={14} /> Rollback Status
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Trash2 size={14} /> Hapus Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Workflow Stepper Tracker */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-red-600" />
          Progres Alur Layanan BPHTB
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {[
            { label: "1. Pendaftaran", done: true, sub: berkas.entry || "User" },
            { label: "2. Verifikasi 1", done: isVerif1Done, sub: berkas.userVerif1 || "Staf" },
            { label: "3. Verifikasi 2", done: isVerif2Done, sub: berkas.userVerif2 || "Kasie" },
            { label: "4. Verifikasi 3", done: isVerif3Done, sub: berkas.userVerif3 || "Kabid" },
            { label: "5. SKP / Kohir", done: isSkpReady, sub: berkas.kdKohir || "Menunggu" },
            { label: "6. Pelunasan", done: isLunas, sub: isLunas ? berkas.bankBayar : "Belum Bayar" },
          ].map((st, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border text-center transition ${
                st.done
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 border-emerald-500/30 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {st.done ? (
                  <CheckCircle size={18} className="text-emerald-600" />
                ) : (
                  <Clock size={18} className="text-slate-600" />
                )}
              </div>
              <p className="font-bold text-xs text-slate-900">{st.label}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{st.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Column Dossier Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Wajib Pajak & Objek Pajak */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Data WP Lama & Baru */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <User size={18} className="text-red-600" />
              Pihak Terkait (Peralihan Hak)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* WP Lama */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">
                  Wajib Pajak Lama (Penjual)
                </span>
                <p className="font-bold text-slate-900 text-sm">{berkas.namaWp || "-"}</p>
                <p className="text-slate-500">NIK: <span className="text-slate-800">{berkas.nikWp || "-"}</span></p>
                <p className="text-slate-500">NPWP: <span className="text-slate-800">{berkas.npwpWp || "-"}</span></p>
                <p className="text-slate-500">Alamat: <span className="text-slate-800">{berkas.alamatWp || "-"} RT {berkas.rtWp || "00"}/RW {berkas.rwWp || "00"}</span></p>
                <p className="text-slate-500">{berkas.kelurahanWp}, {berkas.kecamatanWp}</p>
              </div>

              {/* WP Baru */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 border border-emerald-500/20 space-y-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 text-emerald-700 font-bold uppercase">
                  Wajib Pajak Baru (Pembeli)
                </span>
                <p className="font-bold text-emerald-700 text-sm">{berkas.namaWpBaru || "-"}</p>
                <p className="text-slate-500">NIK: <span className="text-slate-800">{berkas.nikWpBaru || "-"}</span></p>
                <p className="text-slate-500">NPWP: <span className="text-slate-800">{berkas.npwpWpBaru || "-"}</span></p>
                <p className="text-slate-500">Alamat: <span className="text-slate-800">{berkas.alamatWpBaru || "-"} RT {berkas.rtWpBaru || "00"}/RW {berkas.rwWpBaru || "00"}</span></p>
                <p className="text-slate-500">{berkas.kelurahanWpBaru}, {berkas.kecamatanWpBaru}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Objek Pajak & NJOP */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Building size={18} className="text-cyan-700" />
              Spesifikasi Objek Pajak & Nilai PBB
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Nomor Objek Pajak (NOP):</p>
                <p className="font-bold font-mono text-cyan-700 text-sm">{berkas.nop || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">Lokasi Objek Pajak:</p>
                <p className="font-semibold text-slate-900">{berkas.lokasiOp || "-"}</p>
                <p className="text-slate-500">{berkas.kelurahanOp}, {berkas.kecamatanOp}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-slate-500">Luas Bumi / Tanah:</p>
                  <p className="font-bold text-slate-900">{Number(berkas.luasBumi || 0)} m²</p>
                  <p className="text-[11px] text-slate-500">@{formatRupiah(berkas.njopBumi)}/m²</p>
                </div>
                <div>
                  <p className="text-slate-500">Total NJOP Bumi:</p>
                  <p className="font-bold text-slate-800">{formatRupiah(berkas.totalNjopBumi)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Luas Bangunan:</p>
                  <p className="font-bold text-slate-900">{Number(berkas.luasBangunan || 0)} m²</p>
                  <p className="text-[11px] text-slate-500">@{formatRupiah(berkas.njopBangunan)}/m²</p>
                </div>
                <div>
                  <p className="text-slate-500">Total NJOP Bangunan:</p>
                  <p className="font-bold text-slate-800">{formatRupiah(berkas.totalNjopBangunan)}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Nilai Jual Objek Pajak PBB (Total):</span>
                <span className="text-cyan-300 font-bold">{formatRupiah(berkas.nilaiPbb)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Riwayat Catatan Verifikasi */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <FileCheck size={18} className="text-purple-700" />
              Catatan Hasil Verifikasi Berjenjang
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span className="font-bold text-blue-400">Verifikasi 1 (Staf Lapangan)</span>
                  <span>{berkas.tglVerif1 ? new Date(berkas.tglVerif1).toLocaleString("id-ID") : "Belum Diverifikasi"}</span>
                </div>
                <p className="text-slate-700 mt-1">{berkas.ketVerif1 || "Tidak ada catatan."}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Petugas: {berkas.userVerif1 || "-"}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span className="font-bold text-amber-600">Verifikasi 2 (Kasie Teknis)</span>
                  <span>{berkas.tglVerif2 ? new Date(berkas.tglVerif2).toLocaleString("id-ID") : "Belum Diverifikasi"}</span>
                </div>
                <p className="text-slate-700 mt-1">{berkas.ketVerif2 || "Tidak ada catatan."}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Petugas: {berkas.userVerif2 || "-"}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span className="font-bold text-purple-700">Verifikasi 3 (Kabid Penetapan)</span>
                  <span>{berkas.tglVerif3 ? new Date(berkas.tglVerif3).toLocaleString("id-ID") : "Belum Diverifikasi"}</span>
                </div>
                <p className="text-slate-700 mt-1">{berkas.ketVerif3 || "Tidak ada catatan."}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Petugas: {berkas.userVerif3 || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Perhitungan & SKP / Bukti Bayar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Rincian Perhitungan Pajak */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Calculator size={18} className="text-amber-600" />
              Perhitungan BPHTB
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Nilai Transaksi Pasar:</span>
                <span className="text-slate-800">{formatRupiah(berkas.nilaiTransaksi)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total NJOP PBB:</span>
                <span className="text-slate-800">{formatRupiah(berkas.nilaiPbb)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 font-bold text-red-700 border border-slate-200">
                <span>NPOP (Dasar Pajak):</span>
                <span>{formatRupiah(berkas.npop)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>NPOPTKP:</span>
                <span className="text-rose-700">- {formatRupiah(berkas.npoptkp)}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-semibold pt-1 border-t border-slate-200">
                <span>NPOPKP:</span>
                <span className={berkas.kepentingan === 1 ? "text-emerald-700 font-extrabold" : ""}>
                  {formatRupiah(berkas.npopkp)} {berkas.kepentingan === 1 ? "(Nihil)" : ""}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tarif:</span>
                <span className="text-slate-800">{Number(berkas.tarif || 5)}%</span>
              </div>

              {berkas.kepentingan === 1 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 mt-2">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <span>Objek Kepentingan Umum (Bebas BPHTB)</span>
                </div>
              )}

              <div className={`p-4 rounded-2xl border mt-3 ${
                berkas.kepentingan === 1 
                  ? "bg-emerald-50 border-emerald-300" 
                  : "bg-gradient-to-r from-teal-500/20 to-emerald-500/10 border-red-200"
              }`}>
                <p className="text-[10px] font-bold text-red-600 uppercase">Ketetapan BPHTB Terutang</p>
                <p className="text-2xl font-black text-slate-900">
                  {formatRupiah(berkas.bphtb)} {berkas.kepentingan === 1 ? "(Nihil)" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Surat Ketetapan Pajak (SKP) & Kohir */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Receipt size={18} className="text-cyan-700" />
              Informasi SKP & STS
            </h3>

            <div className="space-y-2">
              <div>
                <p className="text-slate-500">Kode Kohir / SKP:</p>
                <p className="font-bold text-slate-900 font-mono text-sm">{berkas.kdKohir || "Belum Ditetapkan"}</p>
              </div>
              <div>
                <p className="text-slate-500">Nomor STS (Surat Tanda Setor):</p>
                <p className="font-bold text-slate-800 font-mono">
                  {berkas.noSts || "Menunggu Verifikasi Kabid"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Tanggal Penetapan SKP:</p>
                <p className="text-slate-700">{berkas.tglSkp ? new Date(berkas.tglSkp).toLocaleDateString("id-ID") : "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">Tanggal Jatuh Tempo:</p>
                <p className="text-amber-700 font-semibold">{berkas.tglTempo ? new Date(berkas.tglTempo).toLocaleDateString("id-ID") : "-"}</p>
              </div>
            </div>
          </div>

          {/* Card: Status Pembayaran */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <CreditCard size={18} className="text-emerald-600" />
              Status Pembayaran & SSPD
            </h3>

            {isLunas ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                  <CheckCircle size={16} /> LUNAS
                </div>
                <p className="text-slate-700">Bank / Kasir: <span className="font-semibold text-slate-900">{berkas.bankBayar || "Bank Persepsi"}</span></p>
                <p className="text-slate-700">No. Bukti: <span className="font-mono text-red-700">{berkas.noBuktiBayar || "-"}</span></p>
                <p className="text-slate-700">Tgl Bayar: {berkas.tglBayar ? new Date(berkas.tglBayar).toLocaleDateString("id-ID") : "-"}</p>
                <div className="pt-2 border-t border-emerald-200 flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Nilai Sudah Dibayar:</span>
                  <span className="font-bold text-emerald-700">{formatRupiah(berkas.nilaiSudahDibayar || berkas.bphtb)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Nilai Belum Dibayar:</span>
                  <span>{formatRupiah(berkas.nilaiBelumDibayar || 0)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 border-amber-500/30 text-amber-700 space-y-2">
                <p className="font-bold text-xs flex items-center gap-1">
                  <Clock size={14} /> Belum Dibayar
                </p>
                <p className="text-[11px] text-slate-500">
                  Ketetapan pajak siap disetorkan ke kasir atau Bank persepsi.
                </p>
                <div className="pt-2 border-t border-amber-200 flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Nilai Belum Dibayar:</span>
                  <span className="font-bold text-amber-800">{formatRupiah(berkas.nilaiBelumDibayar ?? berkas.bphtb)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Nilai Sudah Dibayar:</span>
                  <span>{formatRupiah(berkas.nilaiSudahDibayar || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Verifikasi 1, 2, 3 */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-red-600" />
              Proses Verifikasi Tahap {actionModal.tahap}
            </h3>
            <p className="text-xs text-slate-500">
              No. Berkas: <strong className="text-slate-900">{berkas.noBerkas}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keputusan Verifikasi *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionModal({ ...actionModal, action: "setuju" })}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      actionModal.action === "setuju"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200 text-emerald-700 border-emerald-500/50"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    Disetujui
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionModal({ ...actionModal, action: "tolak" })}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      actionModal.action === "tolak"
                        ? "bg-rose-50 text-rose-700 border border-rose-200 text-rose-700 border-rose-500/50"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    Tolak / Revisi
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Verifikator
                </label>
                <textarea
                  rows={3}
                  value={actionModal.catatan}
                  onChange={(e) => setActionModal({ ...actionModal, catatan: e.target.value })}
                  placeholder="Keterangan atau alasan persetujuan/penolakan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                onClick={handleVerifikasiSubmit}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Simpan Keputusan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pembayaran */}
      {payModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-600" />
                Pencatatan Pembayaran BPHTB
              </h3>
              <button
                type="button"
                onClick={() => setPayModal({ ...payModal, open: false })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="text-slate-500">
                No. Kohir: <strong className="text-cyan-700 font-mono font-bold">{berkas.kdKohir}</strong>
              </p>
              <p className="text-slate-500">
                Wajib Pajak: <strong className="text-slate-900">{berkas.namaWpBaru}</strong>
              </p>
              <p className="text-slate-500">
                Tagihan: <strong className="text-emerald-600 font-bold">{formatRupiah(berkas.bphtb)}</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Tanggal Bayar Custom */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar size={13} className="text-emerald-600" />
                  Tanggal Pembayaran (Custom) *
                </label>
                <input
                  type="date"
                  value={payModal.tglBayar}
                  onChange={(e) => setPayModal({ ...payModal, tglBayar: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Bank Persepsi / Kasir Penerima Custom */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 size={13} className="text-emerald-600" />
                  Bank / Kasir Penerima *
                </label>
                <select
                  value={payModal.bankSelect}
                  onChange={(e) => setPayModal({ ...payModal, bankSelect: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      onChange={(e) => setPayModal({ ...payModal, customBank: e.target.value })}
                      placeholder="Ketik nama Bank / Kasir penerima..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Bukti Setor / Transaksi *
                </label>
                <input
                  type="text"
                  value={payModal.noBuktiBayar}
                  onChange={(e) => setPayModal({ ...payModal, noBuktiBayar: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp) *
                </label>
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
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Konfirmasi Lunas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Batal Pembayaran */}
      {batalPayModal.open && (
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
                  Reset pelunasan dan kembalikan ke status Siap Bayar
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">No. Kohir:</span>
                <strong className="font-mono text-slate-900">{berkas.kdKohir || "-"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Wajib Pajak:</span>
                <strong className="text-slate-900">{berkas.namaWpBaru}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Bank / Kasir:</span>
                <span className="text-slate-800 font-medium">{berkas.bankBayar || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">No. Bukti:</span>
                <span className="font-mono text-slate-800 font-semibold">{berkas.noBuktiBayar || "-"}</span>
              </div>
              <div className="pt-2 border-t border-rose-200 flex justify-between items-center">
                <span className="text-slate-700 font-semibold">Nominal:</span>
                <span className="text-sm font-black text-rose-700">{formatRupiah(berkas.nilaiSudahDibayar || berkas.bphtb)}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">
                Alasan / Catatan Pembatalan Pembayaran
              </label>
              <textarea
                rows={3}
                value={batalPayModal.alasan}
                onChange={(e) => setBatalPayModal({ ...batalPayModal, alasan: e.target.value })}
                placeholder="Misal: Salah input nomor transaksi bank atau setoran dibatalkan..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setBatalPayModal({ open: false, alasan: "" })}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleBatalPaySubmit}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition"
              >
                <RotateCcw size={14} />
                {submitting ? "Memproses..." : "Ya, Batalkan Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Batal Verifikasi Kabid */}
      {batalModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert size={20} className="text-rose-600" />
              Batalkan Verifikasi & SKP Kabid
            </h3>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
              <p className="text-slate-700">No. Berkas: <strong className="text-slate-900">{berkas.noBerkas}</strong></p>
              <p className="text-slate-700">Wajib Pajak: <strong className="text-slate-900">{berkas.namaWpBaru}</strong></p>
              <p className="text-slate-700">Nomor Kohir: <strong className="font-mono text-slate-900">{berkas.kdKohir}</strong></p>
              <p className="text-[11px] text-rose-700 font-medium">
                Peringatan: Berkas akan dikembalikan statusnya ke antrean <strong>Menunggu Verifikasi 3 (Kabid)</strong> dan penerbitan SKP akan di-reset.
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
                placeholder="Misal: Perlu perbaikan data perhitungan sebelum SKP diterbitkan kembali..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setBatalModal({ ...batalModal, open: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Tutup
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

      {/* Modal Rollback / Ajukan Kembali */}
      {rollbackModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Undo2 size={20} className="text-blue-600" />
              Rollback & Ajukan Ulang Berkas
            </h3>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-2">
              <p className="text-slate-700">No. Berkas: <strong className="text-slate-900">{berkas.noBerkas}</strong></p>
              <p className="text-slate-700">Wajib Pajak: <strong className="text-slate-900">{berkas.namaWpBaru}</strong></p>
              <p className="text-[11px] text-blue-700 font-medium">
                Status berkas akan di-rollback ke <strong>Menunggu Verifikasi 1</strong> agar dapat diperiksa kembali oleh staf pemeriksa.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">
                Catatan Rollback / Alasan Pengajuan Ulang
              </label>
              <textarea
                rows={3}
                value={rollbackModal.catatan}
                onChange={(e) => setRollbackModal({ ...rollbackModal, catatan: e.target.value })}
                placeholder="Misal: Dokumen kelengkapan telah dilengkapi secara fisik/offline..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRollbackModal({ open: false, catatan: "" })}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleRollbackBerkas}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <Undo2 size={14} />
                {submitting ? "Memproses..." : "Konfirmasi Rollback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Berkas */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-rose-700 flex items-center gap-2">
              <Trash2 size={20} className="text-rose-600" />
              Hapus Berkas Permanen
            </h3>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
              <p className="text-slate-700">No. Berkas: <strong className="text-slate-900">{berkas.noBerkas}</strong></p>
              <p className="text-slate-700">Wajib Pajak: <strong className="text-slate-900">{berkas.namaWpBaru}</strong></p>
              <p className="text-rose-700 font-bold">
                Peringatan: Berkas ini akan dihapus secara permanen dari sistem dan tidak dapat dipulihkan kembali!
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteBerkas}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Trash2 size={14} />
                {submitting ? "Menghapus..." : "Ya, Hapus Berkas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

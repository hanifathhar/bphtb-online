"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  ArrowLeft,
  Save,
  User,
  Building,
  Calculator,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function EditBerkasBphtbPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [berkas, setBerkas] = useState<any>(null);

  // Master Data States
  const [kecamatans, setKecamatans] = useState<any[]>([]);
  const [desas, setDesas] = useState<any[]>([]);
  const [jenisTransaksis, setJenisTransaksis] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState<any>({
    nop: "",
    namaWp: "",
    nikWp: "",
    npwpWp: "",
    alamatWp: "",
    rtWp: "",
    rwWp: "",
    kecamatanWp: "",
    kelurahanWp: "",
    kotaWp: "TAPANULI SELATAN",
    kodePosWp: "",
    telpWp: "",

    namaWpBaru: "",
    nikWpBaru: "",
    npwpWpBaru: "",
    alamatWpBaru: "",
    rtWpBaru: "",
    rwWpBaru: "",
    kecamatanWpBaru: "",
    kelurahanWpBaru: "",
    kotaWpBaru: "TAPANULI SELATAN",
    kodePosWpBaru: "",
    telpWpBaru: "",

    lokasiOp: "",
    rtOp: "000",
    rwOp: "00",
    kecamatanOp: "",
    kelurahanOp: "",
    kotaOp: "TAPANULI SELATAN",
    luasBumi: 0,
    luasBangunan: 0,
    njopBumi: 0,
    njopBangunan: 0,

    jnsTransaksi: "1",
    nilaiTransaksi: 0,
    npoptkp: 80000000,
    tarif: 5.0,
    ppat: "",
    keterangan: "",

    scanKtp: "",
    scanNpwp: "",
    scanPernyataan: "",
    scanSertifikat: "",
    scanPbb: "",
    fotoObjek: "",
  });

  // Fetch Existing Berkas and Master Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [berkasRes, kecRes, jtRes] = await Promise.all([
          fetch(`/api/bphtb/${id}`),
          fetch("/api/master/kecamatan"),
          fetch("/api/master/jenis-transaksi"),
        ]);

        if (kecRes.ok) {
          const k = await kecRes.json();
          setKecamatans(k.data || []);
        }

        if (jtRes.ok) {
          const jt = await jtRes.json();
          setJenisTransaksis(jt.data || []);
        }

        if (berkasRes.ok) {
          const b = await berkasRes.json();
          const d = b.data;
          setBerkas(d);
          setFormData({
            nop: d.nop || "",
            namaWp: d.namaWp || "",
            nikWp: d.nikWp || "",
            npwpWp: d.npwpWp || "",
            alamatWp: d.alamatWp || "",
            rtWp: d.rtWp || "",
            rwWp: d.rwWp || "",
            kecamatanWp: d.kecamatanWp || "",
            kelurahanWp: d.kelurahanWp || "",
            kotaWp: d.kotaWp || "TAPANULI SELATAN",
            kodePosWp: d.kodePosWp || "",
            telpWp: d.telpWp || "",

            namaWpBaru: d.namaWpBaru || "",
            nikWpBaru: d.nikWpBaru || "",
            npwpWpBaru: d.npwpWpBaru || "",
            alamatWpBaru: d.alamatWpBaru || "",
            rtWpBaru: d.rtWpBaru || "",
            rwWpBaru: d.rwWpBaru || "",
            kecamatanWpBaru: d.kecamatanWpBaru || "",
            kelurahanWpBaru: d.kelurahanWpBaru || "",
            kotaWpBaru: d.kotaWpBaru || "TAPANULI SELATAN",
            kodePosWpBaru: d.kodePosWpBaru || "",
            telpWpBaru: d.telpWpBaru || "",

            lokasiOp: d.lokasiOp || "",
            rtOp: d.rtOp || "000",
            rwOp: d.rwOp || "00",
            kecamatanOp: d.kecamatanOp || "",
            kelurahanOp: d.kelurahanOp || "",
            kotaOp: d.kotaOp || "TAPANULI SELATAN",
            luasBumi: Number(d.luasBumi || 0),
            luasBangunan: Number(d.luasBangunan || 0),
            njopBumi: Number(d.njopBumi || 0),
            njopBangunan: Number(d.njopBangunan || 0),

            jnsTransaksi: String(d.jnsTransaksi || "1"),
            nilaiTransaksi: Number(d.nilaiTransaksi || 0),
            npoptkp: Number(d.npoptkp || 80000000),
            tarif: Number(d.tarif || 5.0),
            ppat: d.ppat || "",
            keterangan: d.keterangan || "",

            scanKtp: d.scanKtp || "",
            scanNpwp: d.scanNpwp || "",
            scanPernyataan: d.scanPernyataan || "",
            scanSertifikat: d.scanSertifikat || "",
            scanPbb: d.scanPbb || "",
            fotoObjek: d.fotoObjek || "",
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Gagal memuat data berkas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Calculations
  const luasBumi = Number(formData.luasBumi || 0);
  const luasBangunan = Number(formData.luasBangunan || 0);
  const njopBumi = Number(formData.njopBumi || 0);
  const njopBangunan = Number(formData.njopBangunan || 0);

  const totalNjopBumi = luasBumi * njopBumi;
  const totalNjopBangunan = luasBangunan * njopBangunan;
  const nilaiPbb = totalNjopBumi + totalNjopBangunan;

  const nilaiTransaksi = Number(formData.nilaiTransaksi || 0);
  const npop = Math.max(nilaiTransaksi, nilaiPbb);
  const npoptkp = Number(formData.npoptkp || 0);
  const npopkp = Math.max(0, npop - npoptkp);
  const tarif = Number(formData.tarif || 5.0);
  const calculatedBphtb = (npopkp * tarif) / 100;

  const handleJenisTransaksiChange = (val: string) => {
    const found = jenisTransaksis.find((j) => String(j.jnsTransaksi) === val);
    setFormData((prev: any) => ({
      ...prev,
      jnsTransaksi: val,
      npoptkp: found && found.nopptkp ? Number(found.nopptkp) : prev.npoptkp,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/bphtb/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nop: (formData.nop || "").replace(/\D/g, ""),
          resubmit: true, // Automatically reset rejected state and resubmit to Verifikasi 1
          statusBerkas: 1,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal menyimpan perbaikan data");
        setSubmitting(false);
        return;
      }

      toast.success("Perbaikan data berhasil disimpan! Berkas telah diajukan kembali untuk verifikasi.");
      router.push(`/bphtb/berkas/${id}`);
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi server");
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

  if (loading) {
    return (
      <DashboardShell active="berkas">
        <div className="py-20 text-center text-slate-500">
          Memuat formulir perbaikan berkas...
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

  const isDitolak = berkas.statusBerkas === 9;

  return (
    <DashboardShell active="berkas">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/bphtb/berkas/${id}`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Perbaikan & Koreksi Berkas BPHTB</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-mono font-bold">
                {berkas.noBerkas}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Lakukan perubahan data yang diperlukan kemudian simpan untuk diajukan kembali ke antrean verifikasi.
            </p>
          </div>
        </div>
      </div>

      {/* Rejection Alert Notice */}
      {isDitolak && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertCircle size={18} />
            <span>Berkas Ini Berstatus: DITOLAK / PERLU PERBAIKAN</span>
          </div>
          {berkas.ketVerif1 && berkas.verif1 === 2 && (
            <p className="text-slate-700">
              <strong>Catatan Verifikator 1:</strong> {berkas.ketVerif1}
            </p>
          )}
          {berkas.ketVerif2 && berkas.verif2 === 2 && (
            <p className="text-slate-700">
              <strong>Catatan Verifikator 2:</strong> {berkas.ketVerif2}
            </p>
          )}
          {berkas.ketVerif3 && berkas.verif3 === 2 && (
            <p className="text-slate-700">
              <strong>Catatan Kabid (Verif 3):</strong> {berkas.ketVerif3}
            </p>
          )}
          <p className="text-[11px] text-rose-600 font-medium">
            Silakan koreksi data di bawah ini, lalu klik tombol <strong>"Simpan & Ajukan Kembali"</strong>.
          </p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seksi 1: Data Wajib Pajak Lama */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <User size={16} className="text-red-600" />
            1. Data Wajib Pajak Lama (Penjual / Pemilik Sebelumnya)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Wajib Pajak Lama *</label>
              <input
                type="text"
                required
                value={formData.namaWp}
                onChange={(e) => setFormData({ ...formData, namaWp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIK Wajib Pajak Lama</label>
              <input
                type="text"
                value={formData.nikWp}
                onChange={(e) => setFormData({ ...formData, nikWp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NPWP Wajib Pajak Lama</label>
              <input
                type="text"
                value={formData.npwpWp}
                onChange={(e) => setFormData({ ...formData, npwpWp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Wajib Pajak Lama</label>
              <input
                type="text"
                value={formData.alamatWp}
                onChange={(e) => setFormData({ ...formData, alamatWp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RT / RW</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="RT"
                  value={formData.rtWp}
                  onChange={(e) => setFormData({ ...formData, rtWp: e.target.value })}
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="RW"
                  value={formData.rwWp}
                  onChange={(e) => setFormData({ ...formData, rwWp: e.target.value })}
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={formData.kecamatanWp}
                onChange={(e) => setFormData({ ...formData, kecamatanWp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelurahan / Desa</label>
              <input
                type="text"
                value={formData.kelurahanWp}
                onChange={(e) => setFormData({ ...formData, kelurahanWp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={formData.kotaWp}
                onChange={(e) => setFormData({ ...formData, kotaWp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Seksi 2: Data Wajib Pajak Baru */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <User size={16} className="text-emerald-600" />
            2. Data Wajib Pajak Baru (Pembeli / Penerima Hak)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Wajib Pajak Baru *</label>
              <input
                type="text"
                required
                value={formData.namaWpBaru}
                onChange={(e) => setFormData({ ...formData, namaWpBaru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIK Wajib Pajak Baru</label>
              <input
                type="text"
                value={formData.nikWpBaru}
                onChange={(e) => setFormData({ ...formData, nikWpBaru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NPWP Wajib Pajak Baru</label>
              <input
                type="text"
                value={formData.npwpWpBaru}
                onChange={(e) => setFormData({ ...formData, npwpWpBaru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Wajib Pajak Baru</label>
              <input
                type="text"
                value={formData.alamatWpBaru}
                onChange={(e) => setFormData({ ...formData, alamatWpBaru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RT / RW</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="RT"
                  value={formData.rtWpBaru}
                  onChange={(e) => setFormData({ ...formData, rtWpBaru: e.target.value })}
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="RW"
                  value={formData.rwWpBaru}
                  onChange={(e) => setFormData({ ...formData, rwWpBaru: e.target.value })}
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={formData.kecamatanWpBaru}
                onChange={(e) => setFormData({ ...formData, kecamatanWpBaru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelurahan / Desa</label>
              <input
                type="text"
                value={formData.kelurahanWpBaru}
                onChange={(e) => setFormData({ ...formData, kelurahanWpBaru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={formData.kodePosWpBaru}
                onChange={(e) => setFormData({ ...formData, kodePosWpBaru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Seksi 3: Data Objek Pajak */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Building size={16} className="text-blue-600" />
            3. Data Objek Pajak (NOP & Nilai NJOP)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Objek Pajak (NOP) PBB *</label>
              <input
                type="text"
                required
                value={formData.nop}
                onChange={(e) => setFormData({ ...formData, nop: e.target.value.replace(/\D/g, "") })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Letak / Alamat Objek Pajak *</label>
              <input
                type="text"
                required
                value={formData.lokasiOp}
                onChange={(e) => setFormData({ ...formData, lokasiOp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan Objek</label>
              <input
                type="text"
                value={formData.kecamatanOp}
                onChange={(e) => setFormData({ ...formData, kecamatanOp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelurahan / Desa Objek</label>
              <input
                type="text"
                value={formData.kelurahanOp}
                onChange={(e) => setFormData({ ...formData, kelurahanOp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RT / RW Objek</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="RT"
                  value={formData.rtOp}
                  onChange={(e) => setFormData({ ...formData, rtOp: e.target.value })}
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="RW"
                  value={formData.rwOp}
                  onChange={(e) => setFormData({ ...formData, rwOp: e.target.value })}
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Grid Luas & NJOP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Luas Tanah (M²)</label>
              <input
                type="number"
                min="0"
                value={formData.luasBumi}
                onChange={(e) => setFormData({ ...formData, luasBumi: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NJOP Tanah / M² (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.njopBumi}
                onChange={(e) => setFormData({ ...formData, njopBumi: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Luas Bangunan (M²)</label>
              <input
                type="number"
                min="0"
                value={formData.luasBangunan}
                onChange={(e) => setFormData({ ...formData, luasBangunan: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NJOP Bangunan / M² (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.njopBangunan}
                onChange={(e) => setFormData({ ...formData, njopBangunan: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
              />
            </div>

            <div className="md:col-span-4 pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">Total Nilai NJOP PBB:</span>
              <span className="text-sm font-black text-slate-900">{formatRupiah(nilaiPbb)}</span>
            </div>
          </div>
        </div>

        {/* Seksi 4: Transaksi & Perhitungan BPHTB */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Calculator size={16} className="text-amber-600" />
            4. Nilai Transaksi & Perhitungan BPHTB
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Perolehan Hak / Transaksi *</label>
              <select
                value={formData.jnsTransaksi}
                onChange={(e) => handleJenisTransaksiChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                {jenisTransaksis.map((jt) => (
                  <option key={jt.jnsTransaksi} value={jt.jnsTransaksi}>
                    {jt.keterangan}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Harga Transaksi / Pasar (Rp) *</label>
              <input
                type="number"
                min="0"
                value={formData.nilaiTransaksi}
                onChange={(e) => setFormData({ ...formData, nilaiTransaksi: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PPAT / Notaris</label>
              <input
                type="text"
                value={formData.ppat}
                onChange={(e) => setFormData({ ...formData, ppat: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Rincian Hasil Perhitungan */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <span>Dasar Pengenaan Pajak (NPOP = Max[Transaksi, NJOP]):</span>
              <span className="font-mono font-bold text-slate-900">{formatRupiah(npop)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Nilai Tidak Kena Pajak (NPOPTKP):</span>
              <span className="font-mono font-bold text-slate-900">{formatRupiah(npoptkp)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Nilai Kena Pajak (NPOPKP):</span>
              <span className="font-mono font-bold text-slate-900">{formatRupiah(npopkp)}</span>
            </div>
            <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Bea BPHTB Terutang (5% × NPOPKP):</span>
              <span className="font-mono font-black text-lg text-emerald-600">{formatRupiah(calculatedBphtb)}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan / Keterangan</label>
            <textarea
              rows={2}
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Catatan tambahan dokumen atau penjelasan perbaikan..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <Link
            href={`/bphtb/berkas/${id}`}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition disabled:opacity-50"
          >
            <Save size={16} />
            <span>{submitting ? "Menyimpan Perbaikan..." : "Simpan & Ajukan Kembali"}</span>
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import {
  FilePlus,
  User,
  UserCheck,
  Building,
  Calculator,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  HelpCircle,
  FileText,
  Shield,
  Percent,
  Search,
  Database,
  Sparkles,
  Check,
  AlertCircle,
  AlertTriangle,
  Receipt,
  RefreshCw,
  FileUp,
  Paperclip,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function PendaftaranBphtbPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // PBB NOP Lookup States
  const [inputNopQuery, setInputNopQuery] = useState("");
  const [loadingPbb, setLoadingPbb] = useState(false);
  const [pbbDataSuccess, setPbbDataSuccess] = useState<any>(null);

  // Master Data States
  const [kecamatans, setKecamatans] = useState<any[]>([]);
  const [desas, setDesas] = useState<any[]>([]);
  const [jenisTransaksis, setJenisTransaksis] = useState<any[]>([]);
  const [keperluans, setKeperluans] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: WP Lama
    namaWp: "",
    nikWp: "",
    npwpWp: "",
    alamatWp: "",
    rtWp: "",
    rwWp: "",
    kecamatanWp: "",
    kelurahanWp: "",
    kotaWp: "Kabupaten",
    kodePosWp: "",
    telpWp: "",

    // Step 2: WP Baru
    namaWpBaru: "",
    nikWpBaru: "",
    npwpWpBaru: "",
    alamatWpBaru: "",
    rtWpBaru: "",
    rwWpBaru: "",
    kecamatanWpBaru: "",
    kelurahanWpBaru: "",
    kotaWpBaru: "Kabupaten",
    kodePosWpBaru: "",
    telpWpBaru: "",

    // Step 3: Objek Pajak (NOP)
    nop: "",
    lokasiOp: "",
    rtOp: "",
    rwOp: "",
    kecamatanOp: "",
    kelurahanOp: "",
    kotaOp: "Kabupaten",
    luasBumi: 100,
    luasBangunan: 0,
    njopBumi: 1500000,
    njopBangunan: 0,

    // Step 4: Transaksi & Perhitungan
    jnsTransaksi: "1",
    nilaiTransaksi: 200000000,
    npoptkp: 80000000,
    tarif: 5.0,
    ppat: "",
    kepentingan: 0,
    isKepentinganUmum: false,
    keterangan: "",

    // SKPDKB (Kurang Bayar) Feature
    jenisKetetapan: "SKPD", // "SKPD" | "SKPDKB"
    nilaiKurangBayar: 0,
    dendaKurangBayar: 0,
    alasanKurangBayar: "",

    // Step 5: Dokumen
    scanKtp: "",
    scanNpwp: "",
    scanPernyataan: "",
    scanSertifikat: "",
    scanPbb: "",
    fotoObjek: "",
  });

  // Fetch Master Data on load
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [kecRes, jtRes, kepRes] = await Promise.all([
          fetch("/api/master/kecamatan"),
          fetch("/api/master/jenis-transaksi"),
          fetch("/api/master/keperluan"),
        ]);

        if (kecRes.ok) {
          const k = await kecRes.json();
          setKecamatans(k.data || []);
        }

        if (jtRes.ok) {
          const jt = await jtRes.json();
          setJenisTransaksis(jt.data || []);
          if (jt.data?.length > 0) {
            const first = jt.data[0];
            setFormData((prev) => ({
              ...prev,
              jnsTransaksi: String(first.jnsTransaksi),
              npoptkp: Number(first.nopptkp || 80000000),
            }));
          }
        }

        if (kepRes.ok) {
          const kep = await kepRes.json();
          setKeperluans(kep.data || []);
        }
      } catch (err) {
        console.error("Error fetching master data:", err);
      }
    };
    fetchMasters();
  }, []);

  // Update desa when kecamatan changes
  useEffect(() => {
    const fetchDesas = async () => {
      if (!formData.kecamatanOp) return;
      const matched = kecamatans.find((k) => k.kecamatan === formData.kecamatanOp);
      const idKec = matched?.idKecamatan || "";
      try {
        const res = await fetch(`/api/master/desa?idKecamatan=${idKec}`);
        if (res.ok) {
          const d = await res.json();
          setDesas(d.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDesas();
  }, [formData.kecamatanOp, kecamatans]);

  // SISMIOP PBB NOP Auto-Lookup Function
  const handleLookupNop = async (queryNop?: string) => {
    const rawTarget = (queryNop || inputNopQuery || formData.nop || "").trim();
    const targetNop = rawTarget.replace(/\D/g, "");
    if (!targetNop) {
      toast.error("Masukkan NOP PBB terlebih dahulu");
      return;
    }

    setLoadingPbb(true);
    try {
      const res = await fetch(`/api/pbb/nop/${encodeURIComponent(targetNop)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Data NOP PBB tidak ditemukan");
        setPbbDataSuccess(null);
        setLoadingPbb(false);
        return;
      }

      const d = json.data;
      setPbbDataSuccess(d);

      // Auto-populate form data from PBB SISMIOP!
      setFormData((prev) => ({
        ...prev,
        nop: d.nop ? String(d.nop).replace(/\D/g, "") : targetNop,
        namaWp: d.namaWp || prev.namaWp,
        alamatWp: d.alamatOp || prev.alamatWp,
        kecamatanWp: d.kecamatanOp || prev.kecamatanWp,
        kelurahanWp: d.kelurahanOp || prev.kelurahanWp,

        lokasiOp: d.alamatOp || prev.lokasiOp,
        kecamatanOp: d.kecamatanOp || prev.kecamatanOp,
        kelurahanOp: d.kelurahanOp || prev.kelurahanOp,
        kotaOp: d.kotaOp || prev.kotaOp,

        luasBumi: d.luasBumi,
        luasBangunan: d.luasBangunan,
        njopBumi: d.njopBumiPerM2 || (d.luasBumi > 0 ? Math.round(d.totalNjopBumi / d.luasBumi) : 0),
        njopBangunan: d.njopBangunanPerM2 || (d.luasBangunan > 0 ? Math.round(d.totalNjopBangunan / d.luasBangunan) : 0),
      }));

      toast.success(
        `Data PBB Ditemukan: ${d.namaWp} (Total NJOP: Rp ${new Intl.NumberFormat("id-ID").format(d.totalNjop)})`
      );
    } catch (err: any) {
      toast.error("Gagal terhubung ke API TrustMark PBB: " + err.message);
    } finally {
      setLoadingPbb(false);
    }
  };

  // Handle Jenis Transaksi Change to auto-fill NPOPTKP
  const handleJenisTransaksiChange = (val: string) => {
    const found = jenisTransaksis.find((j) => String(j.jnsTransaksi) === val);
    const npoptkpVal = found ? Number(found.nopptkp) : 80000000;
    setFormData((prev) => ({
      ...prev,
      jnsTransaksi: val,
      npoptkp: npoptkpVal,
    }));
  };

  // Calculations
  const luasBumi = Number(formData.luasBumi) || 0;
  const luasBangunan = Number(formData.luasBangunan) || 0;
  const njopBumi = Number(formData.njopBumi) || 0;
  const njopBangunan = Number(formData.njopBangunan) || 0;

  const totalNjopBumi = luasBumi * njopBumi;
  const totalNjopBangunan = luasBangunan * njopBangunan;
  const totalNjop = totalNjopBumi + totalNjopBangunan;

  const isKepentinganUmum = Boolean(formData.isKepentinganUmum || formData.kepentingan === 1);

  const nilaiTransaksi = Number(formData.nilaiTransaksi) || 0;
  const npop = Math.max(nilaiTransaksi, totalNjop);
  const npoptkp = Number(formData.npoptkp) || 0;
  const npopkp = isKepentinganUmum ? 0 : Math.max(0, npop - npoptkp);
  const tarif = Number(formData.tarif) || 5.0;
  const bphtbStandar = isKepentinganUmum ? 0 : ((npopkp * tarif) / 100);

  // Jika SKPDKB, nilai BPHTB adalah Pokok Kurang Bayar + Denda/Bunga
  const isSkpdkb = formData.jenisKetetapan === "SKPDKB";
  const nilaiKurangBayar = Number(formData.nilaiKurangBayar) || 0;
  const dendaKurangBayar = Number(formData.dendaKurangBayar) || 0;
  const totalSkpdkb = nilaiKurangBayar + dendaKurangBayar;

  const bphtbTerutang = isSkpdkb ? totalSkpdkb : bphtbStandar;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleFileUpload = async (key: string, file: File) => {
    if (!file) return;

    // Validasi Ukuran File (Maksimal 1 MB)
    const MAX_BYTES = 1 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast.error(
        `Ukuran file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 1MB!`
      );
      return;
    }

    setUploadingField(key);
    const toastId = toast.loading(`Mengunggah file ${file.name}...`);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Gagal mengunggah file", { id: toastId });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [key]: json.data.url,
      }));

      toast.success(`File ${file.name} berhasil diunggah!`, { id: toastId });
    } catch (err: any) {
      toast.error("Terjadi kesalahan saat mengunggah: " + err.message, { id: toastId });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bphtb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nop: (formData.nop || "").replace(/\D/g, ""),
          luasBumi,
          luasBangunan,
          njopBumi,
          njopBangunan,
          totalNjopBumi,
          totalNjopBangunan,
          nilaiPbb: totalNjop,
          nilaiTransaksi,
          npop,
          npoptkp,
          npopkp,
          tarif,
          bphtb: bphtbTerutang,
          kepentingan: isKepentinganUmum ? 1 : 0,
          isKepentinganUmum,
          jenisKetetapan: formData.jenisKetetapan,
          nilaiKurangBayar: isSkpdkb ? nilaiKurangBayar : 0,
          dendaKurangBayar: isSkpdkb ? dendaKurangBayar : 0,
          alasanKurangBayar: isSkpdkb ? formData.alasanKurangBayar : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal mendaftarkan berkas");
        setLoading(false);
        return;
      }

      toast.success(`Berkas berhasil didaftarkan dengan No. ${data.data.noBerkas}!`);
      setTimeout(() => {
        router.push(`/bphtb/berkas/${data.data.idBerkas}`);
      }, 800);
    } catch (err) {
      toast.error("Terjadi kesalahan server saat menyimpan berkas");
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Wajib Pajak (Lama)", icon: User },
    { num: 2, title: "Wajib Pajak (Baru)", icon: UserCheck },
    { num: 3, title: "Objek Pajak (NOP)", icon: Building },
    { num: 4, title: "Transaksi & Hitung", icon: Calculator },
    { num: 5, title: "Dokumen & Submit", icon: UploadCloud },
  ];

  return (
    <DashboardShell active="pendaftaran">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold mb-2 border border-red-200/80">
            <FilePlus size={14} /> Pendaftaran Permohonan BPHTB
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Formulir Pendaftaran Berkas BPHTB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Terintegrasi langsung dengan Database PBB Pemkab Tapanuli Selatan untuk penarikan data NOP & NJOP secara instan.
          </p>
        </div>
      </div>

      {/* PBB SISMIOP Live NOP Lookup Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-red-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <Database size={16} />
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Tarik Data Otomatis dari PBB
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Masukkan Nomor Objek Pajak (NOP) 18 digit untuk mengisi otomatis data Wajib Pajak, Lokasi, Luas Tanah/Bangunan, dan Nilai NJOP SPPT PBB.
          </p>
        </div>

        {/* NOP Search Box */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Masukkan NOP 18 Digit (contoh: 120310007300401740)..."
              value={inputNopQuery}
              onChange={(e) => setInputNopQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLookupNop(inputNopQuery);
                }
              }}
              className="w-full pl-4 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
            />
          </div>
          <button
            type="button"
            disabled={loadingPbb}
            onClick={() => handleLookupNop(inputNopQuery)}
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-600/20 active:scale-95 transition disabled:opacity-50"
          >
            {loadingPbb ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Menghubungkan TrustMark PBB...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Tarik Data PBB</span>
              </>
            )}
          </button>
        </div>

        {/* Synchronized PBB Data Banner */}
        {pbbDataSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Data PBB Berhasil Ditarik & Sinkron!</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-800 font-bold">
                NOP: {pbbDataSuccess.nop}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 pt-2 border-t border-emerald-200/80 font-medium">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold">Nama WP Terdaftar:</p>
                <p className="font-bold text-slate-900">{pbbDataSuccess.namaWp || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold">Lokasi / Wilayah:</p>
                <p className="font-bold text-slate-800 truncate">{pbbDataSuccess.alamatOp || "-"}</p>
                <p className="text-[10px] text-slate-500">{pbbDataSuccess.kelurahanOp}, {pbbDataSuccess.kecamatanOp}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold">Luas Tanah & Bangunan:</p>
                <p className="font-bold text-red-600">{pbbDataSuccess.luasBumi} m² / {pbbDataSuccess.luasBangunan} m²</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold">Total Nilai NJOP:</p>
                <p className="font-bold text-emerald-700">{formatRupiah(pbbDataSuccess.totalNjop)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step Wizard Indicator */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-2">
          {stepsList.map((s, idx) => {
            const Icon = s.icon;
            const isPassed = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition text-xs font-bold ${isCurrent
                    ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                    : isPassed
                      ? "text-emerald-700 hover:bg-slate-50"
                      : "text-slate-500 hover:text-slate-600"
                    }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isCurrent
                      ? "bg-red-600 text-white shadow-xs"
                      : isPassed
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {isPassed ? <CheckCircle2 size={15} /> : s.num}
                  </div>
                  <span>{s.title}</span>
                </button>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${step > s.num ? "bg-emerald-300" : "bg-slate-200"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* STEP 1: WAJIB PAJAK LAMA */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User size={20} className="text-red-600" />
                  Data Wajib Pajak (Pemilik / Penjual Lama di SPPT PBB)
                </h2>
                <p className="text-xs text-slate-500">
                  Data identitas pemilik lama terisi otomatis dari integrasi NOP PBB.
                </p>
              </div>
              {pbbDataSuccess && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                  <Check size={12} /> Terverifikasi Aplikasi PBB Pemda
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Nama Wajib Pajak (Lama / SPPT PBB) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Abdul Hanif Athhar"
                  value={formData.namaWp}
                  onChange={(e) => setFormData({ ...formData, namaWp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  NIK (KTP)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="16 digit NIK"
                  value={formData.nikWp}
                  onChange={(e) => setFormData({ ...formData, nikWp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  NPWP Wajib Pajak
                </label>
                <input
                  type="text"
                  placeholder="00.000.000.0-000.000"
                  value={formData.npwpWp}
                  onChange={(e) => setFormData({ ...formData, npwpWp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Alamat Lengkap WP *
                </label>
                <input
                  type="text"
                  placeholder="Nama jalan, nomor rumah / blok"
                  value={formData.alamatWp}
                  onChange={(e) => setFormData({ ...formData, alamatWp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  RT / RW
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="RT"
                    value={formData.rtWp}
                    onChange={(e) => setFormData({ ...formData, rtWp: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="RW"
                    value={formData.rwWp}
                    onChange={(e) => setFormData({ ...formData, rwWp: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kecamatan WP
                </label>
                <input
                  type="text"
                  placeholder="Kecamatan"
                  value={formData.kecamatanWp}
                  onChange={(e) => setFormData({ ...formData, kecamatanWp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kelurahan / Desa WP
                </label>
                <input
                  type="text"
                  placeholder="Kelurahan / Desa"
                  value={formData.kelurahanWp}
                  onChange={(e) => setFormData({ ...formData, kelurahanWp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={formData.telpWp}
                  onChange={(e) => setFormData({ ...formData, telpWp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WAJIB PAJAK BARU */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck size={20} className="text-emerald-600" />
                Data Wajib Pajak Baru (Pembeli / Penerima Hak)
              </h2>
              <p className="text-xs text-slate-500">
                Pihak yang memperoleh hak atas tanah/bangunan dan wajib membayar BPHTB.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Nama Wajib Pajak Baru *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Roy Sandy Harahap"
                  value={formData.namaWpBaru}
                  onChange={(e) => setFormData({ ...formData, namaWpBaru: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  NIK (KTP) *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="16 digit NIK"
                  value={formData.nikWpBaru}
                  onChange={(e) => setFormData({ ...formData, nikWpBaru: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  NPWP Wajib Pajak Baru
                </label>
                <input
                  type="text"
                  placeholder="00.000.000.0-000.000"
                  value={formData.npwpWpBaru}
                  onChange={(e) => setFormData({ ...formData, npwpWpBaru: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Alamat Lengkap WP Baru *
                </label>
                <input
                  type="text"
                  placeholder="Nama jalan, nomor rumah / blok"
                  value={formData.alamatWpBaru}
                  onChange={(e) => setFormData({ ...formData, alamatWpBaru: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  RT / RW
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="RT"
                    value={formData.rtWpBaru}
                    onChange={(e) => setFormData({ ...formData, rtWpBaru: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="RW"
                    value={formData.rwWpBaru}
                    onChange={(e) => setFormData({ ...formData, rwWpBaru: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kecamatan
                </label>
                <input
                  type="text"
                  placeholder="Kecamatan"
                  value={formData.kecamatanWpBaru}
                  onChange={(e) => setFormData({ ...formData, kecamatanWpBaru: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  placeholder="Kelurahan / Desa"
                  value={formData.kelurahanWpBaru}
                  onChange={(e) => setFormData({ ...formData, kelurahanWpBaru: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  No. Telepon / WhatsApp *
                </label>
                <input
                  type="text"
                  placeholder="0813xxxxxxxx"
                  value={formData.telpWpBaru}
                  onChange={(e) => setFormData({ ...formData, telpWpBaru: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: OBJEK PAJAK & NOP */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building size={20} className="text-cyan-700" />
                  Data Objek Pajak (NOP & NJOP PBB Terintegrasi)
                </h2>
                <p className="text-xs text-slate-500">
                  Data NJOP dan spesifikasi luas tanah/bangunan tersinkron dengan server PBB.
                </p>
              </div>
              {pbbDataSuccess && (
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-bold">
                  Sinkron dengan SISMIOP
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Nomor Objek Pajak (NOP PBB) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Masukkan 18 digit NOP PBB"
                    value={formData.nop}
                    onChange={(e) => setFormData({ ...formData, nop: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupNop(formData.nop)}
                    className="px-3 py-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold whitespace-nowrap"
                  >
                    Tarik NOP
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kecamatan Objek Pajak *
                </label>
                <input
                  type="text"
                  value={formData.kecamatanOp}
                  onChange={(e) => setFormData({ ...formData, kecamatanOp: e.target.value })}
                  placeholder="Kecamatan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kelurahan / Desa Objek Pajak *
                </label>
                <input
                  type="text"
                  value={formData.kelurahanOp}
                  onChange={(e) => setFormData({ ...formData, kelurahanOp: e.target.value })}
                  placeholder="Kelurahan / Desa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Alamat / Lokasi Objek Pajak *
                </label>
                <input
                  type="text"
                  placeholder="Alamat lengkap objek pajak (tanah / bangunan)"
                  value={formData.lokasiOp}
                  onChange={(e) => setFormData({ ...formData, lokasiOp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {/* Luas & NJOP Tanah */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 sm:col-span-3 lg:col-span-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Rincian NJOP Bumi & Bangunan (Tersinkronisasi)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Luas Bumi / Tanah (m²)
                    </label>
                    <input
                      type="number"
                      value={formData.luasBumi}
                      onChange={(e) => setFormData({ ...formData, luasBumi: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NJOP Bumi / m² (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.njopBumi}
                      onChange={(e) => setFormData({ ...formData, njopBumi: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Luas Bangunan (m²)
                    </label>
                    <input
                      type="number"
                      value={formData.luasBangunan}
                      onChange={(e) => setFormData({ ...formData, luasBangunan: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NJOP Bangunan / m² (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.njopBangunan}
                      onChange={(e) => setFormData({ ...formData, njopBangunan: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subtotals */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-500">Total NJOP Bumi: </span>
                    <span className="text-slate-800">{formatRupiah(totalNjopBumi)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total NJOP Bangunan: </span>
                    <span className="text-slate-800">{formatRupiah(totalNjopBangunan)}</span>
                  </div>
                  <div className="p-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    <span>Total Nilai PBB (NJOP Total): </span>
                    <span className="font-bold">{formatRupiah(totalNjop)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TRANSAKSI & PERHITUNGAN */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator size={20} className="text-amber-600" />
                  Data Transaksi & Perhitungan Pajak BPHTB
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih jenis perolehan hak, jenis ketetapan (SKPD Standar / Kurang Bayar), dan kalkulasi otomatis.
                </p>
              </div>

              {/* Jenis Ketetapan Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, jenisKetetapan: "SKPD" })}
                  className={`px-3 py-1.5 rounded-lg transition ${formData.jenisKetetapan === "SKPD"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  SKPD Standar
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, jenisKetetapan: "SKPDKB" })}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${formData.jenisKetetapan === "SKPDKB"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-amber-700 hover:text-amber-900"
                    }`}
                >
                  <AlertCircle size={13} />
                  <span>SKPDKB (Kurang Bayar)</span>
                </button>
              </div>
            </div>

            {/* Banner Khusus SKPDKB */}
            {isSkpdkb && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span>Mode Penerbitan SKPDKB (Surat Ketetapan Pajak Daerah Kurang Bayar)</span>
                </div>
                <p className="text-amber-700">
                  Masukkan nilai pokok ketetapan kurang bayar serta sanksi bunga/denda administrasi yang ditagihkan kepada Wajib Pajak.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              {/* Inputs */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Jenis Transaksi / Perolehan Hak *
                  </label>
                  <select
                    value={formData.jnsTransaksi}
                    onChange={(e) => handleJenisTransaksiChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {jenisTransaksis.map((jt) => (
                      <option key={jt.jnsTransaksi} value={jt.jnsTransaksi}>
                        {jt.jnsTransaksi}. {jt.keterangan} (NPOPTKP: {formatRupiah(Number(jt.nopptkp))})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Nilai Pasar / Nilai Transaksi / Risalah Lelang (Rp) *
                  </label>
                  <input
                    type="number"
                    value={formData.nilaiTransaksi}
                    onChange={(e) => setFormData({ ...formData, nilaiTransaksi: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * NPOP diambil dari nilai tertinggi antara Nilai Transaksi Pasar dan Total NJOP PBB.
                  </p>
                </div>

                {/* Checkbox Kepentingan Umum */}
                <div className={`p-4 rounded-2xl border transition ${isKepentinganUmum
                  ? "bg-emerald-50/80 border-emerald-300 shadow-xs"
                  : "bg-slate-50/90 border-slate-200 hover:border-slate-300"
                  }`}>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="checkbox-kepentingan-umum"
                      checked={Boolean(formData.isKepentinganUmum)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          isKepentinganUmum: checked,
                          kepentingan: checked ? 1 : 0,
                        }));
                      }}
                      className="mt-0.5 h-4.5 w-4.5 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">
                          Untuk Kepentingan Umum
                        </span>
                        {isKepentinganUmum ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                            Nihil (Bebas Pajak)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            (Hibah sosial, tempat ibadah, fasilitas umum/pemerintah)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Jika dicentang, perolehan hak dibebaskan dari pengenaan BPHTB sehingga nilai <strong>NPOPKP</strong> dan tarif <strong>BPHTB Terutang</strong> otomatis <strong>Nihil (Rp 0)</strong>.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Manual Input Fields for SKPDKB */}
                {isSkpdkb && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <Receipt size={14} className="text-amber-700" />
                      Rincian Pokok Kurang Bayar & Sanksi Denda
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Pokok BPHTB Kurang Bayar (Rp) *
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={formData.nilaiKurangBayar || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nilaiKurangBayar: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Sanksi Administrasi / Bunga / Denda (Rp)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={formData.dendaKurangBayar || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dendaKurangBayar: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Alasan / Dasar Penerbitan SKPDKB
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Hasil pemeriksaan lapangan / koreksi luas tanah dan NJOP"
                        value={formData.alasanKurangBayar || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, alasanKurangBayar: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Nama PPAT / Notaris
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso, S.H., M.Kn"
                    value={formData.ppat}
                    onChange={(e) => setFormData({ ...formData, ppat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Keperluan / Keterangan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Catatan pendaftaran BPHTB..."
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Automatic Calculation Summary Box */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Percent size={14} className="text-red-600" />
                  {isSkpdkb ? "Rincian Ketetapan SKPDKB (Kurang Bayar)" : "Rincian Perhitungan Pajak (Rumus Perda)"}
                </h4>

                {isKepentinganUmum && !isSkpdkb && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span><strong>Objek Kepentingan Umum:</strong> Pembebasan Bea BPHTB (NPOPKP & Nilai Pajak Nihil).</span>
                  </div>
                )}

                <div className="space-y-2.5 text-xs font-medium">
                  {!isSkpdkb ? (
                    <>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Total NJOP PBB (Sistem):</span>
                        <span className="text-slate-800">{formatRupiah(totalNjop)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500">
                        <span>Nilai Transaksi Pasar:</span>
                        <span className="text-slate-800">{formatRupiah(nilaiTransaksi)}</span>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-200 font-semibold text-red-700">
                        <span>NPOP (Dasar Pengenaan):</span>
                        <span>{formatRupiah(npop)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500">
                        <span>NPOPTKP (Tidak Kena Pajak):</span>
                        <span className="text-rose-700">- {formatRupiah(npoptkp)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700 font-semibold border-t border-slate-200/80 pt-2">
                        <span>NPOPKP (Kena Pajak):</span>
                        <span className={isKepentinganUmum ? "text-emerald-700 font-bold" : ""}>
                          {formatRupiah(npopkp)} {isKepentinganUmum ? "(Nihil)" : ""}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-500">
                        <span>Tarif Pajak:</span>
                        <span className="text-slate-800">{tarif}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Kalkulasi Standar BPHTB:</span>
                        <span className="text-slate-800 line-through">{formatRupiah(bphtbStandar)}</span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 rounded-lg bg-amber-100/70 border border-amber-200 font-bold text-amber-900">
                        <span>Pokok Kurang Bayar:</span>
                        <span>{formatRupiah(nilaiKurangBayar)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>Sanksi Bunga / Denda:</span>
                        <span className="text-rose-700 font-bold">+ {formatRupiah(dendaKurangBayar)}</span>
                      </div>

                      {formData.alasanKurangBayar && (
                        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                          <span>Catatan: {formData.alasanKurangBayar}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className={`p-3.5 rounded-xl border mt-3 ${isSkpdkb
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : isKepentinganUmum
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-transparent border-red-200 text-red-700"
                    }`}>
                    <p className="text-[11px] uppercase tracking-wider font-bold">
                      {isSkpdkb ? "Total Tagihan SKPDKB Kurang Bayar:" : "BPHTB Terutang:"}
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {formatRupiah(bphtbTerutang)} {isKepentinganUmum && !isSkpdkb ? "(Nihil)" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOKUMEN & FINALISASI */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud size={20} className="text-purple-700" />
                Upload Dokumen Pendukung & Finalisasi
              </h2>
              <p className="text-xs text-slate-500">
                Kelengkapan berkas fisik & digital yang akan diperiksa oleh Verifikator 1, 2, dan 3.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {[
                { label: "1. KTP Wajib Pajak Baru (Pembeli)", key: "scanKtp", required: true, accept: ".pdf,.jpg,.jpeg,.png", desc: "PDF / JPG / PNG (Maks. 1MB)" },
                { label: "2. NPWP Wajib Pajak Baru", key: "scanNpwp", required: false, accept: ".pdf,.jpg,.jpeg,.png", desc: "PDF / JPG / PNG (Maks. 1MB)" },
                { label: "3. Surat Pernyataan Kebenaran Data", key: "scanPernyataan", required: true, accept: ".pdf,.jpg,.jpeg,.png", desc: "PDF / JPG / PNG (Maks. 1MB)" },
                { label: "4. Sertifikat Tanah / Girik", key: "scanSertifikat", required: true, accept: ".pdf,.jpg,.jpeg,.png", desc: "PDF / JPG / PNG (Maks. 1MB)" },
                { label: "5. SPPT PBB Terverifikasi", key: "scanPbb", required: true, accept: ".pdf,.jpg,.jpeg,.png", desc: "PDF / JPG / PNG (Maks. 1MB)" },
                { label: "6. Foto Lokasi Objek Pajak", key: "fotoObjek", required: false, accept: ".jpg,.jpeg,.png,.webp", desc: "Foto JPG / PNG (Maks. 1MB)" },
              ].map((doc, i) => {
                const currentVal = (formData as any)[doc.key];
                const isUploading = uploadingField === doc.key;
                const fileName = currentVal ? currentVal.split("/").pop() : "";

                return (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <label className="font-semibold text-slate-800 block leading-tight">
                        {doc.label} {doc.required && <span className="text-red-500 font-bold">*</span>}
                      </label>
                      {currentVal ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shrink-0 flex items-center gap-1">
                          <Check size={11} /> Terunggah
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium shrink-0">
                          Belum Ada
                        </span>
                      )}
                    </div>

                    {currentVal ? (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Paperclip size={14} className="text-emerald-600 shrink-0" />
                          <span className="text-slate-800 font-mono text-[11px] truncate" title={fileName}>
                            {fileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={currentVal}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="Buka / Preview Dokumen"
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, [doc.key]: "" })}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            title="Hapus Dokumen"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className={`border-2 border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                          isUploading ? "bg-slate-100 border-slate-300 pointer-events-none" : "border-slate-300 hover:border-red-400 bg-white hover:bg-red-50/20"
                        }`}>
                          <input
                            type="file"
                            accept={doc.accept}
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(doc.key, file);
                            }}
                            className="hidden"
                          />
                          {isUploading ? (
                            <div className="flex items-center gap-2 text-slate-600 text-xs py-1">
                              <RefreshCw size={14} className="animate-spin text-red-600" />
                              <span className="font-semibold">Mengunggah (Maks. 1MB)...</span>
                            </div>
                          ) : (
                            <>
                              <FileUp size={20} className="text-red-500 mb-1" />
                              <span className="text-[11px] font-bold text-slate-700">Pilih / Unggah File</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">{doc.desc}</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary Review Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="text-red-600" />
                Ringkasan Permohonan Berkas BPHTB {isSkpdkb ? "(SKPDKB Kurang Bayar)" : "(Tersinkronisasi PBB)"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-700">
                <div>
                  <p className="text-[11px] text-slate-500">Wajib Pajak Baru:</p>
                  <p className="font-bold text-slate-900">{formData.namaWpBaru || "-"}</p>
                  <p className="text-[11px] text-slate-500">NIK: {formData.nikWpBaru || "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">NOP & Lokasi Objek:</p>
                  <p className="font-bold text-red-600 font-mono">{formData.nop || "-"}</p>
                  <p className="text-[11px] text-slate-500">{formData.kelurahanOp}, {formData.kecamatanOp}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Jenis Ketetapan:</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold mt-1 ${isSkpdkb ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}>
                    {isSkpdkb ? "SKPDKB (Kurang Bayar)" : "SKPD Standar"}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Total Tagihan BPHTB:</p>
                  <p className="font-extrabold text-lg text-emerald-600">
                    {formatRupiah(bphtbTerutang)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ArrowLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold  text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition"
            >
              <span>Lanjut Langkah Berikutnya</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-xs shadow-emerald-500/25 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save size={18} />
                  <span>Kirim & Simpan Berkas Pendaftaran</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

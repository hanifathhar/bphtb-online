"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Receipt,
  CreditCard,
  Building,
  PlusCircle,
  Search,
  Eye,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  BadgePercent,
  Calendar,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [stats, setStats] = useState<any>(null);
  const [recentBerkas, setRecentBerkas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const url = selectedYear ? `/api/bphtb/stats?tahun=${selectedYear}` : "/api/bphtb/stats";
        const [statRes, berkasRes] = await Promise.all([
          fetch(url),
          fetch("/api/bphtb?limit=6"),
        ]);

        if (statRes.ok) {
          const s = await statRes.json();
          setStats(s);
          if (s.selectedYear && s.selectedYear !== "all" && !selectedYear) {
            setSelectedYear(s.selectedYear);
          }
        }

        if (berkasRes.ok) {
          const b = await berkasRes.json();
          setRecentBerkas(b.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedYear]);

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const formatShortRupiah = (val: number) => {
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)} M`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(0)} Jt`;
    }
    return val.toString();
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2.5">
            <span className="font-bold text-sm text-red-400">Tahun {label}</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-semibold">
              {dataItem?.totalBerkas || 0} Berkas
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                Penetapan (Ketetapan):
              </span>
              <span className="font-bold text-slate-100">
                {formatRupiah(dataItem?.penetapan || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Realisasi (Bayar):
              </span>
              <span className="font-bold text-emerald-400">
                {formatRupiah(dataItem?.realisasi || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Sisa Piutang:
              </span>
              <span className="font-bold text-amber-400">
                {formatRupiah(dataItem?.piutang || 0)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-slate-400 font-semibold">
              <span>Capaian Realisasi:</span>
              <span className="text-emerald-400 font-black text-sm">{dataItem?.persentase || 0}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getStatusBadge = (statusBerkas: number, statusBayar: number) => {
    if (statusBayar === 1) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
          <CheckCircle size={12} /> Lunas
        </span>
      );
    }
    switch (statusBerkas) {
      case 1:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
            <Clock size={12} /> Menunggu Verif 1
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock size={12} /> Menunggu Verif 2
          </span>
        );
      case 3:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 w-fit">
            <Clock size={12} /> Menunggu Verif 3
          </span>
        );
      case 4:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1 w-fit">
            <Receipt size={12} /> SKP Terbit (Siap Bayar)
          </span>
        );
      case 9:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> Ditolak / Revisi
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 w-fit">
            Draft
          </span>
        );
    }
  };

  return (
    <DashboardShell active="dashboard">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-700 via-rose-700 to-red-900 border border-red-800 p-6 sm:p-8 shadow-md text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
              <ShieldCheck size={14} />
              Portal Pajak Daerah Terintegrasi SISMIOP PBB
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dashboard BPHTB Online
            </h1>
            <p className="text-sm text-red-100 leading-relaxed font-normal">
              Monitoring real-time pendaftaran permohonan, proses verifikasi 3-tahap, penerbitan kohir SKP, hingga penerimaan kas daerah Kabupaten Tapanuli Selatan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/bphtb/pendaftaran"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md active:scale-95 transition"
            >
              <PlusCircle size={16} />
              <span>Daftar Berkas Baru</span>
            </Link>

            <Link
              href="/bphtb/berkas"
              className="px-4 py-2.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white border border-red-600 font-semibold text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <Search size={16} />
              <span>Cari Berkas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Statistic Cards Header with Year Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar size={20} className="text-red-600" />
            Ringkasan Statistik Pajak {selectedYear === "all" ? "Semua Tahun" : `Tahun ${selectedYear}`}
          </h2>
          <p className="text-xs text-slate-500">
            {selectedYear === "all"
              ? "Akumulasi seluruh data ketetapan dan pembayaran BPHTB"
              : `Menampilkan indikator dan pencapaian khusus pada tahun anggaran ${selectedYear}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
            <span>Filter Tahun:</span>
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border border-slate-300 hover:border-red-500 text-slate-800 text-xs font-bold py-2 pl-3 pr-8 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer transition"
            >
              {stats?.availableYears && stats.availableYears.length > 0 ? (
                stats.availableYears.map((yr: string) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))
              ) : (
                <>
                  <option value="2026">Tahun 2026</option>
                  <option value="2025">Tahun 2025</option>
                  <option value="2024">Tahun 2024</option>
                </>
              )}
              <option value="all">Semua Tahun</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Realisasi */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-red-300 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Realisasi Penerimaan
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {stats ? formatRupiah(stats.totalRealisasi) : "Memuat..."}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-600 font-bold">
            <BadgePercent size={14} />
            <span>{stats?.persentaseRealisasi || 0}% dari penetapan {selectedYear === "all" ? "" : `(${selectedYear})`}</span>
          </div>
        </div>

        {/* Card 2: Total Piutang BPHTB */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-red-300 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Piutang Belum Bayar
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {stats ? formatRupiah(stats.totalPiutang) : "Memuat..."}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-600 font-bold">
            <Clock size={14} />
            <span>Ketetapan terbit menunggu bayar</span>
          </div>
        </div>

        {/* Card 3: Pending Verifikasi */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-red-300 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Menunggu Verifikasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats ? stats.pendingVerifikasi : 0}
            </p>
            <span className="text-xs text-slate-500 font-semibold">berkas</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">
            V1: <span className="text-blue-600 font-bold">{stats?.verif1Pending || 0}</span> | V2: <span className="text-amber-600 font-bold">{stats?.verif2Pending || 0}</span> | V3: <span className="text-purple-600 font-bold">{stats?.verif3Pending || 0}</span>
          </p>
        </div>

        {/* Card 4: Total Berkas & Lunas */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-red-300 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Berkas Masuk
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <FileText size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats ? stats.totalBerkas : 0}
            </p>
            <span className="text-xs text-slate-500 font-semibold">berkas</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle size={13} />
            <span>{stats?.lunas || 0} berkas lunas</span>
          </p>
        </div>
      </div>

      {/* 5-Year Trend Chart Section: Penetapan vs Realisasi */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Tren Penetapan vs Realisasi BPHTB (5 Tahun Terakhir)
                </h2>
                <p className="text-xs text-slate-500">
                  Perbandingan nominal ketetapan pajak terutang terhadap penerimaan kas daerah
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-red-600"></span>
              <span className="font-semibold text-slate-700">Penetapan (Ketetapan)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span className="font-semibold text-slate-700">Realisasi (Sudah Bayar)</span>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {stats?.trend5Tahun && stats.trend5Tahun.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.trend5Tahun}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                barGap={8}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="tahun"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickFormatter={(val) => formatShortRupiah(val)}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="penetapan"
                  name="Penetapan"
                  fill="#dc2626"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
                <Bar
                  dataKey="realisasi"
                  name="Realisasi"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Memuat data tren grafik...
            </div>
          )}
        </div>

        {/* Mini Table Summary of 5 Years */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {stats?.trend5Tahun?.map((t: any) => (
            <div
              key={t.tahun}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-red-300 transition"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-slate-900 text-sm">Tahun {t.tahun}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    t.persentase >= 90
                      ? "bg-emerald-100 text-emerald-700"
                      : t.persentase >= 50
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {t.persentase}%
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Ketetapan:</span>
                  <span className="font-bold text-slate-800">{formatShortRupiah(t.penetapan)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Realisasi:</span>
                  <span className="font-bold text-emerald-600">{formatShortRupiah(t.realisasi)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-200/60">
                  <span>Jumlah:</span>
                  <span className="font-semibold text-slate-600">{t.totalBerkas} berkas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Workflow Navigation Cards */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-red-600" />
            Alur Pelayanan & Verifikasi Berjenjang BPHTB
          </h2>
          <span className="text-xs text-slate-500 hidden sm:block">
            Klik tahap untuk akses langsung
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <Link
            href="/bphtb/verifikasi-1"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                  Tahap 1
                </span>
                <span className="text-blue-700 font-bold">{stats?.verif1Pending || 0} Menunggu</span>
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-blue-700 text-sm">
                Verifikasi 1 (Staf)
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Pemeriksaan fisik dokumen, KTP, NPWP, & keabsahan objek
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-blue-600 font-bold text-[11px]">
              <span>Buka Pemeriksaan</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/bphtb/verifikasi-2"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                  Tahap 2
                </span>
                <span className="text-amber-700 font-bold">{stats?.verif2Pending || 0} Menunggu</span>
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-amber-700 text-sm">
                Verifikasi 2 (Kasie)
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Pemeriksaan teknis tarif, NPOPTKP, NJOP PBB, & hitungan
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-amber-600 font-bold text-[11px]">
              <span>Buka Pemeriksaan</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/bphtb/verifikasi-3"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                  Tahap 3
                </span>
                <span className="text-purple-700 font-bold">{stats?.verif3Pending || 0} Menunggu</span>
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-purple-700 text-sm">
                Verifikasi 3 (Kabid)
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Persetujuan akhir & otomatisasi penerbitan SKP dan Kohir
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-purple-600 font-bold text-[11px]">
              <span>Buka Penetapan</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/bphtb/pembayaran"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                  Tahap 4
                </span>
                <span className="text-emerald-700 font-bold">{stats?.skpTerbit || 0} Siap Bayar</span>
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 text-sm">
                Pembayaran & SSPD
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Pencatatan setoran bank/kasir, cetak bukti lunas SSPD BPHTB
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-emerald-600 font-bold text-[11px]">
              <span>Buka Pembayaran</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Permohonan Berkas BPHTB Terbaru
            </h2>
            <p className="text-xs text-slate-500">
              Daftar registrasi terbaru yang masuk ke dalam sistem
            </p>
          </div>

          <Link
            href="/bphtb/berkas"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Berkas & NOP</th>
                <th className="px-4 py-3">Wajib Pajak (Lama ➔ Baru)</th>
                <th className="px-4 py-3">Lokasi Objek Pajak</th>
                <th className="px-4 py-3 text-right">Nilai BPHTB</th>
                <th className="px-4 py-3 text-center">Status Alur</th>
                <th className="px-4 py-3 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentBerkas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data permohonan BPHTB.
                  </td>
                </tr>
              ) : (
                recentBerkas.map((item) => (
                  <tr key={item.idBerkas} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{item.noBerkas || "DRAFT"}</p>
                      <p className="text-[11px] text-red-600 font-mono font-bold">{item.nop || "-"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-800 font-semibold">{item.namaWp || "-"}</p>
                      <p className="text-[11px] text-slate-500">➔ {item.namaWpBaru || "-"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-800 truncate max-w-[200px]">{item.lokasiOp || "-"}</p>
                      <p className="text-[11px] text-slate-500">{item.kecamatanOp || "-"}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-900">
                      {formatRupiah(item.bphtb)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(item.statusBerkas, item.statusBayar)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        href={`/bphtb/berkas/${item.idBerkas}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition"
                      >
                        <Eye size={13} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  User,
  LogIn,
  Sparkles,
  ShieldCheck,
  Activity,
  FileText,
  Database,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import logoTapsel from "@/public/Logo-Tapsel.png";
import logoBpkpad from "@/public/bpkpad-logo.png";
import logoBpkpadLen from "@/public/bpkpad-len.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotif(null);

    if (!username.trim() || !password) {
      const msg = "Username / ID Pengguna dan Kata Sandi wajib diisi.";
      setNotif({ type: "error", message: msg });
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg =
          data.error ||
          "Kredensial tidak valid. Silakan periksa kembali username dan kata sandi Anda.";
        setNotif({ type: "error", message: errMsg });
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      }

      const successMsg = `Autentikasi berhasil! Selamat datang kembali, ${data.user?.nama || username}...`;
      setNotif({ type: "success", message: successMsg });
      toast.success(`Selamat datang kembali, ${data.user?.nama || username}!`);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch {
      const errMsg =
        "Gagal terhubung ke server jaringan. Silakan coba kembali.";
      setNotif({ type: "error", message: errMsg });
      toast.error(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between font-sans selection:bg-rose-600 selection:text-white overflow-x-hidden bg-[#17194f]">
      {/* GRADIENT BACKDROP & MESH GLOWS (Sesuai Warna Saat Ini: #17194f -> #481432 -> #8d1624) */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-[#17194f]/94 via-[#481432]/90 to-[#8d1624]/92 backdrop-blur-[2px]" />

      {/* AMBIENT AURORA LIGHTS */}
      <div className="fixed top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full bg-blue-500/15 blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-500/20 blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="fixed top-[40%] right-[30%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      {/* FLOATING AMBIENT PARTICLES */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-rose-400/40 blur-[1px] animate-float" />
        <div className="absolute top-2/3 left-1/3 w-2.5 h-2.5 rounded-full bg-indigo-300/40 blur-[1px] animate-float-slow" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-amber-400/50 blur-[1px] animate-float-reverse" />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-rose-300/30 blur-[1px] animate-float" />
      </div>

      {/* TOP HEADER BAR (SIPD STYLE) */}
      <header className="relative z-20 w-full border-b border-white/15 bg-black/30 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <Image
                src={logoTapsel}
                alt="Logo Tapanuli Selatan"
                width={34}
                height={34}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </div>
            <div className="h-9 flex items-center justify-center shrink-0">
              <Image
                src={logoBpkpadLen}
                alt="Logo BPKPAD Tapanuli Selatan"
                width={105}
                height={34}
                className="h-8 w-auto object-contain drop-shadow-md"
                priority
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white">
                BPHTB ONLINE
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-[10px] font-bold text-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SISTEM ONLINE
              </span>
            </div>
            <p className="text-[10px] text-rose-200/80 font-medium hidden sm:block">
              Badan Pengelolaan Keuangan, Pendapatan dan Aset Daerah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-white font-mono font-bold text-xs sm:text-sm">
              {mounted ? time.toLocaleTimeString("id-ID") : "\u00A0"}
            </p>
            <p className="text-[10px] sm:text-xs text-rose-200/80">
              {mounted
                ? time.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                : "\u00A0"}
            </p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ========================================================
              PANEL KIRI: SHOWCASE ANIMASI BERGERAK LOGO TAPSEL & BPKPAD
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">

            {/* JUDUL UTAMA */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
                BPHTB {" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
                  ONLINE
                </span>
              </h1>
              <p className="text-sm sm:text-base text-rose-100/85 max-w-xl font-medium leading-relaxed">
                Platform digital terpadu yang dirancang untuk mengotomatisasi seluruh siklus pemungutan
                dan pelayanan Pajak Bea Perolehan Hak atas Tanah dan Bangunan.
              </p>
            </div>

            {/* STAGE ANIMASI BERGERAK: LOGO BPKPAD */}
            <div className="w-full max-w-md py-4 sm:py-6 flex flex-col items-center justify-center relative">
              {/* STAGE CONTAINER WITH CONCENTRIC GLOWING TECH RINGS */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Outer Rotating Dashed Tech Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-rose-400/30 animate-spin-slow pointer-events-none" />

                {/* Middle Reverse Ring */}
                <div className="absolute inset-4 rounded-full border border-amber-300/25 animate-spin-reverse-slow pointer-events-none" />

                {/* Inner Breathing Pulse Rings */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-rose-500/25 via-indigo-500/15 to-transparent blur-md animate-pulse-ring pointer-events-none" />
                <div className="absolute inset-12 rounded-full bg-rose-400/15 blur-xl animate-pulse-glow pointer-events-none" />

                {/* Glassmorphic Center Orb */}
                <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl border border-white/25 shadow-[0_15px_35px_rgba(141,22,36,0.45)] flex items-center justify-center group">
                  {/* LOGO BPKPAD TANPA BACKGROUND PUTIH DENGAN ANIMASI FLOAT */}
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 animate-float drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src={logoBpkpad}
                      alt="Logo BPKPAD Tapanuli Selatan"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Satellite Orbit Dot */}
                  <div className="absolute -top-1 right-8 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#481432] shadow-md shadow-amber-400/80 animate-ping" />
                  <div className="absolute -top-1 right-8 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#481432] shadow-md shadow-amber-400/80" />
                </div>
              </div>
            </div>

            {/* 3 FEATURE CARDS HIGHLIGHT */}
            <div className="hidden sm:grid grid-cols-3 gap-3 w-full max-w-xl pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md hover:border-rose-400/50 transition">
                <div className="w-8 h-8 rounded-xl bg-rose-500/25 text-rose-300 flex items-center justify-center mb-2">
                  <FileText size={18} />
                </div>
                <h4 className="font-bold text-xs text-white">
                  Pendaftaran SSPD
                </h4>
                <p className="text-[10px] text-rose-200/70 mt-0.5">
                  Pengajuan & Hitung Otomatis
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md hover:border-sky-400/50 transition">
                <div className="w-8 h-8 rounded-xl bg-sky-500/25 text-sky-300 flex items-center justify-center mb-2">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="font-bold text-xs text-white">
                  Verifikasi Berjenjang
                </h4>
                <p className="text-[10px] text-sky-200/70 mt-0.5">
                  Validasi Petugas & Pejabat
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md hover:border-amber-400/50 transition">
                <div className="w-8 h-8 rounded-xl bg-amber-500/25 text-amber-300 flex items-center justify-center mb-2">
                  <Landmark size={18} />
                </div>
                <h4 className="font-bold text-xs text-white">
                  Integrasi PBB & Bank
                </h4>
                <p className="text-[10px] text-amber-200/70 mt-0.5">
                  Sinkronisasi NOP & Pembayaran
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              PANEL KANAN: FORM LOGIN SIPD ELEGANT GLASSMORPHISM
             ======================================================== */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-md relative">
              {/* Outer Decorative Gradient Border Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-b from-rose-500/45 via-purple-600/25 to-amber-500/35 rounded-3xl blur-md opacity-80 pointer-events-none" />

              {/* CARD CONTAINER */}
              <div className="relative rounded-3xl bg-[#160d29]/85 backdrop-blur-2xl border border-rose-400/30 p-7 sm:p-9 shadow-2xl space-y-6 text-left">
                {/* TOP BRAND ACCENT STRIPE */}
                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-indigo-400 via-rose-500 to-amber-400 shadow-sm" />
                {/* CARD TITLE & SIPD BADGE */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                      <Activity size={12} className="text-emerald-400" />
                      Server Aktif
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Masuk ke Sistem
                  </h2>
                  <p className="text-xs text-rose-100/75 mt-1">
                    Gunakan kredensial akun kedinasan Anda untuk mengakses data.
                  </p>
                </div>

                {/* NOTIFIKASI ERROR / SUKSES */}
                {notif && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 transition-all animate-fadeIn ${notif.type === "success"
                      ? "bg-emerald-950/90 border border-emerald-500/60 text-emerald-200"
                      : "bg-red-950/90 border border-red-500/60 text-red-200"
                      }`}
                  >
                    {notif.type === "success" ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400 shrink-0 mt-0.5"
                      />
                    ) : (
                      <AlertCircle
                        size={16}
                        className="text-red-400 shrink-0 mt-0.5"
                      />
                    )}
                    <span className="leading-relaxed">{notif.message}</span>
                  </div>
                )}

                {/* FORM INPUT LOGIN */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* INPUT USERNAME / NIP */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-200 mb-1.5">
                      Username / NIP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-600">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username atau ID pengguna"
                        className="w-full bg-slate-100/95 border border-white/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:bg-white transition"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* INPUT KATA SANDI */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-200">
                        Kata Sandi
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-600">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-100/95 border border-white/30 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:bg-white transition"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-rose-700 transition cursor-pointer"
                        title={
                          showPassword
                            ? "Sembunyikan sandi"
                            : "Tampilkan sandi"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* TOMBOL MASUK DENGAN EFEK SHINE & LOADING */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 text-white shadow-lg shadow-rose-950/80 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-rose-400/40"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Memverifikasi Kredensial...</span>
                      </>
                    ) : (
                      <>
                        <LogIn size={15} />
                        <span>Masuk ke Dashboard</span>
                      </>
                    )}
                  </button>
                </form>

                {/* STATUS INTEGRASI PBB */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-200/80">
                  <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <Database size={12} /> Terhubung Aplikasi PBB & SIMPATDA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER BAWAH PORTAL */}
      <footer className="relative z-20 w-full border-t border-white/15 bg-black/40 backdrop-blur-md px-4 sm:px-8 py-3.5 text-center sm:flex sm:items-center sm:justify-between text-xs text-rose-200/80">
        <p className="font-medium">
          &copy; 2026 Pemerintah Kabupaten Tapanuli Selatan. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

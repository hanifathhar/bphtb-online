"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Database,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import logoTapsel from "@/public/Logo-Tapsel.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Silakan masukkan username dan password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal masuk ke sistem");
        setLoading(false);
        return;
      }

      toast.success(`Selamat datang kembali, ${data.user.nama}!`);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi server");
      setLoading(false);
    }
  };

  const setDemoAccount = (u: string, p: string = "password123") => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-r from-[#17194f] via-[#481432] to-[#8d1624] px-4 py-8 overflow-hidden">
      {/* Background Subtle Highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md z-10 space-y-6">
        {/* Brand & Tapsel Logo Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-2xl shadow-black/40 w-24 h-24 mx-auto">
            <Image
              src={logoTapsel}
              alt="Logo Kabupaten Tapanuli Selatan"
              priority
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide drop-shadow-md">
              BPHTB Online
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-rose-200 uppercase">
              BPKPAD Kabupaten Tapanuli Selatan
            </p>
            <div className="h-0.5 w-20 bg-gradient-to-r from-rose-500 to-amber-400 mx-auto rounded-full mt-2" />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 text-white space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Username / ID Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/25 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Password / Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/25 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 shadow-lg shadow-rose-900/40 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 border border-rose-500/40 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* SISMIOP & Demo Account Selector */}
          <div className="pt-4 border-t border-white/15 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Database size={12} /> Terhubung Aplikasi PBB
              </span>
              <span className="text-slate-400"></span>
            </div>


          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-300 font-medium">
          © 2026 Pemerintah Kabupaten Tapanuli Selatan. All rights reserved.
        </p>
      </div>
    </div>
  );
}

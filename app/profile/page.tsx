"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  UserCircle,
  Shield,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const json = await res.json();
          setUser(json.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Password lama dan password baru wajib diisi");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal mengubah password");
        setSaving(false);
        return;
      }

      toast.success("Password Anda berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell active="profile">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-red-600 text-xs font-semibold mb-2">
            <UserCircle size={14} /> Profil & Akun
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Profil Pengguna & Keamanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Informasi akun personal dan pengaturan kata sandi sistem BPHTB Online.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-red-600/20">
                {user?.nama?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {user?.nama || "Pengguna"}
                </h3>
                <p className="text-xs text-red-600 font-semibold mt-0.5">
                  {user?.roleLabel || "Petugas BPHTB"}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  @{user?.username || "username"}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Email Terdaftar:</span>
                <span className="text-slate-800 font-mono">{user?.email || "-"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Tingkat Hak Akses (Level):</span>
                <span className="text-red-700 font-bold">Level {user?.level || 1}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Status Akun:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  Aktif & Terverifikasi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleChangePassword}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock size={18} className="text-red-600" />
                Ubah Kata Sandi (Password)
              </h3>
              <p className="text-xs text-slate-500">
                Pastikan Anda menggunakan kata sandi yang kuat dan aman.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Password Lama *
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Password Baru * (Min. 6 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Konfirmasi Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/20 active:scale-95 transition disabled:opacity-50"
              >
                {saving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Perbarui Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
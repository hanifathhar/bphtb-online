"use client";

import { Menu, LogOut, UserCircle, Bell, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header({
  onMenuClick,
  setSidebarOpen,
}: {
  onMenuClick?: () => void;
  setSidebarOpen?: (open: boolean) => void;
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }

        // Fetch pending count for notification badge
        const statRes = await fetch("/api/bphtb/stats");
        if (statRes.ok) {
          const statData = await statRes.json();
          setNotifCount(statData.pendingVerifikasi || 0);
        }
      } catch (error) {
        // ignore
      }
    };
    fetchUserAndStats();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs print:hidden">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-slate-600 hover:text-red-700 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 transition"
            onClick={() => {
              if (onMenuClick) onMenuClick();
              if (setSidebarOpen) setSidebarOpen(true);
            }}
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-800">BPHTB Online</span>
            <span>•</span>
            <span className="text-red-600 font-semibold">
              Sistem Pajak Bea Perolehan Hak atas Tanah dan Bangunan Kab. Tapanuli Selatan
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Link
            href="/bphtb/berkas"
            className="relative p-2 rounded-xl text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 transition"
            title="Monitoring Berkas"
          >
            <Bell size={18} />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                {notifCount}
              </span>
            )}
          </Link>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.nama || "User"}
                </p>
                <p className="text-[10px] text-red-700 font-semibold truncate max-w-[160px]">
                  {user?.roleLabel || "Petugas BPHTB"}
                </p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-red-600/20 shrink-0">
                {user?.nama?.charAt(0).toUpperCase() || "U"}
              </div>
            </button>

            {openDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  {/* Dropdown Header */}
                  <div className="bg-linear-to-r from-red-50 via-white to-red-50/40 p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg shrink-0 border border-red-200">
                        {user?.nama?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {user?.nama || "Administrator"}
                        </h4>
                        <p className="text-xs text-red-600 font-semibold truncate">
                          {user?.roleLabel || "Level " + (user?.level || 1)}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          @{user?.username || "user"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-[11px] font-medium text-slate-500 flex items-center justify-between border-b border-slate-100 mb-1">
                      <span>Status Akun</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Aktif
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setOpenDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 transition"
                    >
                      <UserCircle size={16} className="text-red-600" />
                      <span>Profil & Keamanan</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} />
                      <span>Keluar dari Sistem</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
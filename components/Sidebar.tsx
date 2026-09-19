"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logoTapsel from "@/public/Logo-Tapsel.png";
import {
  LayoutDashboard,
  FilePlus,
  Files,
  CheckSquare,
  ShieldCheck,
  Award,
  CreditCard,
  Building2,
  MapPin,
  FileCheck2,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  Receipt,
  FileBarChart2,
  CalendarCheck,
  BadgeAlert,
  Layers,
  X,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  active?: string;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bphtb: true,
    master: true,
    laporan: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Gagal ambil profil:", error);
      }
    };
    fetchUser();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    router.push("/login");
  };

  const level = user?.level || 1; // Default to admin if loading

  // Navigation Items
  const navStructure = [
    {
      type: "item",
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      levels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      type: "group",
      id: "bphtb",
      title: "PELAYANAN BPHTB",
      levels: [1, 2, 3, 4, 5, 6, 7],
      children: [
        {
          title: "Pendaftaran Berkas",
          icon: FilePlus,
          href: "/bphtb/pendaftaran",
          levels: [1, 2, 7], // Admin, Loket, PPAT
          badge: "Baru",
        },
        {
          title: "Semua Berkas BPHTB",
          icon: Files,
          href: "/bphtb/berkas",
          levels: [1, 2, 3, 4, 5, 6, 7],
        },
        {
          title: "Verifikasi 1 (Staf)",
          icon: CheckSquare,
          href: "/bphtb/verifikasi-1",
          levels: [1, 3], // Admin, Verif 1
        },
        {
          title: "Verifikasi 2 (Kasi)",
          icon: ShieldCheck,
          href: "/bphtb/verifikasi-2",
          levels: [1, 4], // Admin, Verif 2
        },
        {
          title: "Verifikasi 3 (Kabid)",
          icon: Award,
          href: "/bphtb/verifikasi-3",
          levels: [1, 5], // Admin, Verif 3
        },
        {
          title: "SKP & Kohir",
          icon: Receipt,
          href: "/bphtb/ketetapan",
          levels: [1, 3, 4, 5, 6, 7],
        },
        {
          title: "Pembayaran & SSPD",
          icon: CreditCard,
          href: "/bphtb/pembayaran",
          levels: [1, 6], // Admin, Bank/Kasir
        },
      ],
    },
    {
      type: "group",
      id: "master",
      title: "MASTER DATA",
      levels: [1], // Admin only
      children: [
        {
          title: "Kecamatan",
          icon: MapPin,
          href: "/master-data/kecamatan",
          levels: [1],
        },
        {
          title: "Desa / Kelurahan",
          icon: Building2,
          href: "/master-data/desa",
          levels: [1],
        },
        {
          title: "Jenis Transaksi",
          icon: Layers,
          href: "/master-data/jenis-transaksi",
          levels: [1],
        },
        {
          title: "Status Berkas",
          icon: BadgeAlert,
          href: "/master-data/status",
          levels: [1],
        },
        {
          title: "Keperluan",
          icon: FileCheck2,
          href: "/master-data/keperluan",
          levels: [1],
        },
        {
          title: "Pejabat Penandatangan",
          icon: Award,
          href: "/master-data/pejabat",
          levels: [1],
        },
        {
          title: "Pengguna & Hak Akses",
          icon: Users,
          href: "/master-data/pengguna",
          levels: [1],
        },
      ],
    },
    {
      type: "group",
      id: "laporan",
      title: "PELAPORAN & REKAP",
      levels: [1, 2, 3, 4, 5, 6, 7],
      children: [
        {
          title: "Rekap Pendaftaran",
          icon: CalendarCheck,
          href: "/laporan/pendaftaran",
          levels: [1, 2, 3, 4, 5],
        },
        {
          title: "Rekap Verifikasi",
          icon: CheckSquare,
          href: "/laporan/verifikasi",
          levels: [1, 3, 4, 5],
        },
        {
          title: "Rekap Ketetapan",
          icon: Receipt,
          href: "/laporan/ketetapan",
          levels: [1, 3, 4, 5, 6],
        },
        {
          title: "Rekap Pembayaran",
          icon: CreditCard,
          href: "/laporan/pembayaran",
          levels: [1, 5, 6],
        },
        {
          title: "Rekap Piutang",
          icon: BadgeAlert,
          href: "/laporan/piutang",
          levels: [1, 5, 6],
        },
        {
          title: "Cetak Laporan BPHTB",
          icon: FileBarChart2,
          href: "/laporan/cetak",
          levels: [1, 2, 3, 4, 5, 6, 7],
          badge: "Export",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white text-slate-800 border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } print:hidden shadow-lg`}
      >
        {/* Brand Header with Tapsel Logo */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-red-50/60 to-white">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-11 h-11 relative flex items-center justify-center shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src={logoTapsel}
                alt="Logo Tapanuli Selatan"
                width={40}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-wide block">
                BPHTB <span className="text-red-600">ONLINE</span>
              </span>
              <span className="text-[10px] font-semibold text-red-700/80 uppercase tracking-wider block">
                Kab. Tapanuli Selatan
              </span>
            </div>
          </Link>

          <button
            className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card Tag in Sidebar */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center border border-red-100 text-sm shrink-0">
              {user?.nama?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.nama || "Administrator"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-red-700 font-semibold truncate">
                  {user?.roleLabel || "Level " + level}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navStructure.map((nav, idx) => {
            if (nav.type === "item") {
              const Icon = nav.icon as any;
              const isActive = pathname === nav.href;
              const isAllowed = nav.levels.includes(level);
              if (!isAllowed) return null;

              return (
                <div key={idx}>
                  <Link
                    href={nav.href!}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${isActive
                        ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                        : "text-slate-600 hover:bg-red-50/70 hover:text-red-700"
                      }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-red-600 transition-colors"
                      }
                    />
                    <span>{nav.title}</span>
                  </Link>
                </div>
              );
            }

            if (nav.type === "group") {
              const isAllowed = nav.levels.includes(level);
              if (!isAllowed) return null;

              const visibleChildren = (nav.children || []).filter((child) =>
                child.levels.includes(level)
              );
              if (visibleChildren.length === 0) return null;

              const isOpen = openSections[nav.id || ""] !== false;

              return (
                <div key={idx} className="space-y-1">
                  <button
                    onClick={() => toggleSection(nav.id || "")}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-red-700 tracking-wider uppercase transition-colors"
                  >
                    <span>{nav.title}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {isOpen && (
                    <div className="space-y-0.5 pt-1 pl-1">
                      {visibleChildren.map((child, cIdx) => {
                        const ChildIcon = child.icon as any;
                        const isActive =
                          pathname === child.href ||
                          (child.href !== "/dashboard" &&
                            pathname.startsWith(child.href));

                        return (
                          <Link
                            key={cIdx}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${isActive
                                ? "bg-red-50 text-red-700 font-bold border border-red-200/80 shadow-xs"
                                : "text-slate-600 hover:bg-slate-50 hover:text-red-700"
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <ChildIcon
                                size={16}
                                className={
                                  isActive
                                    ? "text-red-600"
                                    : "text-slate-400 group-hover:text-red-600"
                                }
                              />
                              <span>{child.title}</span>
                            </div>

                            {child.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-bold uppercase">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100 transition"
          >
            <LogOut size={16} />
            <span>Keluar / Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
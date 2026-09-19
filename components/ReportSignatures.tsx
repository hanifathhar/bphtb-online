"use client";

import React, { useState, useEffect } from "react";

interface ReportSignaturesProps {
  tanggalCetak?: Date | string;
  kota?: string;
  leftTitle?: string;
  rightTitle?: string;
  className?: string;
}

export default function ReportSignatures({
  tanggalCetak = new Date(),
  kota: initialKota,
  leftTitle,
  rightTitle,
  className = "",
}: ReportSignaturesProps) {
  const [pejabatList, setPejabatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPejabat = async () => {
      try {
        const res = await fetch("/api/master/pejabat");
        if (res.ok) {
          const json = await res.json();
          setPejabatList(json.data || []);
        }
      } catch (e) {
        console.error("Gagal memuat data master pejabat:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPejabat();
  }, []);

  const kepalaBadan =
    pejabatList.find((p) => p.kode === "KEPALA_BADAN" && p.status === 1) ||
    pejabatList.find((p) => p.status === 1) || {
      nama: "M. FRANANDA, S.E, M.M",
      nip: "19800723 200312 1 002",
      jabatan: "Kepala Badan Pengelolaan Keuangan, Pendapatan dan Aset Daerah",
      pangkat: "Pembina Utama Muda (IV/c)",
      kota: "Sipirok",
    };

  const kabidPenetapan =
    pejabatList.find((p) => p.kode === "KABID_PENETAPAN" && p.status === 1) ||
    pejabatList.find((p) => p.id !== kepalaBadan.id && p.status === 1) || {
      nama: "AHMAD FAUZI, S.E.",
      nip: "19820515 200604 1 008",
      jabatan: "Kepala Bidang Pendapatan Daerah",
      pangkat: "Pembina (IV/a)",
      kota: "Sipirok",
    };

  const formattedDate = (d: Date | string) => {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const kotaName = initialKota || kabidPenetapan.kota || kepalaBadan.kota || "Sipirok";

  return (
    <div
      className={`hidden print:grid grid-cols-2 gap-8 pt-8 text-xs text-center text-slate-900 break-inside-avoid ${className}`}
    >
      {/* Pihak 1: Kiri (Kepala Badan) */}
      <div className="flex flex-col items-center justify-between min-h-[140px]">
        <div>
          <p className="text-slate-700">Mengetahui,</p>
          <p className="font-bold text-slate-900 uppercase">
            {leftTitle || kepalaBadan.jabatan || "Kepala Badan"}
          </p>
        </div>
        <div className="pt-16">
          <p className="font-bold underline uppercase text-slate-900">
            {kepalaBadan.nama}
          </p>
          {kepalaBadan.pangkat && (
            <p className="text-[11px] text-slate-600">{kepalaBadan.pangkat}</p>
          )}
          <p className="text-[11px] text-slate-700">NIP. {kepalaBadan.nip}</p>
        </div>
      </div>

      {/* Pihak 2: Kanan (Kabid / Pejabat Teknis) */}
      <div className="flex flex-col items-center justify-between min-h-[140px]">
        <div>
          <p className="text-slate-700">
            {kotaName}, {formattedDate(tanggalCetak)}
          </p>
          <p className="font-bold text-slate-900 uppercase">
            {rightTitle || kabidPenetapan.jabatan || "Kepala Bidang Pendapatan Daerah"}
          </p>
        </div>
        <div className="pt-16">
          <p className="font-bold underline uppercase text-slate-900">
            {kabidPenetapan.nama}
          </p>
          {kabidPenetapan.pangkat && (
            <p className="text-[11px] text-slate-600">{kabidPenetapan.pangkat}</p>
          )}
          <p className="text-[11px] text-slate-700">NIP. {kabidPenetapan.nip}</p>
        </div>
      </div>
    </div>
  );
}

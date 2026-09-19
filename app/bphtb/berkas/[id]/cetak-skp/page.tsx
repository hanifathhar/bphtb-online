"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, FileText, CheckCircle } from "lucide-react";
import SkpDocument from "@/components/SkpDocument";

export default function CetakSkpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [berkas, setBerkas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBerkas = async () => {
      try {
        const res = await fetch(`/api/bphtb/${id}`);
        if (res.ok) {
          const json = await res.json();
          setBerkas(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBerkas();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-md text-slate-700 text-sm font-semibold flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          Menyiapkan format cetak SKPD BPHTB...
        </div>
      </div>
    );
  }

  if (!berkas) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center space-y-3">
          <p className="text-red-600 font-bold">Berkas tidak ditemukan</p>
          <Link
            href="/bphtb/ketetapan"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
          >
            <ArrowLeft size={14} /> Kembali ke daftar ketetapan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/70 text-slate-900 py-6 px-2 sm:px-4 print:p-0 print:bg-white">
      {/* SCREEN CONTROL BAR (Hidden on print) */}
      <div className="no-print max-w-[210mm] mx-auto mb-6 bg-white border border-slate-300 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/bphtb/ketetapan`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Kembali ke Daftar Ketetapan"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Cetak SKPD & Kohir BPHTB</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono font-bold">
                {berkas.kdKohir || "KOHIR"}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Surat Ketetapan Bea Perolehan Hak Atas Tanah dan Bangunan (BPHTB)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/bphtb/berkas/${id}/cetak`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileText size={15} />
            <span>Cetak SSPD</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-600/30 transition cursor-pointer"
          >
            <Printer size={16} />
            <span>Cetak SKP (PDF)</span>
          </button>
        </div>
      </div>

      {/* PRINT PREVIEW CONTAINER */}
      <div className="print-area max-w-[210mm] mx-auto print:m-0 print:p-0 print:max-w-none print:w-full">
        <SkpDocument berkas={berkas} />
      </div>

      {/* GLOBAL PRINT STYLES FOR EXACT A4 FIT */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 10px;
          }
          .no-print {
            display: none !important;
          }
          .skp-sheet {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

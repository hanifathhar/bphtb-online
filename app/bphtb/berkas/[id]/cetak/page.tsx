"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Layers, CheckCircle } from "lucide-react";
import SspdDocument from "@/components/SspdDocument";


const LEMBAR_OPTIONS = [
  { id: 0, label: "Semua Lembar (1 - 6)", name: "Semua Peruntukan" },
  { id: 1, label: "Lembar 1 (Untuk Arsip Wajib Pajak)", name: "Arsip Wajib Pajak" },
  { id: 2, label: "Lembar 2 (Untuk PPAT/Notaris)", name: "PPAT / Notaris" },
  { id: 3, label: "Lembar 3 (Untuk Kepala BPN)", name: "Kepala BPN" },
  { id: 4, label: "Lembar 4 (Untuk Kepala BPKPAD)", name: "Kepala BPKPAD" },
  { id: 5, label: "Lembar 5 (Untuk Bendahara Penerimaan)", name: "Bendahara Penerimaan" },
  { id: 6, label: "Lembar 6 (Untuk Bank Penerima)", name: "Bank Penerima" },
];

export default function CetakSspdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [berkas, setBerkas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLembar, setSelectedLembar] = useState<number>(1);

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
          Menyiapkan format dokumen cetak SSPD...
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
            href="/bphtb/berkas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
          >
            <ArrowLeft size={14} /> Kembali ke daftar berkas
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
            href={`/bphtb/berkas/${id}`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Kembali ke Detail Berkas"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Cetak Dokumen SSPD BPHTB</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono font-bold">
                {berkas.noBerkas}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Format resmi Surat Setoran Pajak Daerah Kabupaten Tapanuli Selatan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Select Lembar */}
          <div className="flex items-center gap-1.5 text-xs">
            <Layers size={14} className="text-slate-500" />
            <select
              value={selectedLembar}
              onChange={(e) => setSelectedLembar(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
            >
              {LEMBAR_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Button Print */}
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 active:scale-95 transition"
          >
            <Printer size={15} /> Cetak / Print PDF
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="max-w-[210mm] mx-auto space-y-6 print:m-0 print:p-0 print:max-w-none print:w-full">
        {selectedLembar === 0 ? (
          // Cetak Semua Lembar 1 - 6
          LEMBAR_OPTIONS.filter((o) => o.id > 0).map((opt, idx) => (
            <div
              key={opt.id}
              className={idx > 0 ? "print:break-before-page pt-4 print:pt-0" : ""}
            >
              <SspdDocument
                berkas={berkas}
                copyNumber={opt.id}
                copyName={opt.name}
              />
            </div>
          ))
        ) : (
          // Cetak Lembar Terpilih
          <SspdDocument
            berkas={berkas}
            copyNumber={selectedLembar}
            copyName={
              LEMBAR_OPTIONS.find((o) => o.id === selectedLembar)?.name
            }
          />
        )}
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
          .sspd-print-container {
            border: 1px solid #000000 !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

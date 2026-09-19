"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoTapsel from "@/public/Logo-Tapsel.png";
import { formatRupiahNumber, terbilang } from "@/lib/sspd";

interface SkpDocumentProps {
  berkas: any;
  pejabat?: {
    nama: string;
    nip: string;
    jabatan: string;
    kota?: string;
  };
}

export default function SkpDocument({ berkas, pejabat: initialPejabat }: SkpDocumentProps) {
  const [pejabat, setPejabat] = useState<any>(initialPejabat || null);

  useEffect(() => {
    if (!initialPejabat) {
      const fetchPejabat = async () => {
        try {
          const res = await fetch("/api/master/pejabat");
          if (res.ok) {
            const json = await res.json();
            const list = json.data || [];
            // Find active KEPALA_BADAN
            const kepala = list.find(
              (p: any) => p.kode === "KEPALA_BADAN" && p.status === 1
            ) || list.find((p: any) => p.status === 1) || list[0];
            if (kepala) {
              setPejabat(kepala);
            }
          }
        } catch (e) {
          console.error("Gagal load pejabat:", e);
        }
      };
      fetchPejabat();
    }
  }, [initialPejabat]);

  if (!berkas) return null;

  const tahun = berkas.tahun || new Date().getFullYear().toString();
  const bphtb = Number(berkas.bphtb || 0);
  const namaWp = berkas.namaWpBaru || berkas.namaWp || "-";
  const alamatWp = berkas.alamatWpBaru || berkas.alamatWp || "-";
  const npwpWp = berkas.npwpWpBaru || berkas.npwpWp || "-";
  const terbilangText = terbilang(bphtb);

  // Signatory details
  const namaPejabat = pejabat?.nama || "M. FRANANDA, S.E, M.M";
  const nipPejabat = pejabat?.nip || "19800723 200312 1 002";
  const jabatanPejabat =
    pejabat?.jabatan ||
    "KEPALA BADAN PENGELOLAAN KEUANGAN, PENDAPATAN DAN ASET DAERAH SELAKU PEJABAT PENGELOLA KEUANGAN DAERAH";
  const kotaPejabat = pejabat?.kota || "Sipirok";

  // Parse Kd Kohir: extract digits e.g. "90111" from "90111/2026" or format id
  let kohirDigits = ["9", "0", "0", "0", "1"];
  if (berkas.kdKohir) {
    const rawKohir = String(berkas.kdKohir).split("/")[0].replace(/\D/g, "");
    if (rawKohir.length > 0) {
      kohirDigits = rawKohir.padStart(5, "0").split("");
    }
  } else {
    const seq = String(berkas.idBerkas || 1).padStart(4, "0");
    kohirDigits = `9${seq}`.split("");
  }

  // Tgl Ketetapan / Tgl SKP
  const tglSkpDate = berkas.tglSkp ? new Date(berkas.tglSkp) : new Date();
  const formattedTglSkp = tglSkpDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Tgl Jatuh Tempo (31 hari dari penetapan)
  const tglTempoDate = berkas.tglTempo
    ? new Date(berkas.tglTempo)
    : new Date(tglSkpDate.getTime() + 31 * 24 * 60 * 60 * 1000);
  const formattedTglTempo = tglTempoDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");

  const isSkpdkbDoc = berkas?.keterangan?.includes("[SKPDKB]") || berkas?.jenisKetetapan === "SKPDKB";

  return (
    <div className="skp-sheet bg-white text-black font-sans text-[11px] leading-tight p-2 sm:p-4 max-w-[210mm] mx-auto shadow-xl print:shadow-none print:m-0 print:w-full print:p-0 print:text-black">
      {/* 1. HEADER SECTION (Table-based 3 Column Layout) */}
      <table className="w-full border-collapse border-t-2 border-x-2 border-b border-black text-black">
        <tbody>
          <tr>
            {/* Logo & Government Agency Info */}
            <td className="w-[30%] border-r border-black p-2 text-center align-middle">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-12 h-13 mb-1">
                  <Image
                    src={logoTapsel}
                    alt="Logo Tapanuli Selatan"
                    width={48}
                    height={52}
                    className="object-contain h-12 w-auto mx-auto"
                    priority
                  />
                </div>
                <p className="text-[9.5px] font-bold uppercase tracking-tight leading-tight">
                  PEMERINTAH KABUPATEN<br />
                  TAPANULI SELATAN
                </p>
                <p className="text-[9px] font-bold uppercase mt-0.5">
                  ( B P K P A D )
                </p>
                <p className="text-[8px] leading-tight mt-0.5 text-black">
                  Komplek Perkantoran Bupati<br />
                  Tapanuli Selatan<br />
                  Kilang Papan - Sipirok
                </p>
              </div>
            </td>

            {/* Document Title */}
            <td className="w-[48%] border-r border-black p-2.5 text-center align-middle">
              <h1 className="text-[12px] font-black uppercase tracking-wide leading-snug">
                {isSkpdkbDoc ? (
                  <>
                    SURAT KETETAPAN PAJAK DAERAH<br />
                    KURANG BAYAR (SKPDKB)<br />
                    BEA PEROLEHAN HAK ATAS TANAH & BANGUNAN
                  </>
                ) : (
                  <>
                    SURAT KETETAPAN BEA PEROLEHAN<br />
                    HAK ATAS TANAH DAN BANGUNAN<br />
                    (BPHTB)
                  </>
                )}
              </h1>
              <p className="text-[11px] font-black uppercase mt-1">
                TAHUN {tahun}
              </p>
            </td>

            {/* No. Kohir Box */}
            <td className="w-[22%] p-2 text-center align-middle">
              <p className="text-[9.5px] font-bold uppercase tracking-wider mb-1.5">NO. KOHIR</p>
              <div className="inline-flex border border-black">
                {kohirDigits.map((digit, idx) => (
                  <div
                    key={idx}
                    className="w-4.5 h-6 border-r last:border-r-0 border-black flex items-center justify-center font-mono font-bold text-xs bg-white"
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2. WAJIB PAJAK DETAIL SECTION */}
      <table className="w-full border-collapse border-x-2 border-b border-black text-[10.5px] leading-normal">
        <tbody>
          <tr>
            <td className="p-2.5">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-32 font-semibold pb-0.5">Nama Wajib Pajak</td>
                    <td className="w-4 text-center font-bold pb-0.5">:</td>
                    <td className="font-bold uppercase pb-0.5">{namaWp}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pb-0.5">Alamat</td>
                    <td className="text-center font-bold pb-0.5">:</td>
                    <td className="uppercase pb-0.5">{alamatWp}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pb-0.5">N.P.W.P</td>
                    <td className="text-center font-bold pb-0.5">:</td>
                    <td className="font-mono pb-0.5">{npwpWp || "-"}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pb-0.5">Jenis Pajak</td>
                    <td className="text-center font-bold pb-0.5">:</td>
                    <td className="pb-0.5">Bea Perolehan Hak Atas Tanah dan Bangunan</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Jenis Kegiatan</td>
                    <td className="text-center font-bold">:</td>
                    <td>Perolehan BPHTB Atas Jual Beli Tanah</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3. TABLE KETETAPAN PAJAK */}
      <table className="w-full border-collapse border-x-2 border-b border-black text-[10.5px]">
        <thead>
          <tr className="border-b border-black text-center font-bold bg-white text-[10px]">
            <th className="border-r border-black py-1 px-2 w-12">No.</th>
            <th className="border-r border-black py-1 px-2 w-28">Ayat</th>
            <th className="border-r border-black py-1 px-3">Jenis Pajak Daerah</th>
            <th className="py-1 px-3 w-40 text-right">Jumlah (Rp.)</th>
          </tr>
        </thead>
        <tbody>
          {isSkpdkbDoc ? (
            <>
              <tr className="border-b border-black">
                <td className="border-r border-black py-1.5 px-2 text-center font-bold align-middle">1</td>
                <td className="border-r border-black py-1.5 px-2 text-center font-mono font-bold align-middle">4111301</td>
                <td className="border-r border-black py-1.5 px-3 align-middle font-medium">
                  Pokok Pajak BPHTB Kurang Bayar (SKPDKB)
                </td>
                <td className="py-1.5 px-3 text-right font-mono font-bold align-middle">
                  {formatRupiahNumber(bphtb)},00
                </td>
              </tr>
            </>
          ) : (
            <tr className="border-b border-black">
              <td className="border-r border-black py-2 px-2 text-center font-bold align-middle">1</td>
              <td className="border-r border-black py-2 px-2 text-center font-mono font-bold align-middle">4111301</td>
              <td className="border-r border-black py-2 px-3 align-middle font-medium">
                Bea Perolehan Hak Atas Tanah dan Bangunan
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold align-middle">
                {formatRupiahNumber(bphtb)},00
              </td>
            </tr>
          )}
          {/* Subtotal Row */}
          <tr className="border-b border-black font-bold">
            <td colSpan={3} className="border-r border-black py-1.5 px-3 text-right text-[10px] uppercase">
              {isSkpdkbDoc ? "Jumlah Total Ketetapan Kurang Bayar (Rp.)" : "Jumlah Total Ketetapan Pajak (Rp.)"}
            </td>
            <td className="py-1.5 px-3 text-right font-mono">
              {formatRupiahNumber(bphtb)},00
            </td>
          </tr>
          {/* Terbilang Row */}
          <tr className="border-b border-black text-[10px]">
            <td className="border-r border-black py-1 px-2 font-bold text-center">
              Dengan Huruf
            </td>
            <td colSpan={3} className="py-1 px-3 italic font-medium lowercase first-letter:capitalize">
              {terbilangText}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. PERHATIAN & SIGNATURE SECTION */}
      <div className="border-x-2 border-b border-black p-3 space-y-3">
        {/* PERHATIAN NOTICE */}
        <div className="space-y-1 text-[9.5px] leading-relaxed text-justify">
          <p className="font-bold underline uppercase mb-0.5">PERHATIAN :</p>
          <table className="w-full text-[9.5px]">
            <tbody>
              <tr>
                <td className="w-5 align-top font-semibold">1.)</td>
                <td className="align-top pb-0.5">
                  Harap Disetor ke kas umum daerah <strong>(Bank Sumut Cab. Sipirok AC. No. 233.01-02.000001-4)</strong> dengan menggunakan SSPD.
                </td>
              </tr>
              <tr>
                <td className="w-5 align-top font-semibold">2.)</td>
                <td className="align-top pb-0.5">
                  Surat Ketetapan ini dinyatakan <strong>LUNAS</strong> dengan menggunakan surat setoran pajak daerah yang telah di sahkan/validasi kas register Bank yang telah di tunjuk.
                </td>
              </tr>
              <tr>
                <td className="w-5 align-top font-semibold">3.)</td>
                <td className="align-top pb-0.5">
                  Masa pajak adalah <strong>31 hari kalender</strong> sejak SKPD di terbitkan sesuai perda No. 16 Tahun 2010. Jatuh tempo pajak adalah <strong>{formattedTglTempo}</strong>
                </td>
              </tr>
              <tr>
                <td className="w-5 align-top font-semibold">4.)</td>
                <td className="align-top">
                  Pembayaran melewati tanggal jatuh tempo di kenakan sangsi Administratif <strong>2%</strong> setiap bulan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN KEPALA BADAN (DINAMIS DARI MODEL MS_PEJABAT) */}
        <div className="flex justify-end pt-1">
          <div className="w-80 text-center text-xs space-y-0.5">
            <p className="text-[10.5px] mb-0.5">{kotaPejabat}, {formattedTglSkp}</p>
            <p className="font-bold uppercase text-[9.5px] leading-tight">
              {jabatanPejabat}
            </p>
            <div className="h-12" />
            <p className="font-bold underline uppercase tracking-wide text-[10.5px]">
              {namaPejabat}
            </p>
            <p className="text-[9.5px] font-mono text-black font-medium">
              NIP. {nipPejabat}
            </p>
          </div>
        </div>
      </div>

      {/* 5. FOOTER RECEIPT STRIP */}
      <div className="border-x-2 border-b-2 border-black p-2 text-center text-[8.5px] italic text-black leading-snug">
        Ruang untuk teraan kas register/tanda tangan/cap bendahara khusus penerima (BPKP)<br />
        Badan Pengelola Keuangan, Pendapatan dan Aset Daerah Kab. Tapanuli Selatan
      </div>
    </div>
  );
}


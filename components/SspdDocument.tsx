"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoTapsel from "@/public/Logo-Tapsel.png";
import { formatRupiah, formatRupiahNumber, terbilang, formatNoSts, getJenisTransaksiLabel } from "@/lib/sspd";

interface SspdDocumentProps {
  berkas: any;
  copyNumber?: number;
  copyName?: string;
  pejabat?: any;
}

export default function SspdDocument({
  berkas,
  copyNumber,
  copyName,
  pejabat: initialPejabat,
}: SspdDocumentProps) {
  const [pejabat, setPejabat] = useState<any>(initialPejabat || null);

  useEffect(() => {
    if (!initialPejabat) {
      const fetchPejabat = async () => {
        try {
          const res = await fetch("/api/master/pejabat");
          if (res.ok) {
            const json = await res.json();
            const list = json.data || [];
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

  // Values calculation & formatting
  const luasBumi = Number(berkas.luasBumi || 0);
  const luasBangunan = Number(berkas.luasBangunan || 0);
  const njopBumi = Number(berkas.njopBumi || 0);
  const njopBangunan = Number(berkas.njopBangunan || 0);
  const totalNjopBumi = Number(berkas.totalNjopBumi || luasBumi * njopBumi);
  const totalNjopBangunan = Number(berkas.totalNjopBangunan || luasBangunan * njopBangunan);
  const totalNjop = Number(berkas.nilaiPbb || totalNjopBumi + totalNjopBangunan);

  const nilaiTransaksi = Number(berkas.nilaiTransaksi || 0);
  const npop = Number(berkas.npop || Math.max(nilaiTransaksi, totalNjop));
  const npoptkp = Number(berkas.npoptkp || 0);
  const npopkp = Number(berkas.npopkp || Math.max(0, npop - npoptkp));
  const bphtb = Number(berkas.bphtb || 0);

  // Wajib Pajak (Penerima Hak / Pembeli)
  const namaWp = berkas.namaWpBaru || berkas.namaWp || "-";
  const npwpWp = berkas.npwpWpBaru || berkas.npwpWp || "-";
  const alamatWp = berkas.alamatWpBaru || berkas.alamatWp || "-";
  const kelurahanWp = berkas.kelurahanWpBaru || berkas.kelurahanWp || "-";
  const kecamatanWp = berkas.kecamatanWpBaru || berkas.kecamatanWp || "-";
  const kotaWp = berkas.kotaWpBaru || berkas.kotaWp || "TAPANULI SELATAN";
  const kodePosWp = berkas.kodePosWpBaru || berkas.kodePosWp || "00000";

  // Objek Pajak
  const nop = berkas.nop || "-";
  const lokasiOp = berkas.lokasiOp || "-";
  const kelurahanOp = berkas.kelurahanOp || "-";
  const rtOp = berkas.rtOp || "000";
  const rwOp = berkas.rwOp || "00";
  const kecamatanOp = berkas.kecamatanOp || "-";
  const kotaOp = berkas.kotaOp || "TAPANULI SELATAN";

  const jenisTransaksiName = getJenisTransaksiLabel(berkas.jnsTransaksi);
  const terbilangText = terbilang(bphtb);

  // Signatory: explicitly prioritize Kepala Badan from ms_pejabat model
  const namaPejabatBpKpad =
    pejabat?.nama ||
    "M. FRANANDA, S.E, M.M";

  // No STS format: 2964111301 + [tahun 4 digit] + 09 + [no urut 4 digit]
  const noStsFormatted = berkas.noSts
    ? formatNoSts(berkas.idBerkas, berkas.tahun, berkas.noSts)
    : ".............................................";

  return (
    <div className="sspd-print-container bg-white text-black text-[11px] leading-[1.3] font-sans mx-auto p-4 border border-black max-w-[210mm] shadow-md print:shadow-none print:p-0 print:border-black print:max-w-none print:w-full">
      {/* HEADER SECTION (3 Columns) */}
      <div className="border border-black grid grid-cols-12">
        {/* Kolom 1: Pemerintah & Logo */}
        <div className="col-span-4 border-r border-black p-2 flex flex-col items-center justify-between text-center">
          <p className="font-bold text-[10px] tracking-tight">
            PEMERINTAH KABUPATEN TAPANULI SELATAN
          </p>
          <div className="my-1.5 flex items-center justify-center">
            <Image
              src={logoTapsel}
              alt="Logo Tapanuli Selatan"
              width={54}
              height={58}
              className="object-contain h-[54px] w-auto"
              priority
            />
          </div>
          <p className="font-bold text-[9px] leading-tight uppercase">
            BADAN PENGELOLAAN KEUANGAN, PENDAPATAN DAN ASET DAERAH
          </p>
        </div>

        {/* Kolom 2: Judul SSPD */}
        <div className="col-span-5 border-r border-black flex flex-col justify-between text-center">
          <div className="p-2 flex-1 flex flex-col items-center justify-center">
            <h1 className="font-bold text-[11.5px] uppercase">
              SURAT SETORAN PAJAK DAERAH
            </h1>
            <h2 className="font-bold text-[10px] uppercase">
              BEA PEROLEHAN HAK ATAS TANAH DAN BANGUNAN
            </h2>
            <h3 className="font-extrabold text-[13px] tracking-wide mt-0.5">
              (SSPD - BPHTB)
            </h3>
          </div>
          <div className="border-t border-black p-1 bg-white">
            <p className="font-bold text-[8.5px] leading-tight uppercase">
              BERFUNGSI SEBAGAI SURAT PEMBERITAHUAN OBJEK PAJAK PAJAK BUMI DAN BANGUNAN (SPOP PBB)
            </p>
          </div>
        </div>

        {/* Kolom 3: Lembar Peruntukan */}
        <div className="col-span-3 p-1.5 text-[8.5px] leading-[1.35] flex flex-col justify-between">
          <div>
            <p className="font-bold underline mb-0.5">Lembar :</p>
            <ol className="list-none pl-0 space-y-0.5">
              <li className={copyNumber === 1 ? "font-bold" : ""}>1. Untuk Arsip Wajib Pajak.</li>
              <li className={copyNumber === 2 ? "font-bold" : ""}>2. Untuk PPAT/Notaris.</li>
              <li className={copyNumber === 3 ? "font-bold" : ""}>3. Untuk Kepala BPN</li>
              <li className={copyNumber === 4 ? "font-bold" : ""}>4. Untuk Kepala BPKPAD</li>
              <li className={copyNumber === 5 ? "font-bold" : ""}>5. Untuk Bendahara Penerimaan</li>
              <li className={copyNumber === 6 ? "font-bold" : ""}>6. Untuk Bank Penerima</li>
            </ol>
          </div>
          {copyName && (
            <p className="font-bold italic text-right text-[8px] mt-1">
              [{copyName}]
            </p>
          )}
        </div>
      </div>

      {/* KAS DAERAH NOTICE */}
      <div className="border-x border-b border-black px-2 py-1 text-[9.5px] font-semibold">
        Kepada Kas Umum Daerah Kabupaten Tapanuli Selatan AC. 233.01.02.000001-4 pada PT. Bank Sumut Cabang Sipirok
      </div>

      {/* PERHATIAN */}
      <div className="border-x border-b border-black px-2 py-0.5 text-[9px] font-semibold">
        PERHATIAN : Bacalah Petunjuk Pengisian Pada Halaman Belakang Lembar ini Terlebih Dahulu.
      </div>

      {/* SEKSI A: WAJIB PAJAK */}
      <div className="border-x border-b border-black px-2 py-1.5">
        <p className="font-bold text-[10.5px] mb-1">A. Wajib Pajak</p>
        <div className="grid grid-cols-12 gap-y-0.5 text-[10px]">
          <div className="col-span-3 font-semibold">1. Nama Wajib Pajak</div>
          <div className="col-span-9 font-bold uppercase">: {namaWp}</div>

          <div className="col-span-3 font-semibold">2. NPWP</div>
          <div className="col-span-9 font-mono">: {npwpWp}</div>

          <div className="col-span-3 font-semibold">3. Alamat Wajib Pajak</div>
          <div className="col-span-9 uppercase">: {alamatWp}</div>

          <div className="col-span-3 font-semibold">4. Kelurahan/Desa</div>
          <div className="col-span-3 uppercase">: {kelurahanWp}</div>
          <div className="col-span-2 font-semibold text-right pr-2">5. Kecamatan</div>
          <div className="col-span-4 uppercase">: {kecamatanWp}</div>

          <div className="col-span-3 font-semibold">6. Kabupaten/Kota</div>
          <div className="col-span-3 uppercase">: {kotaWp}</div>
          <div className="col-span-2 font-semibold text-right pr-2">7. Kode Pos</div>
          <div className="col-span-4 font-mono">: {kodePosWp}</div>
        </div>
      </div>

      {/* SEKSI B: OBJEK PAJAK */}
      <div className="border-x border-b border-black px-2 py-1.5">
        <p className="font-bold text-[10.5px] mb-1">B. Objek Pajak</p>
        <div className="grid grid-cols-12 gap-y-0.5 text-[10px] mb-1.5">
          <div className="col-span-4 font-semibold">1. Nomor Objek Pajak (NOP) PBB</div>
          <div className="col-span-8 font-mono font-bold">: {nop}</div>

          <div className="col-span-4 font-semibold">2. Letak Tanah dan atau Bangunan</div>
          <div className="col-span-8 uppercase">: {lokasiOp}</div>

          <div className="col-span-4 font-semibold">3. Kelurahan/Desa</div>
          <div className="col-span-3 uppercase">: {kelurahanOp}</div>
          <div className="col-span-2 font-semibold text-right pr-2">4. RT/RW</div>
          <div className="col-span-3 font-mono">: {rtOp}/{rwOp}</div>

          <div className="col-span-4 font-semibold">5. Kecamatan</div>
          <div className="col-span-3 uppercase">: {kecamatanOp}</div>
          <div className="col-span-2 font-semibold text-right pr-2">6. Kabupaten/Kota</div>
          <div className="col-span-3 uppercase">: {kotaOp}</div>
        </div>

        {/* TABEL PERHITUNGAN TANAH & BANGUNAN */}
        <table className="w-full border-collapse border border-black text-[9.5px] text-center mb-1.5">
          <thead>
            <tr className="bg-gray-50 print:bg-transparent">
              <th className="border border-black p-1 w-[22%] font-bold">Uraian</th>
              <th className="border border-black p-1 w-[26%] font-semibold">
                Luas<br />
                <span className="font-normal italic text-[8.5px]">(Diisi luas tanah dan atau bangunan yang haknya diperoleh)</span>
              </th>
              <th className="border border-black p-1 w-[28%] font-semibold">
                NJOP PBB/M²<br />
                <span className="font-normal italic text-[8.5px]">(Diisi berdasarkan SPPT PBB tahun terjadinya perolehan hak/tahun...)</span>
              </th>
              <th className="border border-black p-1 w-[24%] font-bold">
                LUAS x NJOP PBB/M²
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1 text-left font-semibold">Tanah (Bumi)</td>
              <td className="border border-black p-1 font-mono">{luasBumi ? `${formatRupiahNumber(luasBumi)}/M²` : "-"}</td>
              <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(njopBumi)}</td>
              <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(totalNjopBumi)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-left font-semibold">Bangunan</td>
              <td className="border border-black p-1 font-mono">{luasBangunan ? `${formatRupiahNumber(luasBangunan)}/M²` : "-"}</td>
              <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(njopBangunan)}</td>
              <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(totalNjopBangunan)}</td>
            </tr>
            <tr>
              <td className="border-t border-black p-1" colSpan={2}></td>
              <td className="border border-black p-1 text-right font-bold pr-2 bg-gray-50 print:bg-transparent">
                NJOP PBB :
              </td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-2 bg-gray-50 print:bg-transparent">
                {formatRupiah(totalNjop)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Info Tambahan Objek */}
        <div className="grid grid-cols-12 gap-y-0.5 text-[10px]">
          <div className="col-span-5 font-semibold">8. Jenis Perolehan hak atas tanah dan atau bangunan :</div>
          <div className="col-span-7 font-bold uppercase">{jenisTransaksiName}</div>

          <div className="col-span-5 font-semibold">9. Harga Transaksi/Pasar :</div>
          <div className="col-span-7 font-mono font-bold">{formatRupiah(nilaiTransaksi)}</div>

          <div className="col-span-5 font-semibold">10. Nomor Sertifikat :</div>
          <div className="col-span-7 font-mono uppercase">{berkas.scanSertifikat || "-"}</div>
        </div>
      </div>

      {/* SEKSI C: PERHITUNGAN BPHTB */}
      <div className="border-x border-b border-black px-2 py-1.5">
        <p className="font-bold text-[10.5px] mb-1">
          C. Perhitungan BPHTB <span className="font-normal italic text-[9px]">(Hanya diisi berdasarkan perhitungan Wajib Pajak)</span>
        </p>
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between items-center">
            <span>1. Nilai Perolehan Objek Pajak (NPOP)</span>
            <span className="font-mono font-semibold">{formatRupiah(npop)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>2. Nilai Perolehan Objek Pajak Tidak Kena Pajak (NPOPTKP)</span>
            <span className="font-mono font-semibold">{formatRupiah(npoptkp)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>3. Nilai Perolehan Objek Pajak Kena Pajak (NPOPKP)</span>
            <span className="font-mono font-semibold">{formatRupiah(npopkp)}</span>
          </div>
          <div className="flex justify-between items-center font-bold">
            <span>4. Bea Perolehan Hak atas tanah dan bangunan yang terutang</span>
            <span className="font-mono">{formatRupiah(bphtb)}</span>
          </div>
        </div>
      </div>

      {/* SEKSI D: JUMLAH SETORAN BERDASARKAN */}
      <div className="border-x border-b border-black px-2 py-1.5 text-[10px]">
        <p className="font-bold text-[10.5px] mb-0.5">D. Jumlah Setoran Berdasarkan</p>
        <div className="grid grid-cols-12 gap-y-0.5">
          <div className="col-span-12 font-semibold">1. Perhitungan Wajib Pajak</div>

          <div className="col-span-6 font-semibold">
            2. STPD BPHTB/SKPDB KURANG BAYAR/ SKPDB KURANG BAYAR TAMBAHAN *)
          </div>
          <div className="col-span-3 text-[9.5px]">
            Nomor : {berkas.kdKohir || "..................."}
          </div>
          <div className="col-span-3 text-[9.5px]">
            Tanggal : {berkas.tglSkp ? new Date(berkas.tglSkp).toLocaleDateString("id-ID") : "............."}
          </div>

          <div className="col-span-12">
            3. Pengurangan dihitung sendiri menjadi [ &nbsp; ]% Berdasarkan Peraturan KDH No. : .......................
          </div>
          <div className="col-span-12">
            4. ........................
          </div>
        </div>
      </div>

      {/* SEKSI JUMLAH YANG DISETOR */}
      <div className="border-x border-b border-black p-2 grid grid-cols-12 items-center bg-gray-50 print:bg-transparent">
        <div className="col-span-5 border-r border-black pr-2">
          <p className="font-bold text-[10.5px] uppercase">JUMLAH YANG DISETOR <span className="font-normal italic text-[9px]">(dengan angka)</span></p>
          <p className="font-mono font-black text-[13px] mt-0.5">{formatRupiah(bphtb)}</p>
        </div>
        <div className="col-span-7 pl-3">
          <p className="font-semibold italic text-[9px]">(dengan huruf)</p>
          <p className="font-bold italic text-[10.5px] mt-0.5">{terbilangText}</p>
        </div>
      </div>

      {/* SEKSI TANDA TANGAN (4 Kolom) */}
      <div className="border-x border-b border-black grid grid-cols-4 text-center text-[9px]">
        {/* Kolom 1: Wajib Pajak */}
        <div className="border-r border-black p-2 flex flex-col justify-between min-h-[110px]">
          <p className="font-bold uppercase">WAJIB PAJAK BPHTB</p>
          <div className="mt-auto">
            <p className="font-bold uppercase underline">({namaWp})</p>
            <p className="text-[8px] text-gray-700">Nama & Tanda Tangan</p>
          </div>
        </div>

        {/* Kolom 2: PPAT / Notaris */}
        <div className="border-r border-black p-2 flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="font-bold">MENGETAHUI :</p>
            <p className="font-bold">PPAT/NOTARIS</p>
          </div>
          <div className="mt-auto">
            <p className="font-bold uppercase underline">
              {berkas.ppat ? `(${berkas.ppat})` : "(Nama & Tanda Tangan)"}
            </p>
            <p className="text-[8px] text-gray-700">Nama & Tanda Tangan</p>
          </div>
        </div>

        {/* Kolom 3: Tempat Pembayaran */}
        <div className="border-r border-black p-2 flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="font-bold">DITERIMA OLEH :</p>
            <p className="font-bold">TEMPAT PEMBAYARAN BPHTB</p>
          </div>
          <div className="mt-auto">
            <p className="font-bold uppercase underline">( ........................................ )</p>
            <p className="text-[8px] text-gray-700">Nama & Tanda Tangan</p>
          </div>
        </div>

        {/* Kolom 4: Verifikasi BPKPAD */}
        <div className="p-2 flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="italic text-[8.5px]">Telah di Verifikasi</p>
            <p className="font-bold leading-tight text-[8px] uppercase">
              BADAN PENGELOLAAN KEUANGAN, PENDAPATAN DAN ASET DAERAH
            </p>
          </div>
          <div className="mt-auto">
            <p className="font-bold uppercase underline text-[8.5px]">
              ({namaPejabatBpKpad})
            </p>
            <p className="text-[8px] text-gray-700">Nama & Tanda Tangan</p>
          </div>
        </div>
      </div>

      {/* FOOTER: BPKPAD & NO STS */}
      <div className="border-x border-b border-black grid grid-cols-12">
        <div className="col-span-4 p-2 border-r border-black text-[9px] font-semibold flex items-center">
          Hanya diisi Oleh<br />Petugas BPKPAD
        </div>
        <div className="col-span-8 p-0">
          <div className="border-b border-black px-2 py-1.5 flex items-center justify-between">
            <span className="font-bold text-[10px]">Nomor STS/NTPD</span>
            <span className="font-mono font-black text-[13px] tracking-wider">
              : {noStsFormatted}
            </span>
          </div>
          <div className="px-2 py-1 flex items-center justify-between text-[10px]">
            <span className="font-bold">NOP PBB Baru</span>
            <span className="font-mono">: ....................................................</span>
          </div>
        </div>
      </div>
    </div>
  );
}

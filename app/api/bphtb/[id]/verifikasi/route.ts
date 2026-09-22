export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { formatNoSts, formatKdKohir } from "@/lib/sspd";
import { kirimKetetapanKeSimpatda, hapusKetetapanDariSimpatda } from "@/lib/simpatda";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { tahap, status, catatan } = await req.json(); // tahap: 1 | 2 | 3, status: 1 (Setuju) | 2 (Tolak)

    const berkasId = parseInt(id);
    const existing = await prisma.tblBphtb.findUnique({
      where: { idBerkas: berkasId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    const now = new Date();
    const isBatal = status === 0 || status === "batal" || status === "0";
    const verifStatus = isBatal ? 0 : parseInt(status); // 0 = Batal, 1 = Disetujui, 2 = Ditolak

    if (tahap === 1) {
      // Verifikasi 1: Pemeriksa Administrasi / Lapangan
      if (isBatal) {
        updateData.verif1 = 0;
        updateData.userVerif1 = null;
        updateData.tglVerif1 = null;
        updateData.ketVerif1 = catatan || "Verifikasi 1 dibatalkan";
        updateData.statusBerkas = 1;
      } else {
        updateData.verif1 = verifStatus;
        updateData.userVerif1 = user.username || user.nama;
        updateData.tglVerif1 = now;
        updateData.ketVerif1 = catatan || (verifStatus === 1 ? "Disetujui oleh Verifikator 1" : "Ditolak / Perlu Perbaikan");
        updateData.statusBerkas = verifStatus === 1 ? 2 : 9;
      }
    } else if (tahap === 2) {
      // Verifikasi 2: Kasie Teknis
      if (isBatal) {
        updateData.verif2 = 0;
        updateData.userVerif2 = null;
        updateData.tglVerif2 = null;
        updateData.ketVerif2 = catatan || "Verifikasi 2 dibatalkan";
        updateData.statusBerkas = 2;
      } else {
        updateData.verif2 = verifStatus;
        updateData.userVerif2 = user.username || user.nama;
        updateData.tglVerif2 = now;
        updateData.ketVerif2 = catatan || (verifStatus === 1 ? "Disetujui oleh Verifikator 2" : "Ditolak / Perlu Perbaikan");
        updateData.statusBerkas = verifStatus === 1 ? 3 : 9;
      }
    } else if (tahap === 3) {
      // Verifikasi 3: Kabid Penetapan
      if (isBatal) {
        if (existing.statusBayar === 1) {
          return NextResponse.json(
            { error: "Verifikasi tidak dapat dibatalkan karena berkas ini sudah berstatus LUNAS / dibayar." },
            { status: 400 }
          );
        }
        updateData.verif3 = 0;
        updateData.userVerif3 = null;
        updateData.tglVerif3 = null;
        updateData.ketVerif3 = catatan || "Verifikasi Kabid dibatalkan / dikembalikan ke tahap verifikasi 3";
        updateData.statusBerkas = 3; // Kembali ke antrean Verifikasi 3
        updateData.kdKohir = null;
        updateData.noSts = null;
        updateData.tglSkp = null;
        updateData.tglTempo = null;

        // Hapus dari dbsimpatda jika sebelumnya sudah diterbitkan
        if (existing.noSts) {
          await hapusKetetapanDariSimpatda(existing.noSts);
        }
      } else if (verifStatus === 1) {
        updateData.verif3 = 1;
        updateData.userVerif3 = user.username || user.nama;
        updateData.tglVerif3 = now;
        const year = (existing.tahun || now.getFullYear().toString()).slice(0, 4);

        // Format kd_kohir: 9 + [no urut 4 digit] + / + [tahun 4 digit] (e.g. 90001/2026)
        updateData.kdKohir = formatKdKohir(berkasId, year);

        // Format no_sts: 12964111301 + [tahun 4 digit] + 09 + [no urut 4 digit] (e.g. 129641113012026090001)
        updateData.noSts = formatNoSts(berkasId, year);

        updateData.tglSkp = now;

        // Jatuh tempo 30 hari ke depan
        const tempo = new Date();
        tempo.setDate(tempo.getDate() + 30);
        updateData.tglTempo = tempo;

        const isNihil = Number(existing.bphtb || 0) <= 0;

        if (isNihil) {
          // Jika nilai BPHTB adalah 0 (Nihil), otomatis berstatus Lunas / Bebas Pajak
          updateData.statusBayar = 1;
          updateData.statusBerkas = 5; // Lunas (SKP Terbit Nihil)
          updateData.tglBayar = now;
          updateData.bankBayar = "Nihil / Bebas Pajak";
          updateData.noBuktiBayar = `NIHIL-${updateData.kdKohir || berkasId}`;
          updateData.nilaiSudahDibayar = 0;
          updateData.nilaiBelumDibayar = 0;
        } else {
          updateData.statusBerkas = 4; // SKP Terbit & Siap Bayar
          updateData.statusBayar = 0;
          updateData.nilaiBelumDibayar = existing.bphtb;
        }
      } else {
        updateData.verif3 = 2;
        updateData.userVerif3 = user.username || user.nama;
        updateData.tglVerif3 = now;
        updateData.ketVerif3 = catatan || "Ditolak / Perlu Perbaikan";
        updateData.statusBerkas = 9; // Ditolak
      }
    } else {
      return NextResponse.json({ error: "Tahap verifikasi tidak valid" }, { status: 400 });
    }

    const updated = await prisma.tblBphtb.update({
      where: { idBerkas: berkasId },
      data: updateData,
    });

    // Jika verifikasi 3 disetujui dan SKP terbit, kirim data ke dbsimpatda (tr_tetap & skp_bphtb)
    if (tahap === 3 && verifStatus === 1 && updated.kdKohir && updated.noSts) {
      await kirimKetetapanKeSimpatda({
        kdKohir: updated.kdKohir,
        tglSkp: updated.tglSkp || now,
        noSts: updated.noSts,
        bphtb: updated.bphtb,
        nilaiBelumDibayar: updated.nilaiBelumDibayar ?? updated.bphtb,
        keterangan: updated.keterangan,
        nop: updated.nop,
        namaWpBaru: updated.namaWpBaru,
        namaWp: updated.namaWp,
        alamatWpBaru: updated.alamatWpBaru,
        alamatWp: updated.alamatWp,
        lokasiOp: updated.lokasiOp,
        npwpWpBaru: updated.npwpWpBaru,
        npwpWp: updated.npwpWp,
        tglTempo: updated.tglTempo,
        tahun: updated.tahun,
        username: user.username || user.nama,
        tglUpdate: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Verifikasi tahap ${tahap} berhasil diproses`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Verifikasi error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

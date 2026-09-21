export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { sinkronStatusBayarDariSimpatda } from "@/lib/simpatda";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let berkas = await prisma.tblBphtb.findUnique({
      where: { idBerkas: parseInt(id) },
    });

    if (!berkas) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
    }

    // Auto-sync status pembayaran dengan SIMPATDA jika berkas sudah memiliki STS
    if (berkas.noSts && (berkas.statusBerkas === 4 || berkas.statusBerkas === 5)) {
      try {
        const syncRes = await sinkronStatusBayarDariSimpatda(berkas.noSts);
        if (syncRes.updatedToLunas > 0 || syncRes.updatedToBelumBayar > 0) {
          berkas = await prisma.tblBphtb.findUnique({
            where: { idBerkas: parseInt(id) },
          });
        }
      } catch (syncErr) {
        console.warn("[SIMPATDA AUTO-SYNC] Gagal sync saat get detail:", syncErr);
      }
    }

    return NextResponse.json({ success: true, data: berkas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const luasBumi = parseFloat(body.luasBumi || 0);
    const luasBangunan = parseFloat(body.luasBangunan || 0);
    const njopBumi = parseFloat(body.njopBumi || 0);
    const njopBangunan = parseFloat(body.njopBangunan || 0);

    const totalNjopBumi = luasBumi * njopBumi;
    const totalNjopBangunan = luasBangunan * njopBangunan;
    const nilaiPbb = totalNjopBumi + totalNjopBangunan;

    const nilaiTransaksi = parseFloat(body.nilaiTransaksi || 0);
    const npop = Math.max(nilaiTransaksi, nilaiPbb);
    const npoptkp = parseFloat(body.npoptkp || 0);
    const npopkp = Math.max(0, npop - npoptkp);
    const tarif = parseFloat(body.tarif || 5.0);

    const isSkpdkb = body.jenisKetetapan === "SKPDKB" || (body.keterangan && String(body.keterangan).includes("[SKPDKB]"));
    const nilaiKurangBayar = parseFloat(body.nilaiKurangBayar || 0);
    const dendaKurangBayar = parseFloat(body.dendaKurangBayar || 0);
    const bphtb = isSkpdkb && (nilaiKurangBayar > 0 || dendaKurangBayar > 0)
      ? (nilaiKurangBayar + dendaKurangBayar)
      : ((npopkp * tarif) / 100);

    let finalKeterangan = body.keterangan || "";
    if (body.jenisKetetapan === "SKPDKB" && !finalKeterangan.includes("[SKPDKB]")) {
      const skpdkbInfo = `[SKPDKB] Pokok Kurang Bayar: Rp ${new Intl.NumberFormat("id-ID").format(nilaiKurangBayar)}, Sanksi Denda/Bunga: Rp ${new Intl.NumberFormat("id-ID").format(dendaKurangBayar)}${body.alasanKurangBayar ? ` (${body.alasanKurangBayar})` : ""}`;
      finalKeterangan = finalKeterangan ? `${skpdkbInfo} - ${finalKeterangan}` : skpdkbInfo;
    }

    const existing = await prisma.tblBphtb.findUnique({
      where: { idBerkas: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
    }

    const cleanNop = body.nop !== undefined 
      ? (body.nop ? String(body.nop).replace(/\D/g, "") : null)
      : existing.nop;

    const updatePayload: any = {
      nop: cleanNop,
      namaWp: body.namaWp,
      nikWp: body.nikWp,
      alamatWp: body.alamatWp,
      kelurahanWp: body.kelurahanWp,
      kecamatanWp: body.kecamatanWp,
      kotaWp: body.kotaWp,
      npwpWp: body.npwpWp,
      telpWp: body.telpWp,

      lokasiOp: body.lokasiOp,
      kelurahanOp: body.kelurahanOp,
      kecamatanOp: body.kecamatanOp,
      kotaOp: body.kotaOp,
      luasBumi,
      luasBangunan,
      njopBumi,
      njopBangunan,
      totalNjopBumi,
      totalNjopBangunan,
      nilaiPbb,

      namaWpBaru: body.namaWpBaru,
      nikWpBaru: body.nikWpBaru,
      alamatWpBaru: body.alamatWpBaru,
      kelurahanWpBaru: body.kelurahanWpBaru,
      kecamatanWpBaru: body.kecamatanWpBaru,
      kotaWpBaru: body.kotaWpBaru,
      npwpWpBaru: body.npwpWpBaru,
      telpWpBaru: body.telpWpBaru,

      keterangan: finalKeterangan,
      jnsTransaksi: body.jnsTransaksi ? String(body.jnsTransaksi) : "1",
      nilaiTransaksi,
      npop,
      npoptkp,
      npopkp,
      tarif,
      bphtb,
      nilaiSudahDibayar: existing.statusBayar === 1 ? bphtb : 0,
      nilaiBelumDibayar: existing.statusBayar === 1 ? 0 : bphtb,

      scanPernyataan: body.scanPernyataan,
      scanKtp: body.scanKtp,
      fotoObjek: body.fotoObjek,
      scanNpwp: body.scanNpwp,
      scanSertifikat: body.scanSertifikat,
      scanPbb: body.scanPbb,

      ppat: body.ppat,
    };

    // If berkas was rejected (status 9) or resubmit requested, reset verification and set to status 1
    if (existing.statusBerkas === 9 || body.resubmit === true || body.statusBerkas) {
      updatePayload.statusBerkas = body.statusBerkas || 1;
      updatePayload.verif1 = 0;
      updatePayload.verif2 = 0;
      updatePayload.verif3 = 0;
      updatePayload.userVerif1 = null;
      updatePayload.userVerif2 = null;
      updatePayload.userVerif3 = null;
      updatePayload.tglVerif1 = null;
      updatePayload.tglVerif2 = null;
      updatePayload.tglVerif3 = null;
      updatePayload.kdKohir = null;
      updatePayload.noSts = null;
      updatePayload.tglSkp = null;
      updatePayload.tglTempo = null;
    }

    const updated = await prisma.tblBphtb.update({
      where: { idBerkas: parseInt(id) },
      data: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated, message: "Data berkas berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const berkasId = parseInt(id);

    const existing = await prisma.tblBphtb.findUnique({
      where: { idBerkas: berkasId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
    }

    if (existing.statusBayar === 1) {
      return NextResponse.json(
        { error: "Berkas yang telah lunas/dibayar tidak dapat dihapus." },
        { status: 400 }
      );
    }

    // Admin (level 1), Loket (level 2), PPAT (level 7), or Verifikator can delete rejected (status 9) or draft (status 0) berkas
    const isAdmin = user.level === 1;
    const isRejectedOrDraft = existing.statusBerkas === 9 || existing.statusBerkas === 0;

    if (!isAdmin && !isRejectedOrDraft) {
      return NextResponse.json(
        { error: "Hanya berkas ditolak atau draft yang dapat dihapus oleh staf/pengguna." },
        { status: 403 }
      );
    }

    await prisma.tblBphtb.delete({
      where: { idBerkas: berkasId },
    });

    return NextResponse.json({ success: true, message: "Berkas berhasil dihapus secara permanen" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

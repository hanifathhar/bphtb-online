export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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
    const berkasId = parseInt(id);

    const existing = await prisma.tblBphtb.findUnique({
      where: { idBerkas: berkasId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
    }

    if (existing.statusBayar !== 1) {
      return NextResponse.json(
        { error: "Berkas ini belum berstatus lunas / tidak ada transaksi pembayaran yang dapat dibatalkan." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const alasan = body.alasan || "Pembayaran dibatalkan.";

    const logInfo = `[Batal Bayar oleh ${user.nama || user.username}]: ${alasan}`;
    const newKeterangan = existing.keterangan ? `${existing.keterangan}\n${logInfo}` : logInfo;

    const bphtbNominal = existing.bphtb ? Number(existing.bphtb) : 0;

    const updated = await prisma.tblBphtb.update({
      where: { idBerkas: berkasId },
      data: {
        statusBayar: 0, // Belum Bayar
        statusBerkas: 4, // Kembali ke status SKP Terbit / Siap Bayar
        tglBayar: null,
        bankBayar: null,
        noBuktiBayar: null,
        nilaiSudahDibayar: 0,
        nilaiBelumDibayar: bphtbNominal,
        keterangan: newKeterangan,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil dibatalkan. Status berkas kembali ke Siap Bayar (Belum Lunas).",
      data: updated,
    });
  } catch (error: any) {
    console.error("Batal Bayar error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

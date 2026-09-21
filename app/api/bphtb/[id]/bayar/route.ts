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
    const { bankBayar, noBuktiBayar, tglBayar, nilaiBayar } = await req.json();

    const berkasId = parseInt(id);
    const existing = await prisma.tblBphtb.findUnique({
      where: { idBerkas: berkasId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
    }

    const totalTagihan = existing.bphtb ? Number(existing.bphtb) : 0;
    const bayar = parseFloat(
      nilaiBayar !== undefined && nilaiBayar !== null && String(nilaiBayar).trim() !== ""
        ? nilaiBayar
        : totalTagihan
    );
    const sisaBelumDibayar = Math.max(0, totalTagihan - bayar);

    let now: Date;
    if (tglBayar) {
      if (typeof tglBayar === "string" && /^\d{4}-\d{2}-\d{2}$/.test(tglBayar)) {
        now = new Date(`${tglBayar}T12:00:00Z`);
      } else {
        now = new Date(tglBayar);
      }
    } else {
      now = new Date();
    }

    const updated = await prisma.tblBphtb.update({
      where: { idBerkas: berkasId },
      data: {
        statusBayar: 1, // Lunas
        statusBerkas: 5, // Status Lunas
        tglBayar: now,
        bankBayar: bankBayar || "Bank Persepsi / Mitra Kasir",
        noBuktiBayar: noBuktiBayar || `TRX-${Date.now()}`,
        nilaiSudahDibayar: bayar,
        nilaiBelumDibayar: sisaBelumDibayar,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pembayaran BPHTB berhasil dikonfirmasi. Status berkas Lunas.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Pembayaran error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

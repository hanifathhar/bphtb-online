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

    const bayar = parseFloat(nilaiBayar || existing.bphtb || 0);
    const now = tglBayar ? new Date(tglBayar) : new Date();

    const updated = await prisma.tblBphtb.update({
      where: { idBerkas: berkasId },
      data: {
        statusBayar: 1, // Lunas
        statusBerkas: 5, // Status Lunas
        tglBayar: now,
        bankBayar: bankBayar || "Bank BPD / Mitra Kasir",
        noBuktiBayar: noBuktiBayar || `TRX-${Date.now()}`,
        nilaiSudahDibayar: bayar,
        nilaiBelumDibayar: 0,
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

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

    if (existing.statusBayar === 1) {
      return NextResponse.json(
        { error: "Berkas yang telah lunas/dibayar tidak dapat di-rollback." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetStatus = body.targetStatus || 1; // Default to 1 (Kembali ke Verifikasi 1)
    const catatan = body.catatan || "Berkas di-rollback dan diajukan kembali untuk verifikasi.";

    const updated = await prisma.tblBphtb.update({
      where: { idBerkas: berkasId },
      data: {
        statusBerkas: targetStatus,
        verif1: targetStatus >= 2 ? existing.verif1 : 0,
        verif2: targetStatus >= 3 ? existing.verif2 : 0,
        verif3: 0,
        userVerif3: null,
        tglVerif3: null,
        ketVerif3: null,
        kdKohir: null,
        noSts: null,
        tglSkp: null,
        tglTempo: null,
        keterangan: existing.keterangan ? `${existing.keterangan}\n[Rollback oleh ${user.nama || user.username}]: ${catatan}` : catatan,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berkas berhasil di-rollback dan dimasukkan kembali ke antrean verifikasi.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

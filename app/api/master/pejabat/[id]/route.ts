export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.level !== 1) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { kode, nama, nip, jabatan, pangkat, kota, status } = body;

    const updated = await prisma.msPejabat.update({
      where: { id: parseInt(id) },
      data: {
        ...(kode && { kode: String(kode).toUpperCase().trim() }),
        ...(nama && { nama: String(nama).trim() }),
        ...(nip && { nip: String(nip).trim() }),
        ...(jabatan && { jabatan: String(jabatan).trim() }),
        pangkat: pangkat !== undefined ? (pangkat ? String(pangkat).trim() : null) : undefined,
        kota: kota !== undefined ? (kota ? String(kota).trim() : "Sipirok") : undefined,
        status: status !== undefined ? parseInt(status) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
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
    if (!user || user.level !== 1) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.msPejabat.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: "Pejabat berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

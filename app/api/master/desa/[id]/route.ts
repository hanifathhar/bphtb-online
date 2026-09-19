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
    const { kelurahanDesa, idKecamatan } = await req.json();

    const updated = await prisma.tblDesa.update({
      where: { id: parseInt(id) },
      data: {
        kelurahanDesa,
        idKecamatan,
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
    await prisma.tblDesa.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: "Desa/Kelurahan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const list = await prisma.tblKecamatan.findMany({
      orderBy: { idKecamatan: "asc" },
      include: {
        _count: {
          select: { desas: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.level !== 1) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
    }

    const { idKecamatan, kecamatan, idKabKota } = await req.json();

    if (!idKecamatan || !kecamatan) {
      return NextResponse.json({ error: "Kode dan Nama Kecamatan wajib diisi" }, { status: 400 });
    }

    const created = await prisma.tblKecamatan.create({
      data: {
        idKecamatan,
        kecamatan,
        idKabKota: idKabKota || "3201",
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

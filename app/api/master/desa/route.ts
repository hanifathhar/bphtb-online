export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idKecamatan = searchParams.get("idKecamatan");

    const whereClause = idKecamatan ? { idKecamatan } : {};

    const list = await prisma.tblDesa.findMany({
      where: whereClause,
      include: {
        kecamatan: true,
      },
      orderBy: { idDesa: "asc" },
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

    const { idDesa, idKecamatan, kelurahanDesa } = await req.json();

    if (!idDesa || !idKecamatan || !kelurahanDesa) {
      return NextResponse.json(
        { error: "Kode Desa, Kecamatan, dan Nama Kelurahan/Desa wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.tblDesa.create({
      data: {
        idDesa,
        idKecamatan,
        kelurahanDesa,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

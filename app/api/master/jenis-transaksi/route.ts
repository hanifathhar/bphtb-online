export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const list = await prisma.msTransaksi.findMany({
      orderBy: { jnsTransaksi: "asc" },
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

    const { jnsTransaksi, keterangan, nopptkp, tarif } = await req.json();

    const created = await prisma.msTransaksi.create({
      data: {
        jnsTransaksi: parseInt(jnsTransaksi),
        keterangan,
        nopptkp: parseFloat(nopptkp || 0),
        tarif: parseFloat(tarif || 5.0),
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

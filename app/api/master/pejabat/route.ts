export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    // Seed initial default pejabat if empty
    const count = await prisma.msPejabat.count();
    if (count === 0) {
      await prisma.msPejabat.createMany({
        data: [
          {
            kode: "KEPALA_BADAN",
            nama: "M. FRANANDA, S.E, M.M",
            nip: "19800723 200312 1 002",
            jabatan: "KEPALA BADAN PENGELOLAAN KEUANGAN, PENDAPATAN DAN ASET DAERAH SELAKU PEJABAT PENGELOLA KEUANGAN DAERAH",
            pangkat: "Pembina Utama Muda (IV/c)",
            kota: "Sipirok",
            status: 1,
          },
          {
            kode: "KABID_PENETAPAN",
            nama: "AHMAD FAUZI, S.E.",
            nip: "19820515 200604 1 008",
            jabatan: "KEPALA BIDANG PENDAPATAN DAERAH",
            pangkat: "Pembina (IV/a)",
            kota: "Sipirok",
            status: 1,
          },
        ],
      });
    }

    const list = await prisma.msPejabat.findMany({
      orderBy: { id: "asc" },
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

    const body = await req.json();
    const { kode, nama, nip, jabatan, pangkat, kota, status } = body;

    if (!kode || !nama || !nip || !jabatan) {
      return NextResponse.json({ error: "Kode, Nama, NIP, dan Jabatan wajib diisi" }, { status: 400 });
    }

    const created = await prisma.msPejabat.create({
      data: {
        kode: String(kode).toUpperCase().trim(),
        nama: String(nama).trim(),
        nip: String(nip).trim(),
        jabatan: String(jabatan).trim(),
        pangkat: pangkat ? String(pangkat).trim() : null,
        kota: kota ? String(kota).trim() : "Sipirok",
        status: status !== undefined ? parseInt(status) : 1,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

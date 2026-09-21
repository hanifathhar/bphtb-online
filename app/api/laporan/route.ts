export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jenis = searchParams.get("jenis") || "semua";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const tahun = searchParams.get("tahun");
    const kecamatan = searchParams.get("kecamatan");
    const statusBayar = searchParams.get("statusBayar");
    const ppat = searchParams.get("ppat");

    const q = searchParams.get("q") || "";

    const where: any = {};

    if (q) {
      where.OR = [
        { noBerkas: { contains: q, mode: "insensitive" } },
        { nop: { contains: q, mode: "insensitive" } },
        { namaWp: { contains: q, mode: "insensitive" } },
        { namaWpBaru: { contains: q, mode: "insensitive" } },
        { kdKohir: { contains: q, mode: "insensitive" } },
        { noSts: { contains: q, mode: "insensitive" } },
      ];
    }

    const bulanAwal = searchParams.get("bulanAwal");
    const bulanAkhir = searchParams.get("bulanAkhir");

    if (startDate && endDate) {
      where.tglBerkas = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else if (bulanAwal && bulanAkhir && tahun) {
      const bAwal = parseInt(bulanAwal);
      const bAkhir = parseInt(bulanAkhir);
      const y = parseInt(tahun);
      const start = new Date(y, bAwal - 1, 1, 0, 0, 0);
      const end = new Date(y, bAkhir, 0, 23, 59, 59, 999);
      where.tglBerkas = {
        gte: start,
        lte: end,
      };
    }

    if (tahun) {
      where.tahun = tahun;
    }

    if (kecamatan) {
      where.kecamatanOp = { contains: kecamatan, mode: "insensitive" };
    }

    if (ppat) {
      where.ppat = { contains: ppat, mode: "insensitive" };
    }

    // Specific report type filters
    if (jenis === "pendaftaran") {
      // All registrations
    } else if (jenis === "verifikasi") {
      // In verification pipeline or completed verification
      where.statusBerkas = { in: [1, 2, 3, 4, 5, 9] };
    } else if (jenis === "ketetapan") {
      // Must have SKP / Kohir
      where.statusBerkas = { in: [4, 5] };
    } else if (jenis === "pembayaran") {
      // Transaksi yang telah ditetapkan SKP & Pembayaran (Siap Bayar atau Lunas)
      where.statusBerkas = { in: [4, 5] };
    } else if (jenis === "piutang") {
      // SKP terbit tapi belum bayar
      where.statusBayar = 0;
      where.statusBerkas = { in: [4, 1, 2, 3] };
    }

    if (statusBayar !== null && statusBayar !== undefined && statusBayar !== "") {
      where.statusBayar = parseInt(statusBayar);
    }

    const [data, masterTransaksi] = await Promise.all([
      prisma.tblBphtb.findMany({
        where,
        orderBy: { idBerkas: "asc" },
      }),
      prisma.msTransaksi.findMany(),
    ]);

    const transaksiMap = new Map();
    masterTransaksi.forEach((t) => transaksiMap.set(String(t.jnsTransaksi), t.keterangan));

    // Compute summary totals
    let totalNpop = 0;
    let totalNpoptkp = 0;
    let totalNpopkp = 0;
    let totalBphtb = 0;
    let totalSudahBayar = 0;
    let totalBelumBayar = 0;

    const enrichedData = data.map((item) => {
      const npopVal = Number(item.npop || 0);
      const npoptkpVal = Number(item.npoptkp || 0);
      const npopkpVal = Number(item.npopkp || 0);
      const bphtbVal = Number(item.bphtb || 0);

      totalNpop += npopVal;
      totalNpoptkp += npoptkpVal;
      totalNpopkp += npopkpVal;
      totalBphtb += bphtbVal;
      totalSudahBayar += Number(item.nilaiSudahDibayar || 0);
      totalBelumBayar += Number(item.nilaiBelumDibayar || (item.statusBayar === 0 ? item.bphtb : 0));

      const jenisPerolehan =
        transaksiMap.get(String(item.jnsTransaksi)) ||
        item.keterangan ||
        "Jual Beli";

      return {
        ...item,
        jenisPerolehan,
      };
    });

    return NextResponse.json({
      success: true,
      jenis,
      count: enrichedData.length,
      summary: {
        totalNpop,
        totalNpoptkp,
        totalNpopkp,
        totalBphtb,
        totalSudahBayar,
        totalBelumBayar,
      },
      data: enrichedData,
    });
  } catch (error: any) {
    console.error("Laporan API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

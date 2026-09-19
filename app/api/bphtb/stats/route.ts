export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterTahun = searchParams.get("tahun"); // Bisa 'all' atau tahun spesifik misal '2026'

    const currentYear = new Date().getFullYear().toString();
    const activeYear = filterTahun === "all" ? undefined : (filterTahun || currentYear);

    // Ambil daftar distinct tahun yang ada di database untuk opsi dropdown filter
    const distinctYearsRecords = await prisma.tblBphtb.findMany({
      select: { tahun: true },
      distinct: ["tahun"],
      orderBy: { tahun: "desc" },
    });
    const availableYears = distinctYearsRecords
      .map((r) => r.tahun)
      .filter((t): t is string => !!t);

    const whereClause = activeYear ? { tahun: activeYear } : {};

    const [
      totalBerkas,
      verif1Pending,
      verif2Pending,
      verif3Pending,
      skpTerbit,
      lunas,
      ditolak,
      allBphtb,
    ] = await Promise.all([
      prisma.tblBphtb.count({ where: whereClause }),
      prisma.tblBphtb.count({ where: { ...whereClause, statusBerkas: 1 } }),
      prisma.tblBphtb.count({ where: { ...whereClause, statusBerkas: 2 } }),
      prisma.tblBphtb.count({ where: { ...whereClause, statusBerkas: 3 } }),
      prisma.tblBphtb.count({ where: { ...whereClause, statusBerkas: 4 } }),
      prisma.tblBphtb.count({ where: { ...whereClause, statusBerkas: 5 } }),
      prisma.tblBphtb.count({ where: { ...whereClause, statusBerkas: 9 } }),
      prisma.tblBphtb.findMany({
        where: whereClause,
        select: {
          bphtb: true,
          nilaiSudahDibayar: true,
          nilaiBelumDibayar: true,
          statusBayar: true,
          kecamatanOp: true,
          tglBerkas: true,
        },
      }),
    ]);

    let totalKetetapan = 0;
    let totalRealisasi = 0;
    let totalPiutang = 0;

    const kecamatanMap: Record<string, number> = {};

    allBphtb.forEach((b) => {
      const nominal = Number(b.bphtb || 0);
      const sudahBayar = Number(b.nilaiSudahDibayar || 0);
      const belumBayar = Number(b.nilaiBelumDibayar || 0);

      totalKetetapan += nominal;
      totalRealisasi += sudahBayar;
      if (b.statusBayar === 0) {
        totalPiutang += belumBayar > 0 ? belumBayar : nominal;
      }

      const kec = b.kecamatanOp || "Lainnya";
      kecamatanMap[kec] = (kecamatanMap[kec] || 0) + (sudahBayar > 0 ? sudahBayar : nominal);
    });

    const kecamatanStats = Object.entries(kecamatanMap).map(([name, total]) => ({
      name,
      total,
    }));


    // Hitung Tren 5 Tahun Terakhir (e.g. 2022 - 2026 atau 5 tahun terakhir dari data/sistem)
    const currentYearNum = parseInt(currentYear, 10) || new Date().getFullYear();
    const startYearNum = currentYearNum - 4; // 5 tahun terakhir
    const yearsList: string[] = [];
    for (let y = startYearNum; y <= currentYearNum; y++) {
      yearsList.push(y.toString());
    }

    const trendGroups = await prisma.tblBphtb.groupBy({
      by: ["tahun"],
      where: {
        tahun: {
          in: yearsList,
        },
      },
      _count: { idBerkas: true },
      _sum: {
        bphtb: true,
        nilaiSudahDibayar: true,
        nilaiBelumDibayar: true,
      },
      orderBy: { tahun: "asc" },
    });

    const trendMap = new Map<string, any>();
    trendGroups.forEach((g) => {
      if (g.tahun) {
        trendMap.set(g.tahun, g);
      }
    });

    const trend5Tahun = yearsList.map((thn) => {
      const g = trendMap.get(thn);
      const penetapan = g?._sum?.bphtb ? Number(g._sum.bphtb) : 0;
      const realisasi = g?._sum?.nilaiSudahDibayar ? Number(g._sum.nilaiSudahDibayar) : 0;
      const piutang = g?._sum?.nilaiBelumDibayar ? Number(g._sum.nilaiBelumDibayar) : 0;
      const totalBerkas = g?._count?.idBerkas ? Number(g._count.idBerkas) : 0;
      const persentase = penetapan > 0 ? Number(((realisasi / penetapan) * 100).toFixed(1)) : 0;

      return {
        tahun: thn,
        penetapan,
        realisasi,
        piutang,
        totalBerkas,
        persentase,
      };
    });

    return NextResponse.json({
      success: true,
      selectedYear: activeYear || "all",
      availableYears,
      totalBerkas,
      pendingVerifikasi: verif1Pending + verif2Pending + verif3Pending,
      verif1Pending,
      verif2Pending,
      verif3Pending,
      skpTerbit,
      lunas,
      ditolak,
      totalKetetapan,
      totalRealisasi,
      totalPiutang,
      persentaseRealisasi: totalKetetapan > 0 ? ((totalRealisasi / totalKetetapan) * 100).toFixed(1) : "0",
      kecamatanStats,
      trend5Tahun,
    });
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


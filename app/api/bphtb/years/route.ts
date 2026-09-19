export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get distinct tahun from tblBphtb
    const records = await prisma.tblBphtb.findMany({
      select: {
        tahun: true,
      },
      distinct: ["tahun"],
      where: {
        tahun: {
          not: null,
        },
      },
    });

    const currentYear = new Date().getFullYear().toString();
    const yearSet = new Set<string>();
    yearSet.add(currentYear);

    records.forEach((r) => {
      if (r.tahun && r.tahun.trim() !== "") {
        yearSet.add(r.tahun.trim());
      }
    });

    // Sort years descending (e.g. 2026, 2025, 2024...)
    const years = Array.from(yearSet).sort((a, b) => b.localeCompare(a));

    return NextResponse.json({
      success: true,
      years,
      currentYear: years[0] || currentYear,
    });
  } catch (error: any) {
    console.error("GET /api/bphtb/years error:", error);
    const fallbackYear = new Date().getFullYear().toString();
    return NextResponse.json({
      success: true,
      years: [fallbackYear],
      currentYear: fallbackYear,
    });
  }
}

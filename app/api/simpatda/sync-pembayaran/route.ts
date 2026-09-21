export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { sinkronStatusBayarDariSimpatda } from "@/lib/simpatda";

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const noSts = body.noSts ? String(body.noSts).trim() : undefined;

    const result = await sinkronStatusBayarDariSimpatda(noSts);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Gagal melakukan sinkronisasi status pembayaran dengan SIMPATDA" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi SIMPATDA selesai: ${result.updatedToLunas} berkas diupdate LUNAS, ${result.updatedToBelumBayar} berkas diupdate BELUM BAYAR.`,
      data: result,
    });
  } catch (error: any) {
    console.error("API sync-pembayaran error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noSts = searchParams.get("noSts") || undefined;

    const result = await sinkronStatusBayarDariSimpatda(noSts);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Gagal melakukan sinkronisasi status pembayaran dengan SIMPATDA" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi SIMPATDA selesai: ${result.updatedToLunas} berkas diupdate LUNAS, ${result.updatedToBelumBayar} berkas diupdate BELUM BAYAR.`,
      data: result,
    });
  } catch (error: any) {
    console.error("API sync-pembayaran error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

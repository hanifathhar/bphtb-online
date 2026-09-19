export const runtime = "nodejs";

import { NextResponse } from "next/server";

const PBB_API_URL = process.env.PBB_API_URL || "http://103.167.12.53:3005/api/v1/pbb/nop";
const PBB_API_KEY = process.env.PBB_API_KEY || "bpn-sismiop-pbb-secret-2026";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ nop: string }> }
) {
  try {
    const { nop } = await params;

    if (!nop) {
      return NextResponse.json(
        { error: "Parameter NOP wajib disertakan" },
        { status: 400 }
      );
    }

    // Clean NOP (remove dots, dashes, spaces)
    const cleanNop = nop.replace(/[^0-9]/g, "");

    if (cleanNop.length < 18) {
      return NextResponse.json(
        { error: "Format NOP harus 18 digit angka (contoh: 120321100400100630)" },
        { status: 400 }
      );
    }

    const externalUrl = `${PBB_API_URL}/${cleanNop}`;

    const res = await fetch(externalUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key": PBB_API_KEY,
      },
      // Timeout 10s
      signal: AbortSignal.timeout(10000),
    });

    const result = await res.json();

    if (!res.ok || result.status !== "SUCCESS") {
      return NextResponse.json(
        {
          error:
            result.message ||
            "Data NOP PBB tidak ditemukan dalam database SISMIOP",
        },
        { status: res.status || 404 }
      );
    }

    const d = result.data;

    const luasBumi = Number(d.luastanah_op) || 0;
    const luasBangunan = Number(d.luasbangunan_op) || 0;
    const totalNjopBumi = Number(d.njop_tanah_op) || 0;
    const totalNjopBangunan = Number(d.njop_bangunan_op) || 0;
    const totalNjop = Number(d.total_njop) || (totalNjopBumi + totalNjopBangunan);

    const njopBumiPerM2 = luasBumi > 0 ? Math.round(totalNjopBumi / luasBumi) : 0;
    const njopBangunanPerM2 = luasBangunan > 0 ? Math.round(totalNjopBangunan / luasBangunan) : 0;

    return NextResponse.json({
      success: true,
      message: result.message || "Data Objek Pajak berhasil ditemukan",
      data: {
        nop: cleanNop,
        nopRaw: d.nop_raw,
        namaWp: d.nm_wp,
        alamatOp: d.alamat_op,
        kecamatanOp: d.kecamatan_op,
        kelurahanOp: d.kelurahan_op,
        kotaOp: d.kota_op === "-" ? "Kabupaten" : d.kota_op,
        luasBumi,
        luasBangunan,
        totalNjopBumi,
        totalNjopBangunan,
        totalNjop,
        njopBumiPerM2,
        njopBangunanPerM2,
      },
    });
  } catch (error: any) {
    console.error("PBB NOP Lookup Error:", error);
    return NextResponse.json(
      { error: "Gagal menghubungkan ke server SISMIOP PBB: " + error.message },
      { status: 500 }
    );
  }
}

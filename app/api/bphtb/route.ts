export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { formatNoSts } from "@/lib/sspd";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const statusBerkas = searchParams.get("statusBerkas");
    const statusBayar = searchParams.get("statusBayar");
    const tahun = searchParams.get("tahun");
    const ppat = searchParams.get("ppat");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

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

    if (statusBerkas !== null && statusBerkas !== undefined && statusBerkas !== "") {
      if (statusBerkas.includes(",")) {
        where.statusBerkas = { in: statusBerkas.split(",").map((s) => parseInt(s.trim())) };
      } else {
        where.statusBerkas = parseInt(statusBerkas);
      }
    }

    if (statusBayar !== null && statusBayar !== undefined && statusBayar !== "") {
      where.statusBayar = parseInt(statusBayar);
    }

    if (tahun) {
      where.tahun = tahun;
    }

    if (ppat) {
      where.ppat = { contains: ppat, mode: "insensitive" };
    }

    const [total, data] = await Promise.all([
      prisma.tblBphtb.count({ where }),
      prisma.tblBphtb.findMany({
        where,
        orderBy: { idBerkas: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error: any) {
    console.error("GET BPHTB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();

    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");

    // Generate Nomor Berkas: BPHTB/YYYY/MM/XXXX
    const countToday = await prisma.tblBphtb.count();
    const seqNumber = (countToday + 1).toString().padStart(4, "0");
    const noBerkas = body.noBerkas || `BPHTB/${currentYear}/${currentMonth}/${seqNumber}`;

    // Calculation logic
    const luasBumi = parseFloat(body.luasBumi || 0);
    const luasBangunan = parseFloat(body.luasBangunan || 0);
    const njopBumi = parseFloat(body.njopBumi || 0);
    const njopBangunan = parseFloat(body.njopBangunan || 0);

    const totalNjopBumi = luasBumi * njopBumi;
    const totalNjopBangunan = luasBangunan * njopBangunan;
    const nilaiPbb = totalNjopBumi + totalNjopBangunan;

    const nilaiTransaksi = parseFloat(body.nilaiTransaksi || 0);
    const npop = Math.max(nilaiTransaksi, nilaiPbb);

    // Get NPOPTKP from master
    let npoptkp = parseFloat(body.npoptkp || 0);
    if (!npoptkp && body.jnsTransaksi) {
      const jns = await prisma.msTransaksi.findFirst({
        where: { jnsTransaksi: parseInt(body.jnsTransaksi) },
      });
      if (jns && jns.nopptkp) {
        npoptkp = Number(jns.nopptkp);
      }
    }

    const isKepentinganUmum = body.kepentingan === 1 || body.isKepentinganUmum === true;
    const npopkp = isKepentinganUmum ? 0 : Math.max(0, npop - npoptkp);
    const tarif = parseFloat(body.tarif || 5.0);

    const isSkpdkb = body.jenisKetetapan === "SKPDKB";
    const nilaiKurangBayar = parseFloat(body.nilaiKurangBayar || 0);
    const dendaKurangBayar = parseFloat(body.dendaKurangBayar || 0);
    const bphtb = isSkpdkb ? (nilaiKurangBayar + dendaKurangBayar) : (isKepentinganUmum ? 0 : ((npopkp * tarif) / 100));
    const cleanNop = body.nop ? String(body.nop).replace(/\D/g, "") : null;

    let finalKeterangan = body.keterangan || "";
    if (isKepentinganUmum && !finalKeterangan.includes("[Kepentingan Umum]")) {
      finalKeterangan = finalKeterangan ? `[Kepentingan Umum] ${finalKeterangan}` : "[Kepentingan Umum]";
    }
    if (isSkpdkb) {
      const skpdkbInfo = `[SKPDKB] Pokok Kurang Bayar: Rp ${new Intl.NumberFormat("id-ID").format(nilaiKurangBayar)}, Sanksi Denda/Bunga: Rp ${new Intl.NumberFormat("id-ID").format(dendaKurangBayar)}${body.alasanKurangBayar ? ` (${body.alasanKurangBayar})` : ""}`;
      finalKeterangan = finalKeterangan ? `${skpdkbInfo} - ${finalKeterangan}` : skpdkbInfo;
    }

    const created = await prisma.tblBphtb.create({
      data: {
        noBerkas,
        tglBerkas: body.tglBerkas ? new Date(body.tglBerkas) : new Date(),
        nop: cleanNop,

        // Data WP Lama
        namaWp: body.namaWp,
        nikWp: body.nikWp,
        alamatWp: body.alamatWp,
        kelurahanWp: body.kelurahanWp,
        kecamatanWp: body.kecamatanWp,
        kotaWp: body.kotaWp || "Kabupaten Bogor",
        npwpWp: body.npwpWp,
        kodePosWp: body.kodePosWp,
        rtWp: body.rtWp,
        rwWp: body.rwWp,
        telpWp: body.telpWp,

        // Data Objek Pajak
        lokasiOp: body.lokasiOp,
        kelurahanOp: body.kelurahanOp,
        kecamatanOp: body.kecamatanOp,
        kotaOp: body.kotaOp || "Kabupaten Bogor",
        rtOp: body.rtOp,
        rwOp: body.rwOp,
        luasBumi,
        luasBangunan,
        njopBumi,
        njopBangunan,
        totalNjopBumi,
        totalNjopBangunan,
        nilaiPbb,

        // Data WP Baru
        namaWpBaru: body.namaWpBaru,
        nikWpBaru: body.nikWpBaru,
        alamatWpBaru: body.alamatWpBaru,
        rtWpBaru: body.rtWpBaru,
        rwWpBaru: body.rwWpBaru,
        kelurahanWpBaru: body.kelurahanWpBaru,
        kecamatanWpBaru: body.kecamatanWpBaru,
        kotaWpBaru: body.kotaWpBaru || "Kabupaten Bogor",
        npwpWpBaru: body.npwpWpBaru,
        kodePosWpBaru: body.kodePosWpBaru,
        telpWpBaru: body.telpWpBaru,

        // Transaksi & Perhitungan
        keterangan: finalKeterangan,
        jnsTransaksi: body.jnsTransaksi ? String(body.jnsTransaksi) : "1",
        nilaiTransaksi,
        npop,
        npoptkp,
        npopkp,
        tarif,
        bphtb,
        nilaiSudahDibayar: 0,
        nilaiBelumDibayar: bphtb,

        // Entry
        entry: user?.username || body.entry || "system",
        tahun: currentYear,
        noSts: body.noSts || null,
        kdKohir: null,

        // Workflow state
        verif1: 0,
        verif2: 0,
        verif3: 0,
        statusBerkas: 1, // Ready for Verifikasi 1
        statusBayar: 0,

        // Dokumen
        scanPernyataan: body.scanPernyataan || null,
        scanKtp: body.scanKtp || null,
        fotoObjek: body.fotoObjek || null,
        scanNpwp: body.scanNpwp || null,
        scanSertifikat: body.scanSertifikat || null,
        scanPbb: body.scanPbb || null,

        ppat: body.ppat || (user?.roleName === "PPAT" ? user?.nama : null),
        kepentingan: isKepentinganUmum ? 1 : (body.kepentingan ? parseInt(body.kepentingan) : 0),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berkas pendaftaran BPHTB berhasil dibuat",
      data: created,
    });
  } catch (error: any) {
    console.error("POST BPHTB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

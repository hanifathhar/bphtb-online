import mysql from "mysql2/promise";
import { prisma } from "./prisma";

const simpatdaConfig = {
  host: process.env.SIMPATDA_DB_HOST || "103.167.12.55",
  port: parseInt(process.env.SIMPATDA_DB_PORT || "3306"),
  user: process.env.SIMPATDA_DB_USER || "prg#s3rv3r#pro",
  password: process.env.SIMPATDA_DB_PASSWORD || "s3rv3r#2025%route.&",
  database: process.env.SIMPATDA_DB_NAME || "dbsimpatda",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
};

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(simpatdaConfig);
  }
  return pool;
}

export interface SimpatdaTetapParams {
  kdKohir: string;
  tglSkp: Date | string;
  noSts: string;
  bphtb?: number | string | any;
  nilaiBelumDibayar?: number | string | any;
  keterangan?: string | null;
  nop?: string | null;
  namaWpBaru?: string | null;
  namaWp?: string | null;
  alamatWpBaru?: string | null;
  alamatWp?: string | null;
  lokasiOp?: string | null;
  npwpWpBaru?: string | null;
  npwpWp?: string | null;
  tglTempo?: Date | string | null;
  tahun?: string | null;
  username?: string | null;
  tglUpdate?: Date | string | null;
}

/**
 * Mengirim data penetapan SKP BPHTB ke tabel dbsimpatda.tr_tetap dan dbsimpatda.skp_bphtb
 */
export async function kirimKetetapanKeSimpatda(data: SimpatdaTetapParams) {
  try {
    const nilaiAngka = Number(data.nilaiBelumDibayar ?? data.bphtb ?? 0);
    if (nilaiAngka <= 0) {
      console.log(`[SIMPATDA] Lewati kirim ke SIMPATDA karena nilai <= 0 (Nihil) untuk STS: ${data.noSts}`);
      return { success: true, skipped: true, reason: "Nilai ketetapan 0 / Nihil" };
    }

    if (!data.noSts || !data.kdKohir) {
      console.warn("[SIMPATDA] Nomor STS atau Kode Kohir tidak ditemukan, batal kirim.");
      return { success: false, error: "No STS atau Kode Kohir kosong" };
    }

    const tglTetapFormatted = data.tglSkp
      ? new Date(data.tglSkp).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const tglTempoFormatted = data.tglTempo
      ? new Date(data.tglTempo).toISOString().slice(0, 10)
      : (() => {
          const t = new Date();
          t.setDate(t.getDate() + 30);
          return t.toISOString().slice(0, 10);
        })();

    const tglUpdateFormatted = data.tglUpdate
      ? new Date(data.tglUpdate).toISOString().slice(0, 19).replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " ");

    const kdSkpd = "3.00.03.01.01";
    const kdRek5 = "4111301";
    const nmRek5 = "Bea Perolehan Hak Atas Tanah dan Bangunan";
    const tahunStr = (data.tahun || new Date().getFullYear().toString()).slice(0, 4);

    const uraianKet = (
      data.keterangan
        ? `${data.keterangan}NOP :${data.nop || ""}`
        : `NOP :${data.nop || ""}`
    ).slice(0, 255);

    const companyNama = (data.namaWpBaru || data.namaWp || "-").slice(0, 50);
    const alamatWp = (data.alamatWpBaru || data.alamatWp || data.lokasiOp || "").slice(0, 250);
    const npwpStr = (data.npwpWpBaru || data.npwpWp || data.keterangan || "").slice(0, 50);
    const usernameStr = (data.username || "SYSTEM").slice(0, 100);

    const poolDb = getPool();

    // 1. Insert/Update ke tr_tetap
    const sqlTrTetap = `
      INSERT INTO tr_tetap 
      (no_tetap, tgl_tetap, no_sts, kd_skpd, kd_rek5, nm_rek5, nilai, keterangan, company, alamat, npwp, tmt_akhir, tahun, jenis, verif)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
      ON DUPLICATE KEY UPDATE
      no_tetap = VALUES(no_tetap),
      tgl_tetap = VALUES(tgl_tetap),
      kd_skpd = VALUES(kd_skpd),
      kd_rek5 = VALUES(kd_rek5),
      nm_rek5 = VALUES(nm_rek5),
      nilai = VALUES(nilai),
      keterangan = VALUES(keterangan),
      company = VALUES(company),
      alamat = VALUES(alamat),
      npwp = VALUES(npwp),
      tmt_akhir = VALUES(tmt_akhir),
      tahun = VALUES(tahun)
    `;

    await poolDb.query(sqlTrTetap, [
      data.kdKohir,
      tglTetapFormatted,
      data.noSts,
      kdSkpd,
      kdRek5,
      nmRek5,
      nilaiAngka,
      uraianKet,
      companyNama,
      alamatWp,
      npwpStr,
      tglTempoFormatted,
      tahunStr,
    ]);

    // 2. Insert ke skp_bphtb (hapus dulu record dengan no_sts yang sama jika ada agar tidak duplikat)
    await poolDb.query("DELETE FROM skp_bphtb WHERE no_sts = ?", [data.noSts]);

    const sqlSkpBphtb = `
      INSERT INTO skp_bphtb 
      (no_sts, kd_kohir, kd_skpd, tgl_skp, id_wp, company, alamat, npwp, kegiatan, keterangan, kd_rek5, nilai, tahun, username, tgl_update, tgl_tempo, VERIFIKASI_KASI, VERIFIKASI_KABID, BUKU) 
      VALUES (?, ?, ?, ?, '', ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 1, 1, 0)
    `;

    await poolDb.query(sqlSkpBphtb, [
      data.noSts,
      data.kdKohir,
      kdSkpd,
      tglTetapFormatted,
      companyNama,
      alamatWp,
      npwpStr,
      uraianKet,
      kdRek5,
      nilaiAngka,
      tahunStr,
      usernameStr,
      tglUpdateFormatted,
      tglTempoFormatted,
    ]);

    console.log(`[SIMPATDA] Berhasil sinkronisasi ketetapan STS ${data.noSts} (Kohir: ${data.kdKohir}) ke dbsimpatda.tr_tetap & dbsimpatda.skp_bphtb`);
    return { success: true };
  } catch (error: any) {
    console.error("[SIMPATDA] Gagal sinkronisasi ketetapan ke dbsimpatda:", error.message || error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Menghapus data ketetapan dari dbsimpatda (tr_tetap & skp_bphtb) saat rollback atau pembatalan verifikasi 3
 */
export async function hapusKetetapanDariSimpatda(noSts: string) {
  if (!noSts) return;
  try {
    const poolDb = getPool();
    await poolDb.query("DELETE FROM tr_tetap WHERE no_sts = ?", [noSts]);
    await poolDb.query("DELETE FROM skp_bphtb WHERE no_sts = ?", [noSts]);
    console.log(`[SIMPATDA] Berhasil menghapus ketetapan STS ${noSts} dari dbsimpatda (tr_tetap & skp_bphtb)`);
  } catch (error: any) {
    console.error(`[SIMPATDA] Gagal menghapus ketetapan STS ${noSts} dari dbsimpatda:`, error.message || error);
  }
}

export interface SyncBayarResult {
  success: boolean;
  totalChecked: number;
  updatedToLunas: number;
  updatedToBelumBayar: number;
  details?: Array<{
    noSts: string;
    action: "LUNAS" | "BELUM_BAYAR" | "NO_CHANGE";
    keterangan?: string;
  }>;
  error?: string;
}

/**
 * Sinkronisasi status bayar otomatis dari tabel dbsimpatda.tr_tetap:
 * - Jika `verif = 1` -> Update local tbl_bphtb menjadi LUNAS (statusBayar = 1, statusBerkas = 5, nilaiSudahDibayar = nilai, nilaiBelumDibayar = 0)
 * - Jika `verif = 0` -> Update local tbl_bphtb menjadi BELUM BAYAR (statusBayar = 0, statusBerkas = 4, nilaiSudahDibayar = 0, nilaiBelumDibayar = bphtb)
 */
export async function sinkronStatusBayarDariSimpatda(noStsTarget?: string): Promise<SyncBayarResult> {
  try {
    const poolDb = getPool();

    if (noStsTarget) {
      // 1. Sinkronisasi spesifik 1 nomor STS
      const [rows]: any = await poolDb.query(
        "SELECT no_sts, no_tetap, verif, tgl_bayar, nm_channel, kd_pengesahan, nilai FROM tr_tetap WHERE no_sts = ?",
        [noStsTarget]
      );

      if (!rows || rows.length === 0) {
        return {
          success: true,
          totalChecked: 1,
          updatedToLunas: 0,
          updatedToBelumBayar: 0,
          details: [{ noSts: noStsTarget, action: "NO_CHANGE", keterangan: "Tidak ditemukan di dbsimpatda.tr_tetap" }],
        };
      }

      const simpatdaRow = rows[0];
      const local = await prisma.tblBphtb.findFirst({
        where: { noSts: noStsTarget },
      });

      if (!local) {
        return {
          success: true,
          totalChecked: 1,
          updatedToLunas: 0,
          updatedToBelumBayar: 0,
          details: [{ noSts: noStsTarget, action: "NO_CHANGE", keterangan: "Tidak ditemukan di database BPHTB lokal" }],
        };
      }

      const isVerifPaid = Number(simpatdaRow.verif) === 1;

      if (isVerifPaid) {
        const bayarNominal = Number(simpatdaRow.nilai || local.bphtb || 0);
        const tglBayarVal = simpatdaRow.tgl_bayar ? new Date(simpatdaRow.tgl_bayar) : new Date();

        await prisma.tblBphtb.update({
          where: { idBerkas: local.idBerkas },
          data: {
            statusBayar: 1,
            statusBerkas: 5, // Lunas
            tglBayar: tglBayarVal,
            bankBayar: simpatdaRow.nm_channel || "SIMPATDA",
            noBuktiBayar: simpatdaRow.kd_pengesahan || `SIMPATDA-${simpatdaRow.no_sts}`,
            nilaiSudahDibayar: bayarNominal,
            nilaiBelumDibayar: 0,
          },
        });

        console.log(`[SIMPATDA SYNC] STS ${noStsTarget} diupdate menjadi LUNAS (verif = 1).`);
        return {
          success: true,
          totalChecked: 1,
          updatedToLunas: 1,
          updatedToBelumBayar: 0,
          details: [{ noSts: noStsTarget, action: "LUNAS", keterangan: "Status diupdate menjadi LUNAS" }],
        };
      } else {
        // verif = 0 -> Update menjadi Belum Bayar jika sebelumnya lunas
        if (local.statusBayar === 1) {
          const bphtbNominal = Number(local.bphtb || 0);
          await prisma.tblBphtb.update({
            where: { idBerkas: local.idBerkas },
            data: {
              statusBayar: 0,
              statusBerkas: 4, // Kembali ke SKP Terbit / Siap Bayar
              tglBayar: null,
              bankBayar: null,
              noBuktiBayar: null,
              nilaiSudahDibayar: 0,
              nilaiBelumDibayar: bphtbNominal,
            },
          });

          console.log(`[SIMPATDA SYNC] STS ${noStsTarget} diupdate menjadi BELUM BAYAR (verif = 0).`);
          return {
            success: true,
            totalChecked: 1,
            updatedToLunas: 0,
            updatedToBelumBayar: 1,
            details: [{ noSts: noStsTarget, action: "BELUM_BAYAR", keterangan: "Status diupdate menjadi BELUM BAYAR" }],
          };
        }

        return {
          success: true,
          totalChecked: 1,
          updatedToLunas: 0,
          updatedToBelumBayar: 0,
          details: [{ noSts: noStsTarget, action: "NO_CHANGE", keterangan: "Status tetap belum bayar" }],
        };
      }
    }

    // 2. Sinkronisasi Massal (Semua berkas yang telah memiliki No STS dan status berkas SKP/Lunas)
    const localBerkas = await prisma.tblBphtb.findMany({
      where: {
        noSts: { not: null },
        statusBerkas: { in: [4, 5] },
      },
      select: {
        idBerkas: true,
        noSts: true,
        bphtb: true,
        statusBayar: true,
        statusBerkas: true,
      },
    });

    if (localBerkas.length === 0) {
      return { success: true, totalChecked: 0, updatedToLunas: 0, updatedToBelumBayar: 0 };
    }

    const stsList = localBerkas.map((b) => b.noSts).filter(Boolean) as string[];

    // Query dari tr_tetap secara bertahap (chunks)
    const chunkSize = 500;
    const simpatdaMap = new Map<string, any>();

    for (let i = 0; i < stsList.length; i += chunkSize) {
      const chunk = stsList.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => "?").join(",");
      const [rows]: any = await poolDb.query(
        `SELECT no_sts, no_tetap, verif, tgl_bayar, nm_channel, kd_pengesahan, nilai FROM tr_tetap WHERE no_sts IN (${placeholders})`,
        chunk
      );
      if (Array.isArray(rows)) {
        for (const r of rows) {
          simpatdaMap.set(r.no_sts, r);
        }
      }
    }

    let updatedToLunas = 0;
    let updatedToBelumBayar = 0;
    const details: any[] = [];

    for (const local of localBerkas) {
      if (!local.noSts) continue;
      const simpatdaRow = simpatdaMap.get(local.noSts);
      if (!simpatdaRow) continue;

      const isVerifPaid = Number(simpatdaRow.verif) === 1;

      if (isVerifPaid && local.statusBayar !== 1) {
        const bayarNominal = Number(simpatdaRow.nilai || local.bphtb || 0);
        const tglBayarVal = simpatdaRow.tgl_bayar ? new Date(simpatdaRow.tgl_bayar) : new Date();

        await prisma.tblBphtb.update({
          where: { idBerkas: local.idBerkas },
          data: {
            statusBayar: 1,
            statusBerkas: 5,
            tglBayar: tglBayarVal,
            bankBayar: simpatdaRow.nm_channel || "SIMPATDA",
            noBuktiBayar: simpatdaRow.kd_pengesahan || `SIMPATDA-${simpatdaRow.no_sts}`,
            nilaiSudahDibayar: bayarNominal,
            nilaiBelumDibayar: 0,
          },
        });
        updatedToLunas++;
        details.push({ noSts: local.noSts, action: "LUNAS" });
      } else if (!isVerifPaid && local.statusBayar === 1) {
        const bphtbNominal = Number(local.bphtb || 0);
        await prisma.tblBphtb.update({
          where: { idBerkas: local.idBerkas },
          data: {
            statusBayar: 0,
            statusBerkas: 4,
            tglBayar: null,
            bankBayar: null,
            noBuktiBayar: null,
            nilaiSudahDibayar: 0,
            nilaiBelumDibayar: bphtbNominal,
          },
        });
        updatedToBelumBayar++;
        details.push({ noSts: local.noSts, action: "BELUM_BAYAR" });
      }
    }

    console.log(`[SIMPATDA SYNC] Checked ${localBerkas.length} berkas: ${updatedToLunas} diupdate Lunas, ${updatedToBelumBayar} diupdate Belum Bayar.`);
    return {
      success: true,
      totalChecked: localBerkas.length,
      updatedToLunas,
      updatedToBelumBayar,
      details,
    };
  } catch (error: any) {
    console.error("[SIMPATDA SYNC] Error saat sinkronisasi status bayar:", error.message || error);
    return {
      success: false,
      totalChecked: 0,
      updatedToLunas: 0,
      updatedToBelumBayar: 0,
      error: error.message || error,
    };
  }
}

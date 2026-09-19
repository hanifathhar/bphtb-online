import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding data BPHTB Online...");

  // 1. SEED ADMIN & PENGGUNA
  const defaultPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      username: "admin",
      nmPengguna: "Administrator Sistem Bapenda",
      email: "admin@bphtb.daerah.go.id",
      level: 1,
      roleName: "ADMIN",
    },
    {
      username: "petugas_loket",
      nmPengguna: "Rudi Haryanto (Loket Pendaftaran)",
      email: "loket@bphtb.daerah.go.id",
      level: 2,
      roleName: "PENDAFTARAN",
    },
    {
      username: "verifikator1",
      nmPengguna: "Ahmad Fauzi (Verifikator 1 / Staf Lapangan)",
      email: "verif1@bphtb.daerah.go.id",
      level: 3,
      roleName: "VERIFIKATOR_1",
    },
    {
      username: "verifikator2",
      nmPengguna: "Siti Rahmawati (Verifikator 2 / Kasie Teknis)",
      email: "verif2@bphtb.daerah.go.id",
      level: 4,
      roleName: "VERIFIKATOR_2",
    },
    {
      username: "verifikator3",
      nmPengguna: "Drs. Hendra Gunawan (Verifikator 3 / Kabid Penetapan)",
      email: "verif3@bphtb.daerah.go.id",
      level: 5,
      roleName: "VERIFIKATOR_3",
    },
    {
      username: "bank_kasir",
      nmPengguna: "Teller Bank BPD Jateng / Jabar",
      email: "kasir@bankbpd.co.id",
      level: 6,
      roleName: "BANK",
    },
    {
      username: "notaris_budi",
      nmPengguna: "Budi Santoso, S.H., M.Kn (PPAT)",
      email: "ppat.budi@notaris.id",
      level: 7,
      roleName: "PPAT",
    },
  ];

  for (const u of users) {
    await prisma.admin.upsert({
      where: { username: u.username },
      update: {
        nmPengguna: u.nmPengguna,
        level: u.level,
        roleName: u.roleName,
        status: 1,
      },
      create: {
        username: u.username,
        password: defaultPassword,
        nmPengguna: u.nmPengguna,
        email: u.email,
        level: u.level,
        roleName: u.roleName,
        status: 1,
        baned: "N",
      },
    });
  }
  console.log("✅ Seed pengguna & role berhasil.");

  // 2. SEED MASTER KECAMATAN
  const kecamatans = [
    { idKecamatan: "320101", kecamatan: "Kecamatan Cibinong", idKabKota: "3201" },
    { idKecamatan: "320102", kecamatan: "Kecamatan Gunung Putri", idKabKota: "3201" },
    { idKecamatan: "320103", kecamatan: "Kecamatan Cileungsi", idKabKota: "3201" },
    { idKecamatan: "320104", kecamatan: "Kecamatan Bojonggede", idKabKota: "3201" },
    { idKecamatan: "320105", kecamatan: "Kecamatan Sukaraja", idKabKota: "3201" },
  ];

  for (const k of kecamatans) {
    await prisma.tblKecamatan.upsert({
      where: { idKecamatan: k.idKecamatan },
      update: { kecamatan: k.kecamatan },
      create: k,
    });
  }
  console.log("✅ Seed master kecamatan berhasil.");

  // 3. SEED MASTER DESA / KELURAHAN
  const desas = [
    { idDesa: "320101001", idKecamatan: "320101", kelurahanDesa: "Kelurahan Cirimekar" },
    { idDesa: "320101002", idKecamatan: "320101", kelurahanDesa: "Kelurahan Ciriung" },
    { idDesa: "320101003", idKecamatan: "320101", kelurahanDesa: "Kelurahan Harapan Jaya" },
    { idDesa: "320101004", idKecamatan: "320101", kelurahanDesa: "Kelurahan Tengah" },
    { idDesa: "320102001", idKecamatan: "320102", kelurahanDesa: "Desa Gunung Putri" },
    { idDesa: "320102002", idKecamatan: "320102", kelurahanDesa: "Desa Tlajung Udik" },
    { idDesa: "320103001", idKecamatan: "320103", kelurahanDesa: "Desa Cileungsi Kidul" },
    { idDesa: "320104001", idKecamatan: "320104", kelurahanDesa: "Desa Bojonggede" },
    { idDesa: "320105001", idKecamatan: "320105", kelurahanDesa: "Desa Cadas Ngampar" },
  ];

  for (const d of desas) {
    await prisma.tblDesa.upsert({
      where: { idDesa: d.idDesa },
      update: { kelurahanDesa: d.kelurahanDesa, idKecamatan: d.idKecamatan },
      create: d,
    });
  }
  console.log("✅ Seed master desa/kelurahan berhasil.");

  // 4. SEED MASTER JENIS TRANSAKSI & NOPPTKP
  const jenisTransaksis = [
    { jnsTransaksi: 1, keterangan: "Jual Beli", nopptkp: 80000000, tarif: 5.0 },
    { jnsTransaksi: 2, keterangan: "Tukar Menukar", nopptkp: 80000000, tarif: 5.0 },
    { jnsTransaksi: 3, keterangan: "Hibah", nopptkp: 80000000, tarif: 5.0 },
    { jnsTransaksi: 4, keterangan: "Hibah Wasiat", nopptkp: 300000000, tarif: 5.0 },
    { jnsTransaksi: 5, keterangan: "Waris", nopptkp: 300000000, tarif: 5.0 },
    { jnsTransaksi: 6, keterangan: "Pemisahan Hak", nopptkp: 80000000, tarif: 5.0 },
    { jnsTransaksi: 7, keterangan: "Lelang", nopptkp: 80000000, tarif: 5.0 },
    { jnsTransaksi: 8, keterangan: "Putusan Hakim", nopptkp: 80000000, tarif: 5.0 },
    { jnsTransaksi: 9, keterangan: "Pemberian Hak Baru", nopptkp: 80000000, tarif: 5.0 },
  ];

  for (const jt of jenisTransaksis) {
    await prisma.msTransaksi.upsert({
      where: { jnsTransaksi: jt.jnsTransaksi },
      update: { keterangan: jt.keterangan, nopptkp: jt.nopptkp, tarif: jt.tarif },
      create: jt,
    });
  }
  console.log("✅ Seed master jenis transaksi & NOPPTKP berhasil.");

  // 5. SEED MASTER STATUS & KEPERLUAN
  const statuses = [
    { kode: 0, status: "Draft Pendaftaran" },
    { kode: 1, status: "Menunggu Verifikasi 1 (Pemeriksa Staf)" },
    { kode: 2, status: "Menunggu Verifikasi 2 (Kasie Teknis)" },
    { kode: 3, status: "Menunggu Verifikasi 3 (Kabid Penetapan)" },
    { kode: 4, status: "SKP / Kohir Ditetapkan (Siap Bayar)" },
    { kode: 5, status: "Lunas (Sudah Dibayar)" },
    { kode: 9, status: "Ditolak / Perlu Perbaikan" },
  ];

  for (const st of statuses) {
    await prisma.msStatus.upsert({
      where: { kode: st.kode },
      update: { status: st.status },
      create: st,
    });
  }

  const keperluans = [
    { kode: "KP01", keterangan: "Balik Nama Sertifikat Hak Milik (SHM)" },
    { kode: "KP02", keterangan: "Pendaftaran Hak Guna Bangunan (HGB)" },
    { kode: "KP03", keterangan: "Penerbitan Sertifikat Baru Melalui PTSL" },
    { kode: "KP04", keterangan: "Peralihan Hak Waris Keluarga" },
    { kode: "KP05", keterangan: "Peningkatan Hak Girik ke Sertifikat" },
  ];

  for (const kp of keperluans) {
    await prisma.msKeperluan.upsert({
      where: { kode: kp.kode },
      update: { keterangan: kp.keterangan },
      create: kp,
    });
  }
  console.log("✅ Seed master status & keperluan berhasil.");

  // 6. SEED CONTOH BERKAS BPHTB
  const existingCount = await prisma.tblBphtb.count();
  if (existingCount === 0) {
    const sampleBerkas = [
      {
        noBerkas: "BPHTB/2026/09/0001",
        tglBerkas: new Date("2026-09-10"),
        nop: "320101000100200450",
        namaWp: "Bambang Sudibyo",
        nikWp: "3201012304750002",
        alamatWp: "Jl. Mayor Oking No. 12",
        kelurahanWp: "Kelurahan Cirimekar",
        kecamatanWp: "Kecamatan Cibinong",
        kotaWp: "Kabupaten Bogor",
        npwpWp: "08.123.456.7-403.000",
        kodePosWp: "16918",
        rtWp: "03",
        rwWp: "05",
        telpWp: "081298765432",
        lokasiOp: "Perumahan Bumi Cibinong Asri Blok C2 No. 10",
        kelurahanOp: "Kelurahan Cirimekar",
        kecamatanOp: "Kecamatan Cibinong",
        kotaOp: "Kabupaten Bogor",
        rtOp: "03",
        rwOp: "05",
        luasBumi: 120,
        luasBangunan: 90,
        njopBumi: 2500000,
        njopBangunan: 3000000,
        totalNjopBumi: 300000000,
        totalNjopBangunan: 270000000,
        nilaiPbb: 570000000,
        namaWpBaru: "Anindya Putri Lestari",
        nikWpBaru: "3201015609920001",
        alamatWpBaru: "Jl. Ciriung Jaya No. 44",
        rtWpBaru: "02",
        rwWpBaru: "04",
        kelurahanWpBaru: "Kelurahan Ciriung",
        kecamatanWpBaru: "Kecamatan Cibinong",
        kotaWpBaru: "Kabupaten Bogor",
        npwpWpBaru: "71.987.654.3-403.000",
        kodePosWpBaru: "16917",
        telpWpBaru: "081387654321",
        keterangan: "Peralihan Hak Jual Beli Rumah Tinggal",
        jnsTransaksi: "1",
        nilaiTransaksi: 650000000,
        npop: 650000000,
        npoptkp: 80000000,
        npopkp: 570000000,
        tarif: 5.0,
        bphtb: 28500000,
        nilaiSudahDibayar: 28500000,
        nilaiBelumDibayar: 0,
        entry: "notaris_budi",
        kdKohir: "KHR-2026-09-0012",
        tglSkp: new Date("2026-09-12"),
        noSts: "STS-2026-09-0881",
        tahun: "2026",
        verif1: 1,
        userVerif1: "verifikator1",
        tglVerif1: new Date("2026-09-11"),
        ketVerif1: "Dokumen KTP, NOP, dan bukti transaksi lengkap sesuai lapangan.",
        verif2: 1,
        userVerif2: "verifikator2",
        tglVerif2: new Date("2026-09-11"),
        ketVerif2: "Perhitungan NPOP dan NPOPKP telah disetujui.",
        verif3: 1,
        userVerif3: "verifikator3",
        tglVerif3: new Date("2026-09-12"),
        ketVerif3: "Penetapan SKP disetujui dan Kohir diterbitkan.",
        statusBerkas: 5,
        statusBayar: 1,
        tglBayar: new Date("2026-09-13"),
        tglTempo: new Date("2026-10-12"),
        noBuktiBayar: "BPD-TRX-9988221",
        bankBayar: "Bank BPD",
        ppat: "Budi Santoso, S.H., M.Kn",
        kepentingan: 1,
      },
      {
        noBerkas: "BPHTB/2026/09/0002",
        tglBerkas: new Date("2026-09-15"),
        nop: "320102000500101120",
        namaWp: "H. Sukirno",
        nikWp: "3201021102600003",
        alamatWp: "Desa Gunung Putri RT 01 RW 02",
        kelurahanWp: "Desa Gunung Putri",
        kecamatanWp: "Kecamatan Gunung Putri",
        kotaWp: "Kabupaten Bogor",
        npwpWp: "09.555.444.3-403.000",
        kodePosWp: "16961",
        rtWp: "01",
        rwWp: "02",
        lokasiOp: "Jl. Raya Narogong Km 18",
        kelurahanOp: "Desa Gunung Putri",
        kecamatanOp: "Kecamatan Gunung Putri",
        kotaOp: "Kabupaten Bogor",
        rtOp: "01",
        rwOp: "02",
        luasBumi: 200,
        luasBangunan: 150,
        njopBumi: 3000000,
        njopBangunan: 3500000,
        totalNjopBumi: 600000000,
        totalNjopBangunan: 525000000,
        nilaiPbb: 1125000000,
        namaWpBaru: "Dedi Kusuma",
        nikWpBaru: "3201021508850004",
        alamatWpBaru: "Jl. Tlajung Udik No. 89",
        rtWpBaru: "04",
        rwWpBaru: "01",
        kelurahanWpBaru: "Desa Tlajung Udik",
        kecamatanWpBaru: "Kecamatan Gunung Putri",
        kotaWpBaru: "Kabupaten Bogor",
        npwpWpBaru: "88.123.456.7-403.000",
        kodePosWpBaru: "16962",
        telpWpBaru: "081987654321",
        keterangan: "Hibah Wasiat dari Orang Tua ke Anak Kandung",
        jnsTransaksi: "4",
        nilaiTransaksi: 1200000000,
        npop: 1200000000,
        npoptkp: 300000000,
        npopkp: 900000000,
        tarif: 5.0,
        bphtb: 45000000,
        nilaiSudahDibayar: 0,
        nilaiBelumDibayar: 45000000,
        entry: "petugas_loket",
        kdKohir: "KHR-2026-09-0015",
        tglSkp: new Date("2026-09-16"),
        noSts: "STS-2026-09-0902",
        tahun: "2026",
        verif1: 1,
        userVerif1: "verifikator1",
        tglVerif1: new Date("2026-09-15"),
        ketVerif1: "Berkas hibah wasiat sah dan lengkap.",
        verif2: 1,
        userVerif2: "verifikator2",
        tglVerif2: new Date("2026-09-16"),
        ketVerif2: "NPOPTKP Rp 300.000.000 diterapkan sesuai perda.",
        verif3: 1,
        userVerif3: "verifikator3",
        tglVerif3: new Date("2026-09-16"),
        ketVerif3: "SKP Kohir diterbitkan. Menunggu pembayaran di kasir/bank.",
        statusBerkas: 4,
        statusBayar: 0,
        tglTempo: new Date("2026-10-16"),
        ppat: "Budi Santoso, S.H., M.Kn",
        kepentingan: 4,
      },
      {
        noBerkas: "BPHTB/2026/09/0003",
        tglBerkas: new Date("2026-09-17"),
        nop: "320103000200100880",
        namaWp: "Rahmat Hidayat",
        nikWp: "3201031905800005",
        alamatWp: "Desa Cileungsi Kidul RT 02 RW 03",
        kelurahanWp: "Desa Cileungsi Kidul",
        kecamatanWp: "Kecamatan Cileungsi",
        kotaWp: "Kabupaten Bogor",
        npwpWp: "14.222.333.4-403.000",
        lokasiOp: "Jl. Transyogi Cileungsi Blok D No. 5",
        kelurahanOp: "Desa Cileungsi Kidul",
        kecamatanOp: "Kecamatan Cileungsi",
        kotaOp: "Kabupaten Bogor",
        luasBumi: 84,
        luasBangunan: 45,
        njopBumi: 1800000,
        njopBangunan: 2200000,
        totalNjopBumi: 151200000,
        totalNjopBangunan: 99000000,
        nilaiPbb: 250200000,
        namaWpBaru: "Tri Wahyuni",
        nikWpBaru: "3201034407950002",
        alamatWpBaru: "Desa Cileungsi Kidul RT 05 RW 03",
        kelurahanWpBaru: "Desa Cileungsi Kidul",
        kecamatanWpBaru: "Kecamatan Cileungsi",
        kotaWpBaru: "Kabupaten Bogor",
        npwpWpBaru: "65.432.198.7-403.000",
        keterangan: "Jual Beli Rumah Sederhana",
        jnsTransaksi: "1",
        nilaiTransaksi: 320000000,
        npop: 320000000,
        npoptkp: 80000000,
        npopkp: 240000000,
        tarif: 5.0,
        bphtb: 12000000,
        nilaiSudahDibayar: 0,
        nilaiBelumDibayar: 12000000,
        entry: "notaris_budi",
        tahun: "2026",
        verif1: 1,
        userVerif1: "verifikator1",
        tglVerif1: new Date("2026-09-17"),
        ketVerif1: "Kelengkapan berkas fisik & digital valid.",
        verif2: 0,
        verif3: 0,
        statusBerkas: 2, // Menunggu verifikasi 2
        statusBayar: 0,
        ppat: "Budi Santoso, S.H., M.Kn",
      },
    ];

    for (const b of sampleBerkas) {
      await prisma.tblBphtb.create({ data: b });
    }
    console.log("✅ Seed contoh berkas BPHTB berhasil.");
  }

  console.log("🎉 Seeding BPHTB Online Selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

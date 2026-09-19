const { PrismaClient, Prisma } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

function parseExcelDate(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    const date = xlsx.SSF.parse_date_code(val);
    if (!date) return null;
    return new Date(Date.UTC(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, Math.floor(date.S || 0), Math.floor((date.u || 0) * 1000)));
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '0000-00-00' || trimmed === '0000-00-00 00:00:00') return null;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  if (val instanceof Date) return val;
  return null;
}

function parseDecimal(val) {
  if (val === null || val === undefined || val === '') return 0;
  const str = String(val).replace(/,/g, '').trim();
  if (str === '') return 0;
  const num = Number(str);
  if (isNaN(num)) return 0;
  return new Prisma.Decimal(num);
}

function parseString(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str === '' ? null : str;
}

function parseIntVal(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  const num = parseInt(val, 10);
  return isNaN(num) ? defaultVal : num;
}

async function runImport() {
  console.log('=== STARTING BPHTB MIGRATION IMPORT ===');
  
  const wb = xlsx.readFile('data bphtb migrasi.xlsx');
  const sheetName = wb.SheetNames[0];
  console.log('Reading sheet:', sheetName);
  const sheet = wb.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log('Total rows found in Excel:', rawRows.length);

  // Filter valid rows
  const validRows = rawRows.filter(r => r && r.length > 0 && !r.every(c => c === null || c === undefined || c === ''));

  // Separate row 0 (which was BPHTB/2026/09/0001 with dummy/test ID 7) and regular rows (1..2037)
  // Let's sort so row 1..2037 come first in order of original IDs, and row 0 comes at the end
  const regularRows = validRows.filter((r, idx) => !(idx === 0 && r[1] === 'BPHTB/2026/09/0001'));
  const testRows = validRows.filter((r, idx) => (idx === 0 && r[1] === 'BPHTB/2026/09/0001'));

  const orderedRows = [...regularRows, ...testRows];

  const fields = Prisma.dmmf.datamodel.models.find(m => m.name === 'TblBphtb').fields;

  const dataToInsert = [];

  for (let i = 0; i < orderedRows.length; i++) {
    const row = orderedRows[i];
    const obj = {};

    fields.forEach((field, colIdx) => {
      // Exclude idBerkas so PostgreSQL auto-increment generates unique clean sequential IDs
      if (field.name === 'idBerkas') return;

      const rawVal = row[colIdx];
      if (field.type === 'Int') {
        obj[field.name] = parseIntVal(rawVal, 0);
      } else if (field.type === 'Decimal') {
        obj[field.name] = parseDecimal(rawVal);
      } else if (field.type === 'DateTime') {
        obj[field.name] = parseExcelDate(rawVal);
      } else if (field.type === 'String') {
        obj[field.name] = parseString(rawVal);
      } else {
        obj[field.name] = rawVal;
      }
    });

    // Jika nilai BPHTB bernilai 0 (Nihil) dan sudah tahap penetapan (verif3 = 1), otomatis lunas
    const bphtbVal = Number(obj.bphtb || 0);
    if (bphtbVal <= 0 && obj.verif3 === 1) {
      obj.statusBayar = 1;
      obj.statusBerkas = 5;
      obj.bankBayar = obj.bankBayar || "Nihil / Bebas Pajak";
      obj.noBuktiBayar = obj.noBuktiBayar || `NIHIL-${obj.kdKohir || "0"}`;
      obj.tglBayar = obj.tglBayar || obj.tglSkp || obj.tglBerkas;
      obj.nilaiSudahDibayar = 0;
      obj.nilaiBelumDibayar = 0;
    }

    // Tentukan statusBerkas yang akurat jika dari excel kosong / 0
    if (!obj.statusBerkas || obj.statusBerkas === 0) {
      if (obj.statusBayar === 1) {
        obj.statusBerkas = 5; // Lunas
      } else if (obj.verif3 === 1) {
        obj.statusBerkas = 4; // SKP & Kohir Terbit, Siap Bayar
      } else if (obj.verif2 === 1) {
        obj.statusBerkas = 3; // Menunggu Verifikasi Kabid
      } else if (obj.verif1 === 1) {
        obj.statusBerkas = 2; // Menunggu Verifikasi Kasie
      } else if (obj.verif1 === 2 || obj.verif2 === 2 || obj.verif3 === 2) {
        obj.statusBerkas = 9; // Ditolak
      } else {
        obj.statusBerkas = 0; // Draft
      }
    }

    dataToInsert.push(obj);
  }

  console.log(`Prepared ${dataToInsert.length} records to insert.`);

  // Insert in batches
  const batchSize = 200;
  let insertedCount = 0;

  for (let i = 0; i < dataToInsert.length; i += batchSize) {
    const batch = dataToInsert.slice(i, i + batchSize);
    const result = await prisma.tblBphtb.createMany({
      data: batch,
      skipDuplicates: true
    });
    insertedCount += result.count;
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dataToInsert.length / batchSize)}: ${result.count} records (Total: ${insertedCount})`);
  }

  // Update PostgreSQL sequence for id_berkas
  try {
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('tbl_bphtb', 'id_berkas'), coalesce(max(id_berkas), 1)) FROM tbl_bphtb;
    `);
    console.log('Successfully updated id_berkas sequence.');
  } catch (seqErr) {
    console.warn('Could not reset sequence (might be non-serial or permission):', seqErr.message);
  }

  const finalCount = await prisma.tblBphtb.count();
  console.log(`\n=== IMPORT COMPLETE ===`);
  console.log(`Total records now in tbl_bphtb: ${finalCount}`);

  // Show sample imported rows
  const samples = await prisma.tblBphtb.findMany({
    take: 3,
    orderBy: { idBerkas: 'asc' }
  });
  console.log('\nSample first 3 records:');
  console.log(JSON.stringify(samples, null, 2));

  const latestSample = await prisma.tblBphtb.findFirst({
    orderBy: { idBerkas: 'desc' }
  });
  console.log('\nLatest record:');
  console.log(JSON.stringify(latestSample, null, 2));
}

runImport()
  .catch(err => {
    console.error('Import failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

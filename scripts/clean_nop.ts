import { prisma } from '../lib/prisma';

async function main() {
  const records = await prisma.tblBphtb.findMany();
  let updatedCount = 0;
  for (const r of records) {
    if (r.nop && /\D/.test(r.nop)) {
      const cleanNop = r.nop.replace(/\D/g, '');
      await prisma.tblBphtb.update({
        where: { idBerkas: r.idBerkas },
        data: { nop: cleanNop },
      });
      console.log(`Updated idBerkas ${r.idBerkas}: ${r.nop} -> ${cleanNop}`);
      updatedCount++;
    }
  }
  console.log(`Pembersihan NOP selesai. Total data diperbarui: ${updatedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

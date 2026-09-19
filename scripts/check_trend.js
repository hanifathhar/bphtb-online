const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.tblBphtb.groupBy({
    by: ['tahun'],
    _count: { idBerkas: true },
    _sum: { bphtb: true, nilaiSudahDibayar: true, nilaiBelumDibayar: true },
    orderBy: { tahun: 'asc' }
  });
  console.log(JSON.stringify(groups, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

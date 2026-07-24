import { prisma } from "../lib/prisma";
import { seedDatabase } from "../lib/seed";

async function main() {
  const result = await seedDatabase(prisma);
  console.log("Seeded:", result);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

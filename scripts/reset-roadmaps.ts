import type { Module } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { seedDatabase } from "../lib/seed";

// Roadmap modules whose topics/checklist tasks are fully owned by the seed.
// Re-running the seed after renaming topics would otherwise leave orphans, so
// we clear roadmap topics + their checklist tasks first, then reseed cleanly.
// User-authored content (projects, notes, articles, interviews) is untouched.
const ROADMAP_MODULES: Module[] = [
  "leetcode",
  "backend",
  "ai",
  "azure",
  "mlops",
  "architect",
  "patterns",
  "claude",
];

async function main() {
  const tasks = await prisma.task.deleteMany({
    where: { module: { in: ROADMAP_MODULES }, topic: { not: null } },
  });
  const topics = await prisma.roadmapTopic.deleteMany({});
  console.log(`Cleared ${tasks.count} roadmap tasks, ${topics.count} topics.`);

  const result = await seedDatabase(prisma);
  console.log("Reseeded:", result);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

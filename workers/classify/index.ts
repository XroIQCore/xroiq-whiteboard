import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastCounts } from "../../packages/shared/libs/broadcast";
import { classifyText } from "../../packages/shared/libs/llm";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processOne() {
  const file = await prisma.file.findFirst({
    where: { status: "deduped", duplicateOf: null },
    orderBy: { updatedAt: "asc" },
  });
  if (!file) return false;

  const result = await classifyText(file.rawText || file.name);
  await prisma.file.update({
    where: { id: file.id },
    data: {
      category: result.category,
      subBucket: result.subBucket,
      status: "classified",
    },
  });

  await broadcastCounts();
  return true;
}

async function main() {
  for (;;) {
    let worked = false;
    try {
      worked = await processOne();
    } catch (error) {
      console.error("[classify]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(worked ? 100 : 3000);
  }
}

main();

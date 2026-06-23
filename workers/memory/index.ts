import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastCounts, broadcastEvent } from "../../packages/shared/libs/broadcast";
import { summariseText } from "../../packages/shared/libs/llm";
import { keywordSet } from "../../packages/shared/libs/arc";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processOne() {
  const file = await prisma.file.findFirst({
    where: { status: "classified", duplicateOf: null },
    orderBy: { updatedAt: "asc" },
  });
  if (!file) return false;

  const text = file.rawText || "";
  const summary = await summariseText(text);
  const keywords = [...keywordSet([file.name, file.category, file.subBucket, summary].filter(Boolean).join(" "))];

  await prisma.memoryEntry.upsert({
    where: { sourceFileId: file.id },
    create: {
      sourceFileId: file.id,
      summary,
      keywords,
      confidence: text ? 0.8 : 0.3,
      status: "active",
    },
    update: {
      summary,
      keywords,
      confidence: text ? 0.8 : 0.3,
      status: "active",
    },
  });

  await prisma.file.update({
    where: { id: file.id },
    data: { summary, status: "memorised" },
  });

  await broadcastEvent("memory_update", { fileId: file.id });
  await broadcastCounts();
  return true;
}

async function main() {
  for (;;) {
    let worked = false;
    try {
      worked = await processOne();
    } catch (error) {
      console.info("[memory] fatal", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(worked ? 100 : 3000);
  }
}

main();

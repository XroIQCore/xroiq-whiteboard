import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastCounts, broadcastEvent } from "../../packages/shared/libs/broadcast";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function surfaceStaleFiles() {
  const staleDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.file.updateMany({
    where: {
      needsAttention: false,
      status: { not: "archived" },
      updatedAt: { lte: staleDate },
    },
    data: { needsAttention: true },
  });

  if (result.count > 0) {
    await broadcastEvent("surfacer_update", { needsAttention: result.count });
    await broadcastCounts();
  }
}

async function main() {
  for (;;) {
    try {
      await surfaceStaleFiles();
    } catch (error) {
      console.error("[surfacer]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(24 * 60 * 60 * 1000);
  }
}

main();

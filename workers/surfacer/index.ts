import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastChannel, broadcastCounts, broadcastEvent } from "../../packages/shared/libs/broadcast";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function surfaceStaleFiles() {
  const staleDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const files = await prisma.file.findMany({
    where: {
      needsAttention: false,
      status: { not: "archived" },
      updatedAt: { lte: staleDate },
    },
    select: { id: true },
    take: 100,
  });
  if (!files.length) return;

  const result = await prisma.file.updateMany({
    where: {
      id: { in: files.map((file) => file.id) },
    },
    data: { needsAttention: true },
  });

  if (result.count > 0) {
    await broadcastEvent("surfacer_update", { needsAttention: result.count });
    await Promise.all(files.map((file) => broadcastChannel("surfacer", "surfacer", { fileId: file.id })));
    await broadcastCounts();
  }
}

async function main() {
  for (;;) {
    try {
      await surfaceStaleFiles();
    } catch (error) {
      console.info("[surfacer] fatal", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(24 * 60 * 60 * 1000);
  }
}

main();

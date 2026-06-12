import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastCounts } from "../../packages/shared/libs/broadcast";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processDuplicates() {
  const duplicateHashes = await prisma.file.groupBy({
    by: ["hash"],
    _count: { hash: true },
    having: { hash: { _count: { gt: 1 } } },
  });

  let created = false;
  for (const duplicate of duplicateHashes) {
    const files = await prisma.file.findMany({
      where: { hash: duplicate.hash },
      orderBy: { createdAt: "asc" },
    });
    if (files.length < 2) continue;

    const alreadyGrouped = await prisma.duplicateItem.findFirst({
      where: { objectType: "File", objectId: files[0].id },
    });
    if (alreadyGrouped) continue;

    const group = await prisma.duplicateGroup.create({
      data: {
        confidence: 1,
        items: {
          create: files.map((file) => ({
            objectType: "File",
            objectId: file.id,
          })),
        },
      },
    });

    await prisma.reviewQueue.create({
      data: {
        objectType: "DuplicateGroup",
        objectId: group.id,
        reason: "Duplicate files",
        status: "unreviewed",
      },
    });
    await broadcastCounts();
    created = true;
  }

  return created;
}

async function main() {
  for (;;) {
    try {
      await processDuplicates();
    } catch (error) {
      console.error("[dedupe]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(10000);
  }
}

main();

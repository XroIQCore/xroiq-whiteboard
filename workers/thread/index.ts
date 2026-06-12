import crypto from "crypto";
import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastCounts } from "../../packages/shared/libs/broadcast";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function threadIdFor(owner: string, intention: string) {
  return crypto.createHash("sha1").update(`${owner}:${intention}`).digest("hex").slice(0, 16);
}

async function linkThreads() {
  const groups = await prisma.moment.groupBy({
    by: ["owner", "intention"],
    where: {
      intention: { not: null },
    },
    _count: { id: true },
    having: { id: { _count: { gt: 1 } } },
  });

  let changed = false;
  for (const group of groups) {
    if (!group.intention) continue;
    const threadId = threadIdFor(group.owner, group.intention);
    const result = await prisma.moment.updateMany({
      where: {
        owner: group.owner,
        intention: group.intention,
        threadId: null,
      },
      data: { threadId },
    });
    changed ||= result.count > 0;
  }

  if (changed) await broadcastCounts();
}

async function main() {
  for (;;) {
    try {
      await linkThreads();
    } catch (error) {
      console.error("[thread]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(60000);
  }
}

main();

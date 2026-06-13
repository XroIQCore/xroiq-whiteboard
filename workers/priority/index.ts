import { prisma } from "../../packages/shared/libs/prisma";
import { scoreMoment } from "../../packages/shared/libs/priority";
import { broadcastCounts, broadcastEvent } from "../../packages/shared/libs/broadcast";
import { writeAuditLog } from "../../packages/shared/libs/audit";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function nextRank(bucket: string) {
  const top = await prisma.priority.findFirst({
    where: { bucket },
    orderBy: { rank: "desc" },
  });
  return (top?.rank || 0) + 1;
}

async function processOne() {
  const moment = await prisma.moment.findFirst({
    where: {
      state: "approved",
      priority: null,
    },
    orderBy: { updatedAt: "desc" },
  });
  if (!moment) return false;

  const scored = scoreMoment(moment);
  const priority = await prisma.priority.create({
    data: {
      momentId: moment.id,
      rank: await nextRank(scored.bucket),
      bucket: scored.bucket,
      reason: scored.reason,
    },
  });

  await writeAuditLog({
    actor: moment.owner,
    event: "priority-create",
    objectType: "Priority",
    objectId: priority.id,
    payload: {
      momentId: moment.id,
      bucket: scored.bucket,
      score: scored.score,
    },
  });
  await broadcastEvent("priority_update", { momentId: moment.id, bucket: scored.bucket });
  await broadcastCounts();
  return true;
}

async function main() {
  for (;;) {
    let worked = false;
    try {
      worked = await processOne();
    } catch (error) {
      console.error("[priority]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(worked ? 100 : 3000);
  }
}

main();

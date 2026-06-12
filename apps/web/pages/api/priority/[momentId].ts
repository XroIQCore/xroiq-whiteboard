import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../packages/shared/libs/prisma";
import { writeAuditLog } from "../../../../../packages/shared/libs/audit";
import { broadcastCounts, broadcastEvent } from "../../../../../packages/shared/libs/broadcast";

const buckets = new Set(["immediate", "soon", "backlog", "archived"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const momentId = Array.isArray(req.query.momentId) ? req.query.momentId[0] : req.query.momentId;
  const { bucket, rank } = req.body || {};
  if (!momentId || (bucket && !buckets.has(bucket))) {
    return res.status(400).json({ error: "Expected a valid momentId and bucket" });
  }

  const current = await prisma.priority.findUnique({
    where: { momentId },
    include: { moment: true },
  });
  if (!current) return res.status(404).json({ error: "Priority not found" });

  const targetBucket = bucket || current.bucket;
  const targetRank = typeof rank === "number" ? rank : current.rank;

  const siblings = await prisma.priority.findMany({
    where: {
      bucket: targetBucket,
      momentId: { not: momentId },
    },
    orderBy: { rank: "asc" },
  });
  const ordered = [...siblings];
  ordered.splice(Math.max(0, targetRank - 1), 0, current);

  const updates = ordered.map((item, index) =>
    prisma.priority.update({
      where: { id: item.id },
      data: {
        bucket: targetBucket,
        rank: index + 1,
      },
    }),
  );
  await prisma.$transaction(updates);

  const priority = await prisma.priority.findUniqueOrThrow({
    where: { momentId },
    include: { moment: true },
  });

  await writeAuditLog({
    actor: priority.moment.owner,
    event: "priority-update",
    objectType: "Priority",
    objectId: priority.id,
    payload: { momentId, bucket: priority.bucket, rank: priority.rank },
  });
  await broadcastEvent("priority_update", { momentId, bucket: priority.bucket });
  await broadcastCounts();

  return res.status(200).json(priority);
}

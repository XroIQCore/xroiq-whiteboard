import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../packages/shared/libs/prisma";
import { writeAuditLog } from "../../../../../packages/shared/libs/audit";
import { broadcastCounts } from "../../../../../packages/shared/libs/broadcast";

const actions = new Set(["approve", "reject", "archive"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const action = req.body?.action;
  if (!id || !actions.has(action)) {
    return res.status(400).json({ error: "Expected action approve, reject, or archive" });
  }

  const item = await prisma.reviewQueue.update({
    where: { id },
    data: { status: action },
  });

  if (item.objectType === "Moment") {
    await prisma.moment.update({
      where: { id: item.objectId },
      data: {
        state: action === "approve" ? "approved" : action === "reject" ? "rejected" : "archived",
        consent: action,
      },
    });
  }

  if (item.objectType === "File") {
    await prisma.reviewLog.create({
      data: {
        fileId: item.objectId,
        userId: "authenticated",
        action,
      },
    });
  }

  await writeAuditLog({
    actor: null,
    event: item.objectType === "Moment" && action === "approve" ? "moment-approved" : `review-${action}`,
    objectType: item.objectType,
    objectId: item.objectId,
    payload: { reviewQueueId: item.id },
  });
  await broadcastCounts();

  return res.status(200).json(item);
}

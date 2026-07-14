import type { NextApiRequest, NextApiResponse } from "next";
import { queryParam, requireMethods } from "../../../lib/api";
import { prisma } from "../../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  const id = queryParam(req.query.id);
  if (!id) return res.status(400).json({ error: "Expected arc id" });

  const arc = await prisma.arc.findUnique({
    where: { id },
    include: { threads: true },
  });
  if (!arc) return res.status(404).json({ error: "Arc not found" });

  const moments = await prisma.moment.findMany({
    where: { threadId: { in: arc.threads.map((thread) => thread.threadId) } },
    include: { priority: true },
    orderBy: { updatedAt: "desc" },
  });

  return res.status(200).json({
    ...arc,
    threads: arc.threads.map((thread) => ({
      ...thread,
      moments: moments.filter((moment) => moment.threadId === thread.threadId),
    })),
  });
}

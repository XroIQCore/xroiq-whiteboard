import type { NextApiRequest, NextApiResponse } from "next";
import { requireMethods } from "../../../lib/api";
import { prisma } from "../../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  const arcs = await prisma.arc.findMany({
    include: { threads: true },
    orderBy: { updatedAt: "desc" },
  });

  const result = await Promise.all(
    arcs.map(async (arc) => {
      const threadIds = arc.threads.map((thread) => thread.threadId);
      const moments = await prisma.moment.count({ where: { threadId: { in: threadIds } } });
      return { ...arc, threadCount: threadIds.length, momentCount: moments };
    }),
  );

  return res.status(200).json(result);
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const threadId = Array.isArray(req.query.threadId) ? req.query.threadId[0] : req.query.threadId;
  const moments = await prisma.moment.findMany({
    where: threadId ? { threadId } : {},
    include: { priority: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return res.status(200).json(moments);
}

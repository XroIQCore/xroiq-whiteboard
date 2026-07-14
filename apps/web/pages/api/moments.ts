import type { NextApiRequest, NextApiResponse } from "next";
import { queryParam, requireMethods } from "../../lib/api";
import { prisma } from "../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  const threadId = queryParam(req.query.threadId);
  const moments = await prisma.moment.findMany({
    where: threadId ? { threadId } : {},
    include: { priority: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return res.status(200).json(moments);
}

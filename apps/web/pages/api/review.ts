import type { NextApiRequest, NextApiResponse } from "next";
import { requireMethods } from "../../lib/api";
import { prisma } from "../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  const items = await prisma.reviewQueue.findMany({
    where: { status: "unreviewed" },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return res.status(200).json(items);
}

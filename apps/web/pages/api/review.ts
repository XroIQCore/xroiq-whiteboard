import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const items = await prisma.reviewQueue.findMany({
    where: { status: "unreviewed" },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return res.status(200).json(items);
}

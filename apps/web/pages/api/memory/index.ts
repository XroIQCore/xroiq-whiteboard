import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const entries = await prisma.memoryEntry.findMany({
    where: q
      ? {
          OR: [
            { summary: { contains: q, mode: "insensitive" } },
            { sourceFile: { name: { contains: q, mode: "insensitive" } } },
            { sourceFile: { rawText: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { sourceFile: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return res.status(200).json({ entries });
}

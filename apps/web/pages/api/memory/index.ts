import type { NextApiRequest, NextApiResponse } from "next";
import { queryParam, requireMethods } from "../../../lib/api";
import { prisma } from "../../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  const q = queryParam(req.query.q);
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

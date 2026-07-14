import type { NextApiRequest, NextApiResponse } from "next";
import { queryParam, requireMethods } from "../../lib/api";
import { prisma } from "../../../../packages/shared/libs/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  const q = queryParam(req.query.q);
  if (!q) return res.status(200).json({ files: [] });

  const files = await prisma.file.findMany({
    where: {
      status: { not: "archived" },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { rawText: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { subBucket: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return res.status(200).json({ files });
}

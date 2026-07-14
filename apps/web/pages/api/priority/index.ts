import type { NextApiRequest, NextApiResponse } from "next";
import { requireMethods } from "../../../lib/api";
import { prisma } from "../../../../../packages/shared/libs/prisma";

const buckets = ["immediate", "soon", "backlog", "archived"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  const priorities = await prisma.priority.findMany({
    include: { moment: true },
    orderBy: [{ bucket: "asc" }, { rank: "asc" }],
  });
  const grouped = Object.fromEntries(buckets.map((bucket) => [bucket, []]));

  for (const priority of priorities) {
    const bucket = grouped[priority.bucket];
    if (bucket) bucket.push(priority);
  }

  return res.status(200).json({
    counts: Object.fromEntries(buckets.map((bucket) => [bucket, grouped[bucket].length])),
    buckets: grouped,
  });
}

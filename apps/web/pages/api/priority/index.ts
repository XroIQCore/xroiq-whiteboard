import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../packages/shared/libs/prisma";

const buckets = ["immediate", "soon", "backlog", "archived"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const priorities = await prisma.priority.findMany({
    include: { moment: true },
    orderBy: [{ bucket: "asc" }, { rank: "asc" }],
  });

  return res.status(200).json({
    counts: Object.fromEntries(buckets.map((bucket) => [bucket, priorities.filter((item) => item.bucket === bucket).length])),
    buckets: Object.fromEntries(buckets.map((bucket) => [bucket, priorities.filter((item) => item.bucket === bucket)])),
  });
}

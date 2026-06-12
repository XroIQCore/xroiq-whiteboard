import type { NextApiRequest, NextApiResponse } from "next";
import { getWhiteboardCounts } from "../../../../packages/shared/libs/counts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json(await getWhiteboardCounts());
}

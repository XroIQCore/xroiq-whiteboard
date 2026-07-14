import type { NextApiRequest, NextApiResponse } from "next";
import { requireMethods } from "../../lib/api";
import { getWhiteboardCounts } from "../../../../packages/shared/libs/counts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET"])) return;

  return res.status(200).json(await getWhiteboardCounts());
}

import type { NextApiRequest, NextApiResponse } from "next";
import { isRecord, requireMethods } from "../../lib/api";
import { prisma } from "../../../../packages/shared/libs/prisma";

const preferenceId = "default";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["GET", "PATCH"])) return;

  if (req.method === "GET") {
    const record = await prisma.userPref.findUnique({ where: { id: preferenceId } });
    return res.status(200).json({ prefs: record?.prefs || {} });
  }

  if (req.method === "PATCH") {
    const prefs = isRecord(req.body?.prefs) ? req.body.prefs : null;
    if (!prefs) return res.status(400).json({ error: "Expected prefs object" });

    const current = await prisma.userPref.findUnique({ where: { id: preferenceId } });
    const existing = isRecord(current?.prefs) ? current?.prefs : {};
    const record = await prisma.userPref.upsert({
      where: { id: preferenceId },
      create: { id: preferenceId, prefs: { ...existing, ...prefs } },
      update: { prefs: { ...existing, ...prefs } },
    });
    return res.status(200).json({ prefs: record.prefs });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../packages/shared/libs/prisma";

const preferenceId = "default";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const record = await prisma.userPref.findUnique({ where: { id: preferenceId } });
    return res.status(200).json({ prefs: record?.prefs || {} });
  }

  if (req.method === "PATCH") {
    const prefs = isObject(req.body?.prefs) ? req.body.prefs : null;
    if (!prefs) return res.status(400).json({ error: "Expected prefs object" });

    const current = await prisma.userPref.findUnique({ where: { id: preferenceId } });
    const existing = isObject(current?.prefs) ? current?.prefs : {};
    const record = await prisma.userPref.upsert({
      where: { id: preferenceId },
      create: { id: preferenceId, prefs: { ...existing, ...prefs } },
      update: { prefs: { ...existing, ...prefs } },
    });
    return res.status(200).json({ prefs: record.prefs });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}

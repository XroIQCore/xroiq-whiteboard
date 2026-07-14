import type { NextApiRequest, NextApiResponse } from "next";

export function requireMethods(req: NextApiRequest, res: NextApiResponse, allowed: string[]) {
  if (allowed.includes(req.method || "")) {
    return true;
  }

  res.setHeader("Allow", allowed.join(", "));
  res.status(405).json({ error: "Method not allowed" });
  return false;
}

export function queryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

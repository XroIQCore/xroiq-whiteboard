import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { Parser } from "json2csv";
import { prisma } from "../../../../packages/shared/libs/prisma";
import { exportsBucket, getSignedUrl, uploadFile } from "../../../../packages/shared/libs/storage";
import { writeAuditLog } from "../../../../packages/shared/libs/audit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, format = "json", bucket, owner } = req.body || {};
  if (!["moments", "arcs"].includes(type) || !["json", "csv"].includes(format)) {
    return res.status(400).json({ error: "Expected type moments|arcs and format json|csv" });
  }

  const rows =
    type === "moments"
      ? await prisma.moment.findMany({
          where: {
            ...(owner ? { owner } : {}),
            ...(bucket ? { priority: { bucket } } : {}),
          },
          include: { priority: true },
          orderBy: { updatedAt: "desc" },
        })
      : await prisma.arc.findMany({
          where: owner ? { owner } : {},
          include: { threads: true },
          orderBy: { updatedAt: "desc" },
        });

  const body = format === "csv" ? new Parser().parse(rows) : JSON.stringify(rows, null, 2);
  const storagePath = `exports/${type}-${Date.now()}-${crypto.randomUUID()}.${format}`;
  await uploadFile(Buffer.from(body, "utf8"), storagePath, exportsBucket, format === "csv" ? "text/csv" : "application/json");
  const signedUrl = await getSignedUrl(storagePath, exportsBucket, 60 * 60 * 24);

  await writeAuditLog({
    event: "export-create",
    objectType: "Export",
    objectId: storagePath,
    payload: { type, format, bucket, owner, rows: rows.length },
  });

  return res.status(200).json({ signedUrl, storagePath, rows: rows.length });
}

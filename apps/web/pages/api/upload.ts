import crypto from "crypto";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import formidable, { File as FormidableFile } from "formidable";
import { requireMethods } from "../../lib/api";
import { prisma } from "../../../../packages/shared/libs/prisma";
import { broadcastCounts } from "../../../../packages/shared/libs/broadcast";
import { writeAuditLog } from "../../../../packages/shared/libs/audit";
import { ensureFilesDir, filesDir, hashBuffer, safeOriginalName, uploadFile } from "../../../../packages/shared/libs/storage";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: NextApiRequest) {
  await ensureFilesDir();
  const uploadDir = path.join(filesDir, ".tmp", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const form = formidable({ multiples: true, keepExtensions: true, uploadDir });
  return new Promise<FormidableFile[]>((resolve, reject) => {
    form.parse(req, (error, _fields, files) => {
      if (error) return reject(error);
      const raw = files.files;
      const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
      resolve(list);
    });
  });
}

function uploadErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Upload failed";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethods(req, res, ["POST"])) return;

  try {
    const owner = "local";
    const uploaded = await parseForm(req);
    if (!uploaded.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const rows = [];
    for (const file of uploaded) {
      const originalName = safeOriginalName(file.originalFilename || "upload");
      const storagePath = `${owner}/${crypto.randomUUID()}_${originalName}`;
      const buffer = await fs.promises.readFile(file.filepath);
      await uploadFile(buffer, storagePath, "whiteboard-originals", file.mimetype || undefined);
      const row = await prisma.file.create({
        data: {
          owner,
          name: originalName,
          type: file.mimetype || "application/octet-stream",
          size: file.size,
          hash: hashBuffer(buffer),
          storagePath,
          status: "new",
        },
      });
      await writeAuditLog({
        actor: owner,
        event: "upload",
        objectType: "File",
        objectId: row.id,
        payload: { name: originalName, storagePath },
      });
      rows.push(row);
    }

    await broadcastCounts();
    return res.status(200).json({ files: rows });
  } catch (error) {
    console.error("Upload failed", error);
    return res.status(500).json({ error: uploadErrorMessage(error) });
  }
}

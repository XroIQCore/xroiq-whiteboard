import path from "path";
import AdmZip from "adm-zip";
import pdf from "pdf-parse";
import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastCounts } from "../../packages/shared/libs/broadcast";
import { writeAuditLog } from "../../packages/shared/libs/audit";
import {
  downloadFile,
  extractedTextBucket,
  hashBuffer,
  safeOriginalName,
  uploadFile,
} from "../../packages/shared/libs/storage";

const directExtensions = new Set([".txt", ".md", ".csv"]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractText(fileName: string, storagePath: string) {
  const ext = path.extname(fileName || storagePath).toLowerCase();
  const buffer = await downloadFile(storagePath);
  if (directExtensions.has(ext)) {
    return buffer.toString("utf8");
  }
  if (ext === ".pdf") {
    const parsed = await pdf(buffer);
    return parsed.text;
  }
  return "";
}

function safeZipStoragePath(owner: string, fileId: string, entryName: string) {
  const sanitizedParts = entryName
    .split(/[\\/]+/)
    .map((part) => safeOriginalName(part))
    .filter(Boolean);
  if (!sanitizedParts.length) return null;
  return `${owner}/unzipped/${fileId}/${sanitizedParts.join("/")}`;
}

async function ingestZipEntries(file: { id: string; owner: string; storagePath: string }) {
  const zip = new AdmZip(await downloadFile(file.storagePath));

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;

    const storagePath = safeZipStoragePath(file.owner, file.id, entry.entryName);
    if (!storagePath) continue;

    const buffer = entry.getData();
    await uploadFile(buffer, storagePath, "whiteboard-originals");
    await prisma.file.create({
      data: {
        owner: file.owner,
        name: entry.entryName,
        type: path.extname(entry.entryName).toLowerCase() || "application/octet-stream",
        size: entry.header.size,
        hash: hashBuffer(buffer),
        storagePath,
        status: "new",
      },
    });
  }

  await prisma.file.update({
    where: { id: file.id },
    data: { status: "archived" },
  });
  await broadcastCounts();
}

async function processOne() {
  const file = await prisma.file.findFirst({
    where: { status: "new" },
    orderBy: { createdAt: "asc" },
  });
  if (!file) return false;

  if (path.extname(file.name || file.storagePath).toLowerCase() === ".zip") {
    await ingestZipEntries(file);
    return true;
  }

  const content = await extractText(file.name, file.storagePath);
  const extractedPath = `${file.owner}/extracted/${file.id}.txt`;
  await uploadFile(Buffer.from(content, "utf8"), extractedPath, extractedTextBucket, "text/plain");
  await prisma.extractedContent.create({
    data: {
      fileId: file.id,
      content,
      storagePath: extractedPath,
      confidence: content ? 1 : 0,
    },
  });
  await prisma.file.update({
    where: { id: file.id },
    data: { status: "extracted" },
  });
  await writeAuditLog({
    actor: file.owner,
    event: "file-extracted",
    objectType: "File",
    objectId: file.id,
    payload: { extractedPath },
  });
  await broadcastCounts();
  return true;
}

async function main() {
  for (;;) {
    let worked = false;
    try {
      worked = await processOne();
    } catch (error) {
      console.error("[ingestion]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(worked ? 100 : 3000);
  }
}

main();

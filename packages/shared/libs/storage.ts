import crypto from "crypto";
import fs from "fs";
import path from "path";

export const filesDir = process.env.XROIQ_FILES_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "files");
export const originalsBucket = "whiteboard-originals";
export const extractedTextBucket = "whiteboard-extracted-text";
export const exportsBucket = "whiteboard-exports";

export async function ensureFilesDir() {
  await fs.promises.mkdir(filesDir, { recursive: true });
}

function localPathFor(storagePath: string, bucket: string) {
  const resolvedRoot = path.resolve(/*turbopackIgnore: true*/ filesDir);
  const resolvedPath = path.resolve(resolvedRoot, bucket, storagePath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Storage path escapes the local files directory");
  }
  return resolvedPath;
}

export function safeOriginalName(name: string) {
  return path.basename(name).replace(/[^\w.\- ]+/g, "_");
}

export async function hashFile(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

export function hashBuffer(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function uploadFile(buffer: Buffer, storagePath: string, bucket = originalsBucket, contentType?: string) {
  void contentType;
  const destination = localPathFor(storagePath, bucket);
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.writeFile(destination, buffer);
  return storagePath;
}

export async function downloadFile(storagePath: string, bucket = originalsBucket) {
  return fs.promises.readFile(localPathFor(storagePath, bucket));
}

export async function getSignedUrl(storagePath: string, bucket = originalsBucket, expiresIn = 60 * 15) {
  void expiresIn;
  return `file://${localPathFor(storagePath, bucket)}`;
}

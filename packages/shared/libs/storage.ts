import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "./supabase";

export type StorageBackend = "local" | "supabase";

export const filesDir = process.env.XROIQ_FILES_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "files");
export const originalsBucket = "whiteboard-originals";
export const extractedTextBucket = "whiteboard-extracted-text";
export const exportsBucket = "whiteboard-exports";

export async function ensureFilesDir() {
  await fs.promises.mkdir(filesDir, { recursive: true });
}

function storageBackend(): StorageBackend {
  const value = process.env.XROIQ_STORAGE_BACKEND || "local";
  if (value !== "local" && value !== "supabase") {
    throw new Error("XROIQ_STORAGE_BACKEND must be local or supabase");
  }
  return value;
}

function assertLocalStorageAllowed() {
  if (process.env.RENDER) {
    throw new Error("Local file storage is enabled, but this app is running on Render. Run the whiteboard locally with XROIQ_FILES_DIR pointing at your drive, or explicitly set XROIQ_STORAGE_BACKEND=supabase.");
  }
}

function localPathFor(storagePath: string, bucket: string) {
  assertLocalStorageAllowed();
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
  if (storageBackend() === "local") {
    const destination = localPathFor(storagePath, bucket);
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.writeFile(destination, buffer);
    return storagePath;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  return storagePath;
}

export async function downloadFile(storagePath: string, bucket = originalsBucket) {
  if (storageBackend() === "local") {
    return fs.promises.readFile(localPathFor(storagePath, bucket));
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

export async function getSignedUrl(storagePath: string, bucket = originalsBucket, expiresIn = 60 * 15) {
  if (storageBackend() === "local") {
    return `file://${localPathFor(storagePath, bucket)}`;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

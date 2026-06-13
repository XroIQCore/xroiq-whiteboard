import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "./supabase";

export const filesDir = path.join(process.cwd(), "data", "files");
export const originalsBucket = "whiteboard-originals";
export const extractedTextBucket = "whiteboard-extracted-text";
export const exportsBucket = "whiteboard-exports";

export async function ensureFilesDir() {
  await fs.promises.mkdir(filesDir, { recursive: true });
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
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  return storagePath;
}

export async function downloadFile(storagePath: string, bucket = originalsBucket) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

export async function getSignedUrl(storagePath: string, bucket = originalsBucket, expiresIn = 60 * 15) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

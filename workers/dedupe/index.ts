import { prisma } from "../../packages/shared/libs/prisma";
import { broadcastCounts } from "../../packages/shared/libs/broadcast";
import { embedText } from "../../packages/shared/libs/llm";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function vectorLiteral(values: number[]) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

async function nearestVectorDuplicate(embedding: number[], fileId: string) {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `select id from file_vector where id <> $1 and vec <=> $2::vector <= 0.10 order by vec <=> $2::vector limit 1`,
      fileId,
      vectorLiteral(embedding),
    );
    return rows[0]?.id || null;
  } catch {
    return null;
  }
}

async function upsertVector(fileId: string, embedding: number[]) {
  try {
    await prisma.$executeRawUnsafe(
      `insert into file_vector (id, vec) values ($1, $2::vector) on conflict (id) do update set vec = excluded.vec`,
      fileId,
      vectorLiteral(embedding),
    );
  } catch {
    // pgvector may be unavailable in local dev; exact dedupe still runs.
  }
}

async function processOne() {
  const file = await prisma.file.findFirst({
    where: { status: "ingested" },
    orderBy: { updatedAt: "asc" },
  });
  if (!file) return false;

  const exact = await prisma.file.findFirst({
    where: {
      id: { not: file.id },
      hash: file.hash,
      status: { not: "new" },
    },
    orderBy: { createdAt: "asc" },
  });

  const embedding = await embedText(file.rawText || file.name);
  const semanticId = embedding ? await nearestVectorDuplicate(embedding, file.id) : null;
  const duplicateOf = exact?.id || semanticId || null;

  if (embedding) await upsertVector(file.id, embedding);

  await prisma.file.update({
    where: { id: file.id },
    data: {
      duplicateOf,
      status: duplicateOf ? "archived" : "deduped",
    },
  });

  if (duplicateOf) {
    await prisma.reviewQueue.create({
      data: {
        objectType: "File",
        objectId: file.id,
        reason: "Duplicate file",
        status: "unreviewed",
      },
    });
  }

  await broadcastCounts();
  return true;
}

async function main() {
  for (;;) {
    let worked = false;
    try {
      worked = await processOne();
    } catch (error) {
      console.error("[dedupe]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(worked ? 100 : 3000);
  }
}

main();

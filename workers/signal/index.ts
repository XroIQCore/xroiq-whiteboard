import { prisma } from "../../packages/shared/libs/prisma";
import { writeAuditLog } from "../../packages/shared/libs/audit";
import { broadcastCounts } from "../../packages/shared/libs/broadcast";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkByTokens(text: string, maxTokens = 1000) {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (!tokens.length) return [""];
  const chunks: string[] = [];
  for (let index = 0; index < tokens.length; index += maxTokens) {
    chunks.push(tokens.slice(index, index + maxTokens).join(" "));
  }
  return chunks;
}

async function processOne() {
  const extracted = await prisma.extractedContent.findFirst({
    where: { signals: { none: {} } },
    orderBy: { createdAt: "asc" },
  });
  if (!extracted) return false;

  const chunks = chunkByTokens(extracted.content);
  await prisma.$transaction(
    chunks.map((content) =>
      prisma.signal.create({
        data: {
          extractedContentId: extracted.id,
          content,
          confidence: content ? extracted.confidence : 0,
          status: "new",
        },
      }),
    ),
  );
  await writeAuditLog({
    event: "signal-create",
    objectType: "ExtractedContent",
    objectId: extracted.id,
    payload: { chunks: chunks.length },
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
      console.info("[signal] fatal", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(worked ? 100 : 3000);
  }
}

main();

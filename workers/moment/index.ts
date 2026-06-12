import { prisma } from "../../packages/shared/libs/prisma";
import { chatCompletion } from "../../packages/shared/libs/openai";
import { writeAuditLog } from "../../packages/shared/libs/audit";
import { broadcastCounts } from "../../packages/shared/libs/broadcast";

type MomentJson = {
  context?: string;
  intention?: string;
  need?: string;
  title?: string;
  confidence?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseMomentJson(raw: string): MomentJson {
  const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    return { context: "", intention: "", need: "", title: "", confidence: 0.5 };
  }
}

async function processOne() {
  const signal = await prisma.signal.findFirst({
    where: { status: "new" },
    orderBy: { createdAt: "asc" },
    include: { extractedContent: { include: { file: true } } },
  });
  if (!signal) return false;

  const prompt = [
    "Return only JSON with keys context, intention, need, title, confidence.",
    "Summarize this evidence as a candidate XROIQ moment:",
    signal.content,
  ].join("\n\n");

  const parsed = parseMomentJson(await chatCompletion(prompt));
  const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.5;

  const moment = await prisma.moment.create({
    data: {
      title: parsed.title || null,
      owner: signal.extractedContent.file.owner,
      context: parsed.context || signal.content.slice(0, 500),
      intention: parsed.intention || null,
      need: parsed.need || null,
      state: "candidate",
      consent: "unreviewed",
      outcome: null,
      confidence,
    },
  });

  await prisma.momentEvidence.create({
    data: {
      momentId: moment.id,
      signalId: signal.id,
      fileId: signal.extractedContent.fileId,
    },
  });

  await prisma.signal.update({
    where: { id: signal.id },
    data: { status: "processed" },
  });

  await prisma.reviewQueue.create({
    data: {
      objectType: "Moment",
      objectId: moment.id,
      reason: "New Candidate Moment",
      status: "unreviewed",
    },
  });
  await writeAuditLog({
    actor: signal.extractedContent.file.owner,
    event: "moment-candidate",
    objectType: "Moment",
    objectId: moment.id,
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
      console.error("[moment]", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(worked ? 100 : 3000);
  }
}

main();

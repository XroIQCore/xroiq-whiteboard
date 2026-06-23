import { prisma } from "../../packages/shared/libs/prisma";
import { chatCompletion } from "../../packages/shared/libs/openai";
import { parseArcSummary, keywordSet, overlaps } from "../../packages/shared/libs/arc";
import { broadcastCounts, broadcastEvent } from "../../packages/shared/libs/broadcast";
import { writeAuditLog } from "../../packages/shared/libs/audit";

type ThreadBundle = {
  owner: string;
  threadId: string;
  text: string;
  keywords: Set<string>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadThreadBundles() {
  const moments = await prisma.moment.findMany({
    where: {
      state: "approved",
      threadId: { not: null },
    },
    orderBy: { updatedAt: "desc" },
  });

  const byThread = new Map<string, ThreadBundle>();
  for (const moment of moments) {
    if (!moment.threadId) continue;
    const key = `${moment.owner}:${moment.threadId}`;
    const existing = byThread.get(key);
    const text = [moment.title, moment.context, moment.intention, moment.need].filter(Boolean).join(" ");
    if (existing) {
      existing.text += `\n${text}`;
      existing.keywords = keywordSet(existing.text);
    } else {
      byThread.set(key, {
        owner: moment.owner,
        threadId: moment.threadId,
        text,
        keywords: keywordSet(text),
      });
    }
  }
  return [...byThread.values()];
}

function groupBundles(bundles: ThreadBundle[]) {
  const groups: ThreadBundle[][] = [];
  for (const bundle of bundles) {
    const group = groups.find((candidate) => candidate[0]?.owner === bundle.owner && candidate.some((item) => overlaps(item.keywords, bundle.keywords)));
    if (group) group.push(bundle);
    else groups.push([bundle]);
  }
  return groups.filter((group) => group.length > 1);
}

async function processGroups() {
  const groups = groupBundles(await loadThreadBundles());
  let changed = false;

  for (const group of groups) {
    const alreadyLinked = await prisma.arcThread.findFirst({
      where: { threadId: group[0].threadId },
    });
    if (alreadyLinked) continue;

    const prompt = [
      "Summarise these threads into a single narrative arc. Return only JSON with keys title, summary, confidence.",
      group.map((thread) => `Thread ${thread.threadId}:\n${thread.text}`).join("\n\n"),
    ].join("\n\n");
    const parsed = parseArcSummary(await chatCompletion(prompt));
    const arc = await prisma.arc.create({
      data: {
        owner: group[0].owner,
        title: parsed.title || "Untitled arc",
        summary: parsed.summary || group.map((thread) => thread.text).join("\n\n").slice(0, 1000),
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
        status: "draft",
        threads: {
          create: group.map((thread) => ({ threadId: thread.threadId })),
        },
      },
    });

    await writeAuditLog({
      actor: group[0].owner,
      event: "arc-create",
      objectType: "Arc",
      objectId: arc.id,
      payload: { threadIds: group.map((thread) => thread.threadId) },
    });
    await broadcastEvent("arc_update", { arcId: arc.id, owner: arc.owner });
    changed = true;
  }

  if (changed) await broadcastCounts();
}

async function main() {
  for (;;) {
    try {
      await processGroups();
    } catch (error) {
      console.info("[arc] fatal", error);
    } finally {
      await prisma.$disconnect();
    }
    await sleep(5 * 60 * 1000);
  }
}

main();

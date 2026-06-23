import { prisma } from "./prisma";

export async function getWhiteboardCounts() {
  const [filesNew, candidateMoments, topPriorityMoments, reviewQueue, duplicateGroups, memoryEntries, needsAttention] = await Promise.all([
    prisma.file.count({ where: { status: "new" } }),
    prisma.moment.count({ where: { state: "candidate" } }),
    prisma.priority.count({ where: { bucket: "immediate" } }),
    prisma.reviewQueue.count({ where: { status: "unreviewed" } }),
    prisma.duplicateGroup.count(),
    prisma.memoryEntry.count({ where: { status: { not: "archived" } } }),
    prisma.file.count({ where: { needsAttention: true } }),
  ]);

  return { filesNew, candidateMoments, topPriorityMoments, reviewQueue, duplicateGroups, memoryEntries, needsAttention };
}

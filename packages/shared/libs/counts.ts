import { prisma } from "./prisma";

export async function getWhiteboardCounts() {
  const [filesNew, candidateMoments, reviewQueue, duplicateGroups] = await Promise.all([
    prisma.file.count({ where: { status: "new" } }),
    prisma.moment.count({ where: { state: "candidate" } }),
    prisma.reviewQueue.count({ where: { status: "unreviewed" } }),
    prisma.duplicateGroup.count(),
  ]);

  return { filesNew, candidateMoments, reviewQueue, duplicateGroups };
}

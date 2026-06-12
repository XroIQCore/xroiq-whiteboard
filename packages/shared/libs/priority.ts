import type { Moment } from "@prisma/client";

export type PriorityBucket = "immediate" | "soon" | "backlog" | "archived";

const urgentWords = ["blocked", "urgent", "risk", "deadline", "broken", "critical", "must", "now"];
const impactWords = ["revenue", "customer", "client", "launch", "security", "trust", "retention", "team"];
const backlogWords = ["nice", "later", "maybe", "someday", "explore", "optional"];

function countMatches(text: string, words: string[]) {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

export function scoreMoment(moment: Moment) {
  const text = [moment.title, moment.context, moment.intention, moment.need, moment.state, moment.outcome]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = Math.round((moment.confidence || 0.5) * 35);
  score += countMatches(text, urgentWords) * 14;
  score += countMatches(text, impactWords) * 10;
  score += moment.need ? 12 : 0;
  score += moment.intention ? 8 : 0;
  score += moment.state === "approved" ? 10 : 0;
  score -= countMatches(text, backlogWords) * 10;
  score = Math.max(0, Math.min(100, score));

  const bucket: PriorityBucket = score > 80 ? "immediate" : score >= 60 ? "soon" : "backlog";
  const reason = `Score ${score}: confidence, need, intention, state, and keyword signals.`;
  return { score, bucket, reason };
}

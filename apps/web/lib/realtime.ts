import type { SupabaseClient } from "@supabase/supabase-js";

export type WhiteboardCounts = {
  filesNew: number;
  candidateMoments: number;
  topPriorityMoments: number;
  reviewQueue: number;
  duplicateGroups: number;
  memoryEntries: number;
  needsAttention: number;
};

export function subscribeToCounts(
  supabase: SupabaseClient,
  onCounts: (payload: WhiteboardCounts) => void,
) {
  const channel = supabase
    .channel("whiteboard_counts")
    .on("broadcast", { event: "counts" }, ({ payload }) => onCounts(payload as WhiteboardCounts))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSurfacer(
  supabase: SupabaseClient,
  onFile: (payload: { fileId?: string }) => void,
) {
  const channel = supabase
    .channel("surfacer")
    .on("broadcast", { event: "surfacer" }, ({ payload }) => onFile(payload as { fileId?: string }))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

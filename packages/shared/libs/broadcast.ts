import { getSupabaseAdmin } from "./supabase";
import { getWhiteboardCounts } from "./counts";

export async function broadcastCounts() {
  try {
    const supabase = getSupabaseAdmin();
    const payload = await getWhiteboardCounts();
    await supabase.channel("whiteboard_counts").send({
      type: "broadcast",
      event: "counts",
      payload,
    });
  } catch (error) {
    console.warn("[realtime] counts broadcast skipped", error);
  }
}

export async function broadcastEvent(event: string, payload: Record<string, unknown>) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.channel("whiteboard_counts").send({
      type: "broadcast",
      event,
      payload,
    });
  } catch (error) {
    console.warn(`[realtime] ${event} broadcast skipped`, error);
  }
}

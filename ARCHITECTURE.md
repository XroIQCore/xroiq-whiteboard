# XROIQ Whiteboard Architecture

## Priority & Arc Logic

Phase 4 adds a narrative layer on top of the Moment pipeline.

The Priority worker reads approved Moments that do not yet have a `Priority` row. It scores each Moment from 0-100 using confidence, need, intention, state, and urgency/impact keywords. Scores above 80 go to `immediate`, scores from 60-80 go to `soon`, and lower scores go to `backlog`. Manual moves through `/api/priority/[momentId]` can change bucket or rank. Every worker-created or manually-updated priority writes an `audit_log` row and emits a realtime `priority_update` event.

The Arc worker runs every five minutes. It groups approved threaded Moments by `owner` and overlapping context keywords, then asks the OpenAI helper to summarise related Threads as one narrative Arc. The output is stored in `arcs`, and the participating thread IDs are linked through `arc_thread`. If `OPENAI_API_KEY` is blank, the existing OpenAI stub keeps the worker deterministic for local development.

The Priority Board at `/priority` shows buckets for Immediate, Soon, Backlog, and Archived. Cards can be dragged within the visible bucket to adjust rank, or moved across buckets with the card controls. The Arc Explorer at `/arcs` shows expandable Arcs with their Threads and links into `/moments?threadId=...`.

Exports are handled by `/api/export`. The route supports filtered Moment exports and Arc exports in JSON or CSV, stores the generated file in the `whiteboard-exports` Supabase Storage bucket, and returns a one-day signed URL.

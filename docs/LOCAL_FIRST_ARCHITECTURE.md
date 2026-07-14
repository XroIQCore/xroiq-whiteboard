# XROIQ Whiteboard Local-First Reset

## Outcome

The private XROIQ whiteboard is a local document triage hub. It should accept files, notes, emails, PDFs, Word documents, and other source material from wherever Jess or Karne find them, process them into the whiteboard workflow, and save kept/clean outputs to a local folder on an external drive.

Private source files must not be uploaded to Render, Supabase Storage, or any other cloud object store by default.

## Current Direction

- The whiteboard runs on a trusted local machine that can access the external drive.
- Other devices can upload through the local network to that machine, for example from a phone or another PC using the host machine's LAN address.
- Original files, extracted text, and exports are stored through the local storage backend under `XROIQ_FILES_DIR`.
- Supabase Storage is opt-in only with `XROIQ_STORAGE_BACKEND=supabase`.
- Render is not part of the private-file workflow. A Render-hosted app cannot write to a local external drive.

## Local Hub Model

The intended deployment for the private version is:

1. A home-base machine runs the web app and workers.
2. The external drive is mounted on that machine.
3. `.env.local` points `XROIQ_FILES_DIR` at the folder on that drive.
4. Jess and Karne open the local app from nearby devices when they need to upload scattered material.
5. Workers process queued files and write extracted text/metadata back to the local database and local file folder.
6. Clean retained outputs are organized into the chosen local destination folder.

## What Each Piece Should Do

### File Bytes

Local only by default.

- Originals: local folder under `XROIQ_FILES_DIR/whiteboard-originals`.
- Extracted text: local folder under `XROIQ_FILES_DIR/whiteboard-extracted-text`.
- Exports: local folder under `XROIQ_FILES_DIR/whiteboard-exports`.
- Supabase Storage: future public/SaaS option only.

### Database

The database stores metadata and workflow state, not the raw private file bytes.

Current implementation uses Prisma against Postgres. For the private build, the safest near-term database is local Postgres, either through Supabase local development or a plain local Postgres container. Longer term, if vector search requirements permit, this can be revisited for a simpler embedded local database.

### Auth

Cloud OAuth/invite auth is not essential for a private local hub. For the private version, a simpler local access model is preferable:

- Localhost-only mode for single-machine use.
- LAN allowlist or simple local passphrase if phones/other PCs need upload access.
- Supabase Auth remains useful only if the app is intentionally cloud-hosted later.

### Workers

Workers should run locally on the same machine as the app and external drive. Render background workers are not useful for local file processing because they cannot access the external drive.

### LLM

The LLM should run locally or through an explicitly approved local/private endpoint. Cloud LLM fallback should stay opt-in.

## Why Render Was The Wrong Fit

Render is useful for hosting a public web app. It is not useful for the private whiteboard's core file flow because:

- Render cannot write to an external drive attached to Jess's machine.
- Render workers cannot access local scattered files except by uploading them to the cloud first.
- Keeping source files private means the upload target must be local.

The existing Render service can be left as a demo shell or removed later, but it should not be treated as the private operating environment.

## Why Supabase Was Only Partly Useful

Supabase bundled several things together: Postgres, Auth, Realtime, and Storage. The private whiteboard does not need Supabase Storage. It may temporarily use local Supabase/Postgres for database and auth during migration, but the desired architecture should not depend on cloud Supabase for private files.

## Migration Plan

1. Stop using the Render URL for private uploads.
2. Run the whiteboard locally and point `XROIQ_FILES_DIR` at the external drive.
3. Keep raw files local through the new local storage backend.
4. Move worker execution local-only.
5. Replace Supabase cloud auth with local access rules.
6. Decide whether to keep local Supabase/Postgres or move to a simpler local database.
7. Remove or quarantine Render deployment configuration once local operation is verified.
8. Rotate any cloud credentials that were created during the Render/Supabase experiment.

## Current Cloud Dependencies To Remove Or Contain

- `render.yaml`: legacy cloud deployment config. Not needed for private local use.
- Supabase Storage: no longer default; keep disabled unless building a future public version.
- Supabase Auth: currently protects pages, but should be replaced by a local access model for the private hub.
- Supabase Realtime: currently used for UI refresh/broadcast niceties; can be replaced with local polling or a local websocket.
- Postgres via Prisma: still needed for metadata/workflow state. Prefer a local Postgres/pgvector database for the private build.
- Render workers: not useful for private file processing. Workers should run on the local hub machine.

## LAN Upload Model

For scattered files on phones, laptops, and other PCs, the local hub should listen on the private network:

```powershell
pnpm dev:lan
```

Then devices on the same trusted network can open the host machine by local IP, for example:

```text
http://192.168.1.25:3000/upload
```

Files selected on those devices are transmitted only across the private network to the local hub machine, then written under `XROIQ_FILES_DIR`.

## Non-Goals For The Private Version

- No cloud object storage for source files.
- No cloud workers for file processing.
- No requirement to support public users.
- No SaaS-style auth unless the product direction changes later.

# XROIQ Whiteboard Local-First Reset

## Outcome

The private XROIQ whiteboard is a local document triage hub. It should accept files, notes, emails, PDFs, Word documents, and other source material from wherever Jess or Karne find them, process them into the whiteboard workflow, and save kept/clean outputs to a local folder on an external drive.

Private source files must not be uploaded to any cloud object store.

## Current Direction

- The whiteboard runs on a trusted local machine that can access the external drive.
- Other devices can upload through the local network to that machine, for example from a phone or another PC using the host machine's LAN address.
- Original files, extracted text, and exports are stored through the local storage backend under `XROIQ_FILES_DIR`.
- Cloud hosting, cloud auth, cloud realtime, and cloud object storage are not part of the private-file workflow.

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
- Cloud object storage: not used in the private build.

### Database

The database stores metadata and workflow state, not the raw private file bytes.

Current implementation uses Prisma against Postgres. For the private build, use plain local Postgres, preferably from `docker-compose.dev.yml`.

### Auth

Cloud OAuth/invite auth is not used for the private local hub. For the private version, a simpler local access model is preferable:

- Localhost-only mode for single-machine use.
- LAN allowlist or simple local passphrase if phones/other PCs need upload access.
- A local passphrase or LAN allowlist can be added later if needed.

### Workers

Workers should run locally on the same machine as the app and external drive. Cloud background workers are not useful for local file processing because they cannot access the external drive.

### LLM

The LLM should run locally or through an explicitly approved local/private endpoint. Cloud LLM fallback should stay opt-in.

## Why Cloud Hosting Was The Wrong Fit

Cloud hosting is useful for a public web app. It is not useful for the private whiteboard's core file flow because:

- A hosted service cannot write to an external drive attached to Jess's machine.
- Hosted workers cannot access local scattered files except by uploading them to the cloud first.
- Keeping source files private means the upload target must be local.

The private operating environment is the local hub machine.

## Why Bundled Cloud Backends Were The Wrong Fit

Bundled cloud backends often combine database, auth, realtime, and storage. The private whiteboard does not need those bundled services. It keeps the database as plain local Postgres and removes cloud auth, storage, and realtime.

## Migration Plan

1. Stop using hosted URLs for private uploads.
2. Run the whiteboard locally and point `XROIQ_FILES_DIR` at the external drive.
3. Keep raw files local through the new local storage backend.
4. Move worker execution local-only.
5. Add local access rules only if the LAN upload surface needs more protection.
6. Decide later whether Postgres should remain or be replaced with a simpler embedded local database.
7. Keep cloud credentials revoked/deleted.

## Current Cloud Dependencies To Remove Or Contain

- Postgres via Prisma: still needed for metadata/workflow state. Prefer a local Postgres/pgvector database for the private build.
- Cloud auth/storage/realtime/deployment files: removed from the private build.

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

# XROIQ Whiteboard

Production-intended dashboard for turning uploaded files into extracted content, signals, candidate moments, review queue items, duplicate groups, and threaded moment clusters.

## Run Sequence

1. Copy `.env.local.example` to `.env.local` and fill in local paths and Supabase keys:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Start Supabase locally:

   ```powershell
   pnpm supabase:start
   pnpm supabase db reset     # drops & replays migrations
   ```

3. Install dependencies:

   ```powershell
   pnpm install
   ```

4. Apply database changes:

   ```powershell
   pnpm prisma:migrate
   ```

5. Start the web app:

   ```powershell
   pnpm dev
   ```

6. In a second terminal, start the workers:

   ```powershell
   pnpm dev:workers
   ```

7. Open:

   - Dashboard: http://localhost:3000
   - Upload: http://localhost:3000/upload
   - Review: http://localhost:3000/review
   - Priority Board: http://localhost:3000/priority
   - Arc Explorer: http://localhost:3000/arcs

Original files are stored locally by default. Set `XROIQ_STORAGE_BACKEND=local` and point `XROIQ_FILES_DIR` at the drive/folder that should hold private documents, for example:

```powershell
$env:XROIQ_STORAGE_BACKEND="local"
$env:XROIQ_FILES_DIR="E:\XROIQ Whiteboard Files"
```

The app refuses local-file storage on Render so private files are not quietly written to cloud instance disk. Supabase Storage is now opt-in only via `XROIQ_STORAGE_BACKEND=supabase`. Workers use `LLM_URL` for local Mistral inference; `OPENAI_API_KEY` is only a fallback for legacy moment and arc completion.

## Local LLM

Place the Q4_K_M GGUF at `models/mistral-7b-instruct-v0.2.Q4_K_M.gguf`, then build the local llama.cpp service:

```powershell
.\scripts\download-mistral.ps1
docker build -f llm.Dockerfile -t xroiq-llm .
$env:LLM_URL="http://localhost:8000"
.\scripts\smoke-llm.ps1
```

For only the local LLM service:

```powershell
docker compose -f docker-compose.dev.yml up llm
```

## Docker Dev

```powershell
docker compose -f docker-compose.dev.yml up
```

### Invite users

1. In Supabase Dashboard -> Auth -> Users -> `Invite user`.
2. Or CLI:

   ```powershell
   supabase auth invite --email jessicaleewatson@gmail.com
   supabase auth invite --email karneyay007@gmail.com
   ```

Public sign-up is disabled. The whitelist migration allows `jessicaleewatson@gmail.com` and `karneyay007@gmail.com`.
Local public sign-up is disabled by `supabase/config.toml`; invite Jess and Karne manually before first use.

### Google sign-in

Enable Google in Supabase Auth and set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` before starting local Supabase. The local Google redirect URI is:

```text
http://127.0.0.1:54321/auth/v1/callback
```

Invite `jessicaleewatson@gmail.com` and `karneyay007@gmail.com`; public sign-up stays disabled.

## Phase-4 workers

## Start all workers (Windows)

```powershell
pnpm run dev:workers
```

Mac and Linux users can still call each worker script directly.

```powershell
pnpm worker:priority
pnpm worker:arc
pnpm worker:memory
pnpm worker:classify
pnpm worker:surfacer
```

`pnpm dev:workers` starts the ingestion, dedupe, classify, and memory worker set on Windows.

# XROIQ Whiteboard

Local-first private dashboard for turning uploaded files into extracted content, signals, candidate moments, review queue items, duplicate groups, and threaded moment clusters.

The private build is intended to run on a trusted local machine with access to the folder or external drive that should hold XROIQ source files. It does not use cloud hosting, cloud auth, or cloud storage. See [Local-First Reset](docs/LOCAL_FIRST_ARCHITECTURE.md).

## Run Sequence

1. Copy `.env.local.example` to `.env.local` and set the local database/file paths:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Start local Postgres:

   ```powershell
   docker compose -f docker-compose.dev.yml up db
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

   To make the app reachable from a phone or another PC on the same private network, run:

   ```powershell
   pnpm dev:lan
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

   From another device on the same network, use the host machine's local IP address, for example `http://192.168.1.25:3000/upload`.

Original files are stored locally. Point `XROIQ_FILES_DIR` at the drive/folder that should hold private documents, for example:

```powershell
$env:XROIQ_FILES_DIR="E:\XROIQ Whiteboard Files"
```

Workers use `LLM_URL` for local Mistral inference; `OPENAI_API_KEY` is only a fallback for legacy moment and arc completion.

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

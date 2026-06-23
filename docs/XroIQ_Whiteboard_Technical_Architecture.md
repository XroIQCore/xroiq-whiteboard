# XroIQ Whiteboard · Technical Architecture (v0.3 — **schema frozen**)

*Prepared for Jess & Karne · 24 Jun 2026*

---
## 1 · High‑Level Overview
```
┌───────────┐   HTTPS     ┌──────────────┐                ┌────────────────┐
│  Browser  │◀──────────▶│ Render Web    │  REST / WS     │  Supabase PG + │
│  (Board)  │            │ Service (Next)│◀──────────────▶│  Storage + RT  │
└───────────┘            └──────▲───────┘                └──────▲──────────┘
                                │                               │
                                │  localhost HTTP              │  pgvector ▸ RLS
                                ▼                               │
                         ┌──────────────┐                      │
                         │  LLM Server  │<──┐                  │
                         │ (Mistral‑7B) │   │ Docker‑bridge     │
                         └──────────────┘   │                  │
                                             │                 │
                      Cron (Render)          │                 │
                ┌──────────────────────────┐ │   Supabase RT   │
                │  Worker Pool             │─┘   channel       │
                │  (Ingest→Dedup→Classify  │
                │   →Memory→Surfacer)      │─ ────────────────┘
                └──────────────────────────┘
```

*Front End* — Next 16 · React 18 · Tailwind (Board + Library tabs).  
*Back End* — Supabase (Postgres, Storage, Auth, Realtime) and Render (web + cron).  
*LLM* — offline Mistral‑7B‑Q4 served via `llama.cpp`; endpoints `/embed`, `/classify`, `/summarise`.

---
## 2 · Key Components
### 2.1 Render Web Service
* API routes: `/api/upload`, `/api/search`, `/api/memory`.
* Uses Supabase JS for auth; subscribes to Realtime.

### 2.2 Worker Pool (Render Cron)
| Worker | Schedule | LLM? | Responsibilities |
|--------|----------|------|------------------|
| **Ingest** | every 5 min | ❌ | Stream‑unzip, ClamAV scan, extract text → `rawText`, set `status='ingested'`. |
| **Dedup** | after Ingest | ✅ `/embed` | SHA‑256 exact + cosine ≤ 0.10 ⇒ set `duplicateOf`, write vector row, archive dupes, `status='deduped'`. |
| **Classify** | after Dedup | ✅ `/classify` | Set `category` + `subBucket`, `status='classified'`. |
| **Memory** | after Classify | ✅ `/summarise` | Write 2‑4 line blurb + keywords into `memory_entries`, `status='memorised'`. |
| **Surfacer** | daily 03:00 | ❌ | Flag any `needsAttention` older than 30 days, broadcast toast. |

### 2.3 LLM Server
* Docker, quantised `mistral‑7b.Q4_K_M.gguf` (~ 800 MB).  
* Exposes `/embed`, `/classify`, `/summarise`; no external network.

### 2.4 Database Schema (frozen)
> **Naming note:** we keep the repo’s original **`"File"` PascalCase table** and **cuid string IDs** to avoid destructive migrations.

```sql
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ENUM
CREATE TYPE category_enum AS ENUM (
  'operating-system','framework','design','task','note','junk'
);

-- PRIMARY FILE TABLE (PascalCase, cuid ID)
CREATE TABLE "File" (
  id            TEXT PRIMARY KEY,           -- cuid()
  owner_id      TEXT NOT NULL,
  hash          TEXT UNIQUE,
  storage_path  TEXT NOT NULL,
  raw_text      TEXT,
  category      category_enum,
  sub_bucket    TEXT,
  needs_attention BOOLEAN DEFAULT false,
  duplicate_of  TEXT REFERENCES "File"(id),
  summary       TEXT,
  status        TEXT DEFAULT 'new',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- VECTOR TABLE
CREATE TABLE file_vector (
  id  TEXT PRIMARY KEY REFERENCES "File"(id) ON DELETE CASCADE,
  vec vector(384)
);

-- MEMORY PROJECTION
CREATE TABLE memory_entries (
  id           TEXT PRIMARY KEY DEFAULT cuid(),
  source_file  TEXT NOT NULL REFERENCES "File"(id) ON DELETE CASCADE,
  arc_id       TEXT,
  summary      TEXT,
  keywords     TEXT[],
  confidence   FLOAT,
  status       TEXT DEFAULT 'active',
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- REVIEW LOG
CREATE TABLE review_log (
  id      TEXT PRIMARY KEY DEFAULT cuid(),
  file_id TEXT REFERENCES "File"(id),
  user_id TEXT NOT NULL,
  action  TEXT,
  ts      TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX file_owner_category_idx ON "File"(owner_id,category);
CREATE INDEX file_tsv_idx ON "File" USING GIN (to_tsvector('english', raw_text));
CREATE INDEX file_vec_idx ON file_vector USING ivfflat (vec) WITH (lists = 100);
```

Row‑level security restricts every table to `owner_id IN ('Jess_ID','Karne_ID')`.

---
## 3 · Data Flow
1. **Upload** — hash client‑side; byte duplicate short‑circuit.  
2. **Ingest** — virus scan → extract text.  
3. **Dedup** — exact & semantic; archive duplicates.  
4. **Classify** — tag category + sub‑bucket.  
5. **Memory** — store blurb + keywords.  
6. **Surfacer** — 30‑day reminders.  
7. **Realtime** — UI updates instantly.

---
## 4 · Security
* RLS ties every row to Jess/Karne.  
* ClamAV quarantine for infected uploads.  
* LLM air‑gapped.  
* Nightly encrypted `pg_dump` off‑site.

---
## 5 · Cost & Scale
* Supabase free tier (500 MB / 1 GB).  
* Render free web + cron (512 MB) ~ 300 files/hr.  
* Upgrade path: bigger Postgres, paid worker dyno, GPU LLM.

---
## 6 · Frozen Parameters
| Item | Value |
|------|-------|
| Sub‑buckets | Enabled |
| Duplicate cosine threshold | 0.10 |
| Highlight TTL | 30 days |
| Virus scan | Enabled |
| Default landing tab | Board |
| Max ingest batch | 50 files |

---
*Spec updated to mirror current repo naming (`"File"` + cuid). All other behaviour unchanged.*


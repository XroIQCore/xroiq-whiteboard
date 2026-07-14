CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "category_enum" AS ENUM ('operating-system', 'framework', 'design', 'task', 'note', 'junk');

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL DEFAULT 'unassigned',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "raw_text" TEXT,
    "category" "category_enum",
    "sub_bucket" TEXT,
    "needs_attention" BOOLEAN NOT NULL DEFAULT false,
    "duplicate_of" TEXT,
    "summary" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_vector" (
    "id" TEXT NOT NULL,
    "vec" vector NOT NULL,

    CONSTRAINT "file_vector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedContent" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "storagePath" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "extractedContentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moment" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL DEFAULT 'unassigned',
    "threadId" TEXT,
    "title" TEXT,
    "context" TEXT NOT NULL,
    "intention" TEXT,
    "need" TEXT,
    "state" TEXT NOT NULL,
    "consent" TEXT NOT NULL,
    "outcome" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MomentEvidence" (
    "id" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "fileId" TEXT,

    CONSTRAINT "MomentEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewQueue" (
    "id" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_log" (
    "id" TEXT NOT NULL,
    "file_id" TEXT,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prefs" (
    "id" TEXT NOT NULL,
    "prefs" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_prefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuplicateGroup" (
    "id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuplicateGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuplicateItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,

    CONSTRAINT "DuplicateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor" TEXT,
    "event" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priorities" (
    "id" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arcs" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_entries" (
    "id" TEXT NOT NULL,
    "source_file" TEXT NOT NULL,
    "arc_id" TEXT,
    "summary" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arc_thread" (
    "id" TEXT NOT NULL,
    "arcId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arc_thread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "File_owner_category_idx" ON "File"("owner", "category");

-- CreateIndex
CREATE INDEX "File_duplicate_of_idx" ON "File"("duplicate_of");

-- CreateIndex
CREATE INDEX "Moment_owner_intention_idx" ON "Moment"("owner", "intention");

-- CreateIndex
CREATE INDEX "Moment_threadId_idx" ON "Moment"("threadId");

-- CreateIndex
CREATE INDEX "review_log_file_id_idx" ON "review_log"("file_id");

-- CreateIndex
CREATE INDEX "review_log_user_id_idx" ON "review_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "audit_log_event_idx" ON "audit_log"("event");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "priorities_momentId_key" ON "priorities"("momentId");

-- CreateIndex
CREATE INDEX "priorities_bucket_rank_idx" ON "priorities"("bucket", "rank");

-- CreateIndex
CREATE INDEX "arcs_owner_status_idx" ON "arcs"("owner", "status");

-- CreateIndex
CREATE UNIQUE INDEX "memory_entries_source_file_key" ON "memory_entries"("source_file");

-- CreateIndex
CREATE INDEX "memory_entries_arc_id_idx" ON "memory_entries"("arc_id");

-- CreateIndex
CREATE INDEX "memory_entries_status_idx" ON "memory_entries"("status");

-- CreateIndex
CREATE INDEX "arc_thread_threadId_idx" ON "arc_thread"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "arc_thread_arcId_threadId_key" ON "arc_thread"("arcId", "threadId");

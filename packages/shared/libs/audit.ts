import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

type AuditInput = {
  actor?: string | null;
  event: string;
  objectType: string;
  objectId?: string | null;
  payload?: Prisma.InputJsonValue;
};

export async function writeAuditLog(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      actor: input.actor || null,
      event: input.event,
      objectType: input.objectType,
      objectId: input.objectId || null,
      payload: input.payload || undefined,
    },
  });
}

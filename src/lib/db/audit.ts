import {
  AuditAction,
  AuditEntityType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/db/client";

export type AuditEventParams = Readonly<{
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId: string;
  ipAddress: string | null;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
}>;

export const AUDITABLE_ENTITY_TYPES = [
  AuditEntityType.INVOICE,
  AuditEntityType.TRANSACTION,
] as const;

export const AUDITABLE_ACTIONS = [
  AuditAction.CREATE,
  AuditAction.UPDATE,
  AuditAction.DELETE,
] as const;

export const logAuditEvent = async (
  params: AuditEventParams,
): Promise<void> => {
  const data: Prisma.AuditLogUncheckedCreateInput = {
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    userId: params.userId,
    ipAddress: params.ipAddress,
    ...(params.oldValue !== undefined ? { oldValue: params.oldValue } : {}),
    ...(params.newValue !== undefined ? { newValue: params.newValue } : {}),
  };

  await prisma.auditLog.create({ data });
};

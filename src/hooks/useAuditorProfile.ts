"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuditorInfo, NormalizedUser } from "@/types/UserType";

type UseAuditorProfileResult = {
  user: NormalizedUser | null;
  loading: boolean;
  error: string | null;
  applyUpdate: (updated: any) => void;
};

function buildAuditorUserFromSession(session: any): NormalizedUser | null {
  if (!session?.user) return null;
  const roleData = session.user.roleData;
  if (!roleData) return null;

  const userId = Number(session.user.id);
  const email = String(session.user.email ?? "");

  const auditor: AuditorInfo = {
    auditorId: Number(roleData.auditorId),
    namePrefix: String(roleData.namePrefix ?? ""),
    firstName: String(roleData.firstName ?? ""),
    lastName: String(roleData.lastName ?? ""),
    createdAt: roleData.createdAt ?? new Date(),
    updatedAt: roleData.updatedAt ?? new Date(),
    userId: Number(roleData.userId ?? userId),
    version: Number(roleData.version ?? 0),
  };

  return {
    userId,
    email,
    role: String(session.user.role ?? "AUDITOR"),
    name: session.user.name,
    createdAt: roleData.createdAt ?? new Date(),
    updatedAt: roleData.updatedAt ?? new Date(),
    auditor,
  };
}

export function useAuditorProfile(): UseAuditorProfileResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = status === "loading";
  const initialUser = useMemo(
    () => buildAuditorUserFromSession(session),
    [session]
  );

  useEffect(() => {
    if (status === "authenticated") {
      if (initialUser) {
        setError(null);
        setUser(initialUser);
      } else {
        setError("ไม่พบข้อมูลโปรไฟล์ผู้ตรวจประเมินใน session");
        setUser(null);
      }
    }

    if (status === "unauthenticated") {
      setUser(null);
      setError("Unauthorized");
    }
  }, [status, initialUser]);

  const applyUpdate = useCallback((updated: any) => {
    // PUT /api/v1/auditors/:id returns AuditorModel JSON (includes email + auditor fields)
    setUser((prev) => {
      if (!prev) return prev;

      const mergedAuditor: any = { ...prev.auditor, ...updated };

      return {
        ...prev,
        email: String(updated?.email ?? prev.email),
        auditor: {
          ...(prev.auditor as any),
          auditorId: Number(
            mergedAuditor.auditorId ?? prev.auditor?.auditorId ?? 0
          ),
          namePrefix: String(
            mergedAuditor.namePrefix ?? prev.auditor?.namePrefix ?? ""
          ),
          firstName: String(
            mergedAuditor.firstName ?? prev.auditor?.firstName ?? ""
          ),
          lastName: String(
            mergedAuditor.lastName ?? prev.auditor?.lastName ?? ""
          ),
          userId: Number(
            mergedAuditor.userId ?? prev.auditor?.userId ?? prev.userId
          ),
          version: Number(mergedAuditor.version ?? prev.auditor?.version ?? 0),
          createdAt: mergedAuditor.createdAt ?? prev.auditor?.createdAt,
          updatedAt: mergedAuditor.updatedAt ?? prev.auditor?.updatedAt,
        },
      };
    });
  }, []);

  return { user, loading, error, applyUpdate };
}

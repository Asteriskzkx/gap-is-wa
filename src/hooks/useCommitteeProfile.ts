"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CommitteeInfo, NormalizedUser } from "@/types/UserType";

type UseCommitteeProfileResult = {
  user: NormalizedUser | null;
  loading: boolean;
  error: string | null;
  applyUpdate: (updated: any) => void;
};

function buildCommitteeUserFromSession(session: any): NormalizedUser | null {
  if (!session?.user) return null;
  const roleData = session.user.roleData;
  if (!roleData) return null;

  const userId = Number(session.user.id);
  const email = String(session.user.email ?? "");

  const committee: CommitteeInfo = {
    committeeId: Number(roleData.committeeId),
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
    role: String(session.user.role ?? "COMMITTEE"),
    name: session.user.name,
    createdAt: roleData.createdAt ?? new Date(),
    updatedAt: roleData.updatedAt ?? new Date(),
    committee,
  };
}

export function useCommitteeProfile(): UseCommitteeProfileResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = status === "loading";
  const initialUser = useMemo(
    () => buildCommitteeUserFromSession(session),
    [session]
  );

  useEffect(() => {
    if (status === "authenticated") {
      if (initialUser) {
        setError(null);
        setUser(initialUser);
      } else {
        setError("ไม่พบข้อมูลโปรไฟล์คณะกรรมการใน session");
        setUser(null);
      }
    }

    if (status === "unauthenticated") {
      setUser(null);
      setError("Unauthorized");
    }
  }, [status, initialUser]);

  const applyUpdate = useCallback((updated: any) => {
    // PUT /api/v1/committees/:id returns CommitteeModel JSON (includes email + committee fields)
    setUser((prev) => {
      if (!prev) return prev;

      const mergedCommittee: any = { ...prev.committee, ...updated };

      return {
        ...prev,
        email: String(updated?.email ?? prev.email),
        committee: {
          ...(prev.committee as any),
          committeeId: Number(
            mergedCommittee.committeeId ?? prev.committee?.committeeId ?? 0
          ),
          namePrefix: String(
            mergedCommittee.namePrefix ?? prev.committee?.namePrefix ?? ""
          ),
          firstName: String(
            mergedCommittee.firstName ?? prev.committee?.firstName ?? ""
          ),
          lastName: String(
            mergedCommittee.lastName ?? prev.committee?.lastName ?? ""
          ),
          userId: Number(
            mergedCommittee.userId ?? prev.committee?.userId ?? prev.userId
          ),
          version: Number(
            mergedCommittee.version ?? prev.committee?.version ?? 0
          ),
          createdAt: mergedCommittee.createdAt ?? prev.committee?.createdAt,
          updatedAt: mergedCommittee.updatedAt ?? prev.committee?.updatedAt,
        },
      };
    });
  }, []);

  return { user, loading, error, applyUpdate };
}

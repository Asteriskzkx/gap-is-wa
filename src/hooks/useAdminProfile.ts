"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminInfo, NormalizedUser } from "@/types/UserType";

type UseAdminProfileResult = {
  user: NormalizedUser | null;
  loading: boolean;
  error: string | null;
  applyUpdate: (updated: any) => void;
};

function buildAdminUserFromSession(session: any): NormalizedUser | null {
  if (!session?.user) return null;
  const roleData = session.user.roleData;
  if (!roleData) return null;

  const userId = Number(session.user.id);
  const email = String(session.user.email ?? "");

  const admin: AdminInfo = {
    adminId: Number(roleData.adminId),
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
    role: String(session.user.role ?? "ADMIN"),
    name: session.user.name,
    createdAt: roleData.createdAt ?? new Date(),
    updatedAt: roleData.updatedAt ?? new Date(),
    admin,
  };
}

export function useAdminProfile(): UseAdminProfileResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = status === "loading";

  const initialUser = useMemo(
    () => buildAdminUserFromSession(session),
    [session]
  );

  useEffect(() => {
    if (status === "authenticated") {
      if (initialUser) {
        setError(null);
        setUser(initialUser);
      } else {
        setError("ไม่พบข้อมูลโปรไฟล์ผู้ดูแลระบบใน session");
        setUser(null);
      }
    }

    if (status === "unauthenticated") {
      setUser(null);
      setError("Unauthorized");
    }
  }, [status, initialUser]);

  const applyUpdate = useCallback((updated: any) => {
    // PUT /api/v1/admins/:id returns AdminModel JSON (includes email + admin fields)
    setUser((prev) => {
      if (!prev) return prev;

      const mergedAdmin: any = { ...prev.admin, ...updated };

      return {
        ...prev,
        email: String(updated?.email ?? prev.email),
        admin: {
          ...(prev.admin as any),
          adminId: Number(mergedAdmin.adminId ?? prev.admin?.adminId ?? 0),
          namePrefix: String(
            mergedAdmin.namePrefix ?? prev.admin?.namePrefix ?? ""
          ),
          firstName: String(
            mergedAdmin.firstName ?? prev.admin?.firstName ?? ""
          ),
          lastName: String(mergedAdmin.lastName ?? prev.admin?.lastName ?? ""),
          userId: Number(
            mergedAdmin.userId ?? prev.admin?.userId ?? prev.userId
          ),
          version: Number(mergedAdmin.version ?? prev.admin?.version ?? 0),
          createdAt: mergedAdmin.createdAt ?? prev.admin?.createdAt,
          updatedAt: mergedAdmin.updatedAt ?? prev.admin?.updatedAt,
        },
      };
    });
  }, []);

  return { user, loading, error, applyUpdate };
}

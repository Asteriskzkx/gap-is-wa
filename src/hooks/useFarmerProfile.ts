"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FarmerInfo, NormalizedUser } from "@/types/UserType";

type UseFarmerProfileResult = {
  user: NormalizedUser | null;
  loading: boolean;
  error: string | null;
  applyUpdate: (updated: any) => void;
};

function buildFarmerUserFromSession(session: any): NormalizedUser | null {
  if (!session?.user) return null;
  const roleData = session.user.roleData;
  if (!roleData) return null;

  const userId = Number(session.user.id);
  const email = String(session.user.email ?? "");

  const farmer: FarmerInfo = {
    farmerId: Number(roleData.farmerId),
    namePrefix: String(roleData.namePrefix ?? ""),
    firstName: String(roleData.firstName ?? ""),
    lastName: String(roleData.lastName ?? ""),
    identificationNumber: String(roleData.identificationNumber ?? ""),
    birthDate: roleData.birthDate,
    gender: String(roleData.gender ?? ""),
    houseNo: String(roleData.houseNo ?? ""),
    villageName: String(roleData.villageName ?? ""),
    moo: Number(roleData.moo ?? 0),
    road: String(roleData.road ?? ""),
    alley: String(roleData.alley ?? ""),
    subDistrict: String(roleData.subDistrict ?? ""),
    district: String(roleData.district ?? ""),
    provinceName: String(roleData.provinceName ?? ""),
    zipCode: String(roleData.zipCode ?? ""),
    phoneNumber: String(roleData.phoneNumber ?? ""),
    mobilePhoneNumber: String(roleData.mobilePhoneNumber ?? ""),
    createdAt: roleData.createdAt ?? new Date(),
    updatedAt: roleData.updatedAt ?? new Date(),
    userId: Number(roleData.userId ?? userId),
    version: Number(roleData.version ?? 0),
  };

  return {
    userId,
    email,
    role: String(session.user.role ?? "FARMER"),
    name: session.user.name,
    createdAt: roleData.createdAt ?? new Date(),
    updatedAt: roleData.updatedAt ?? new Date(),
    farmer,
  };
}

export function useFarmerProfile(): UseFarmerProfileResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = status === "loading";
  const initialUser = useMemo(
    () => buildFarmerUserFromSession(session),
    [session]
  );

  useEffect(() => {
    if (status === "authenticated") {
      if (initialUser) {
        setError(null);
        setUser(initialUser);
      } else {
        setError("ไม่พบข้อมูลโปรไฟล์เกษตรกรใน session");
        setUser(null);
      }
    }

    if (status === "unauthenticated") {
      setUser(null);
      setError("Unauthorized");
    }
  }, [status, initialUser]);

  const applyUpdate = useCallback((updated: any) => {
    // PUT /api/v1/farmers/:id returns FarmerModel JSON (includes email + farmer fields)
    setUser((prev) => {
      if (!prev) return prev;

      const mergedFarmer: any = { ...prev.farmer, ...updated };

      return {
        ...prev,
        email: String(updated?.email ?? prev.email),
        farmer: {
          ...(prev.farmer as any),
          farmerId: Number(mergedFarmer.farmerId ?? prev.farmer?.farmerId ?? 0),
          namePrefix: String(
            mergedFarmer.namePrefix ?? prev.farmer?.namePrefix ?? ""
          ),
          firstName: String(
            mergedFarmer.firstName ?? prev.farmer?.firstName ?? ""
          ),
          lastName: String(
            mergedFarmer.lastName ?? prev.farmer?.lastName ?? ""
          ),
          identificationNumber: String(
            mergedFarmer.identificationNumber ??
              prev.farmer?.identificationNumber ??
              ""
          ),
          birthDate: mergedFarmer.birthDate ?? prev.farmer?.birthDate,
          gender: String(mergedFarmer.gender ?? prev.farmer?.gender ?? ""),
          houseNo: String(mergedFarmer.houseNo ?? prev.farmer?.houseNo ?? ""),
          villageName: String(
            mergedFarmer.villageName ?? prev.farmer?.villageName ?? ""
          ),
          moo: Number(mergedFarmer.moo ?? prev.farmer?.moo ?? 0),
          road: String(mergedFarmer.road ?? prev.farmer?.road ?? ""),
          alley: String(mergedFarmer.alley ?? prev.farmer?.alley ?? ""),
          subDistrict: String(
            mergedFarmer.subDistrict ?? prev.farmer?.subDistrict ?? ""
          ),
          district: String(
            mergedFarmer.district ?? prev.farmer?.district ?? ""
          ),
          provinceName: String(
            mergedFarmer.provinceName ?? prev.farmer?.provinceName ?? ""
          ),
          zipCode: String(mergedFarmer.zipCode ?? prev.farmer?.zipCode ?? ""),
          phoneNumber: String(
            mergedFarmer.phoneNumber ?? prev.farmer?.phoneNumber ?? ""
          ),
          mobilePhoneNumber: String(
            mergedFarmer.mobilePhoneNumber ??
              prev.farmer?.mobilePhoneNumber ??
              ""
          ),
          userId: Number(
            mergedFarmer.userId ?? prev.farmer?.userId ?? prev.userId
          ),
          version: Number(mergedFarmer.version ?? prev.farmer?.version ?? 0),
          createdAt: mergedFarmer.createdAt ?? prev.farmer?.createdAt,
          updatedAt: mergedFarmer.updatedAt ?? prev.farmer?.updatedAt,
        },
      };
    });
  }, []);

  return { user, loading, error, applyUpdate };
}

import { useState, useEffect, useRef, useCallback } from "react";
import { NormalizedUser, AdminInfo, AuditorInfo, CommitteeInfo, FarmerInfo } from "@/types/UserType";

export function useUserDetail(userId: number | null) {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);
  const userIdRef = useRef(userId);

  // Keep userId ref in sync
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const fetchUser = useCallback(async (signal?: AbortSignal) => {
    const currentUserId = userIdRef.current;
    if (currentUserId == null) {
      setLoading(false);
      setUser(null);
      setError(null);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/users/normalize/${currentUserId}`, {
        signal,
      });

      if (currentFetchId !== fetchIdRef.current) return;

      if (!res.ok) {
        const status = res.status;
        if (status === 401) {
          setError("Unauthorized - please login");
        } else if (status === 404) {
          setUser(null);
        } else {
          setError("Failed to fetch user");
        }
        setLoading(false);
        return;
      }

      const data: NormalizedUser[] = await res.json();

      if (currentFetchId !== fetchIdRef.current) return;

      setUser(data[0] ?? null);
      setLoading(false);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (currentFetchId !== fetchIdRef.current) return;
      setError(err?.message ?? "Unknown error");
      setLoading(false);
    }
  }, []);

  // Refetch function that can be called manually
  const refetch = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  // Update user state directly with updated entity (Pattern #1 - best for optimistic locking)
  const updateAdmin = useCallback((updatedAdmin: AdminInfo) => {
    setUser((prev) => prev ? { ...prev, admin: updatedAdmin, email: (updatedAdmin as any).user?.email ?? prev.email } : prev);
  }, []);

  const updateAuditor = useCallback((updatedAuditor: AuditorInfo) => {
    setUser((prev) => prev ? { ...prev, auditor: updatedAuditor, email: (updatedAuditor as any).user?.email ?? prev.email } : prev);
  }, []);

  const updateCommittee = useCallback((updatedCommittee: CommitteeInfo) => {
    setUser((prev) => prev ? { ...prev, committee: updatedCommittee, email: (updatedCommittee as any).user?.email ?? prev.email } : prev);
  }, []);

  const updateFarmer = useCallback((updatedFarmer: FarmerInfo) => {
    setUser((prev) => prev ? { ...prev, farmer: updatedFarmer, email: (updatedFarmer as any).user?.email ?? prev.email } : prev);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchUser(controller.signal);

    return () => {
      controller.abort();
    };
  }, [userId, fetchUser]);

  return { user, loading, error, refetch, updateAdmin, updateAuditor, updateCommittee, updateFarmer };
}

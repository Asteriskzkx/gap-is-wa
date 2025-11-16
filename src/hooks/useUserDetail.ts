import { useState, useEffect } from "react";
import { NormalizedUser } from "@/types/UserType";

export function useUserDetail(userId: number | null) {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/users/normalize/${userId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data: NormalizedUser[] = await res.json();
        setUser(data[0] ?? null); // เอา element แรกมาใช้
      } catch (err: any) {
        if (err.name === "AbortError") return; // ❗ IGNORE abort
        setError(err?.message ?? "Unknown error"); 
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [userId]);

  return { user, loading, error };
}

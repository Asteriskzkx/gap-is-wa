import { useState, useEffect, useRef } from "react";
import { NormalizedUser } from "@/types/UserType";

export function useUserDetail(userId: number | null) {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (userId == null) {
      setLoading(false);
      setUser(null);
      setError(null);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    const controller = new AbortController();

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      setUser(null);
      
      try {
        const res = await fetch(`/api/v1/users/normalize/${userId}`, {
          signal: controller.signal,
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
    };

    fetchUser();

    return () => {
      controller.abort();
    };
  }, [userId]);

  return { user, loading, error };
}

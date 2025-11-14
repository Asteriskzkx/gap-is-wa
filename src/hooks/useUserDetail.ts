import { useState, useEffect } from "react";

export function useUserDetail(userId: string) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const controller = new AbortController();

    const fetchUser = async () => {
      setLoading(true);
      try {
        // เรียก API หลัก
        const res = await fetch(`/api/v1/users/${userId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        // ถ้า role ต้อง fetch detail เพิ่ม
        let detailedData = data;
        if (data.role === "FARMER") {
          const resFarmer = await fetch(`/api/v1/farmers/${userId}`);
          detailedData = { ...data, ...(await resFarmer.json()) };
        } else if (data.role === "COMMITTEE") {
          const resCommittee = await fetch(`/api/v1/committees/${userId}`);
          detailedData = { ...data, ...(await resCommittee.json()) };
        } else if (data.role === "AUDITOR") {
            const resAuditor = await fetch(`/api/v1/auditors/${userId}`);
            detailedData = { ...data, ...(await resAuditor.json()) };
        } else if (data.role === "ADMIN") {
            const resAdmin = await fetch(`/api/v1/admins/${userId}`);
            detailedData = { ...data, ...(await resAdmin.json()) };
        } else {
            detailedData = data;
        }

        setUser(detailedData);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [userId]);

  return { user, loading, error };
}

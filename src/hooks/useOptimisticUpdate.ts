import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

interface OptimisticLockError {
  error: string;
  message: string;
  userMessage: string;
  requiresRefresh: boolean;
}

interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  onConflict?: () => void;
  refreshData?: () => Promise<void>;
}

export function useOptimisticUpdate<T = any>(
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateWithOptimisticLock = useCallback(
    async (
      url: string,
      data: any,
      version?: number,
      method: "PUT" | "PATCH" = "PUT"
    ): Promise<{ success: boolean; data?: T; error?: any }> => {
      setIsUpdating(true);

      try {
        // เพิ่ม version เข้าไปใน request body
        const requestBody = version !== undefined ? { ...data, version } : data;

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const responseData = await response.json();
          options.onSuccess?.(responseData);
          setIsUpdating(false);
          return { success: true, data: responseData };
        }

        // Handle 409 Conflict (Optimistic Lock Error)
        if (response.status === 409) {
          const errorData: OptimisticLockError = await response.json();

          // แสดง toast message ภาษาไทย
          toast.error(errorData.userMessage || errorData.message, {
            duration: 5000,
            icon: "⚠️",
          });

          // Refresh data ถ้ามีการกำหนดไว้
          if (errorData.requiresRefresh && options.refreshData) {
            await options.refreshData();
          }

          options.onConflict?.();
          setIsUpdating(false);
          return { success: false, error: errorData };
        }

        // Handle other errors
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update");
      } catch (error: any) {
        console.error("Update error:", error);
        toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        options.onError?.(error);
        setIsUpdating(false);
        return { success: false, error };
      }
    },
    [options]
  );

  return {
    updateWithOptimisticLock,
    isUpdating,
  };
}

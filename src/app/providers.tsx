"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { addLocale, locale, PrimeReactProvider } from "primereact/api";
import { thaiLocale } from "@/lib/locale-th";

export function Providers({ children }: { readonly children: ReactNode }) {
  useEffect(() => {
    // เพิ่ม Thai locale สำหรับ PrimeReact
    addLocale("th", thaiLocale);
    // ตั้งค่าเป็นภาษาไทย
    locale("th");
  }, []);

  return (
    <PrimeReactProvider>
      <SessionProvider>
        <Toaster position="top-right" />
        {children}
      </SessionProvider>
    </PrimeReactProvider>
  );
}

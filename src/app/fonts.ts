import { Sarabun } from "next/font/google";

export const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sarabun",
  preload: true,
  adjustFontFallback: false, // ป้องกันปัญหา layout shift
});

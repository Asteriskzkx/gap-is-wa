import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ถ้าไม่มี token redirect ไปหน้า login (/)
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ตรวจสอบ role และ redirect
    if (path.startsWith("/farmer") && token.role !== "FARMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/auditor") && token.role !== "AUDITOR") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/committee") && token.role !== "COMMITTEE") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// กำหนด routes ที่ต้องการป้องกันด้วย NextAuth middleware
export const config = {
  matcher: [
    "/farmer/:path*",
    "/auditor/:path*",
    "/committee/:path*",
    "/admin/:path*",
  ],
};

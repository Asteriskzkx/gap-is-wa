import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/utils/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        // หาผู้ใช้จากฐานข้อมูล
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            farmer: true,
            auditor: true,
            committee: true,
            admin: true,
          },
        });

        if (!user) {
          throw new Error("ไม่พบผู้ใช้นี้ในระบบ");
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        // Return user object
        return {
          id: user.userId.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          // เพิ่มข้อมูลเฉพาะตาม role
          roleData: user.farmer || user.auditor || user.committee || user.admin,
        };
      },
    }),
  ],

  callbacks: {
    // JWT Callback - เก็บข้อมูลใน token และต่ออายุ session
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleData = user.roleData;
      }

      // ต่ออายุ token เมื่อมีการใช้งาน
      if (trigger === "update") {
        // อัพเดท iat (issued at) เพื่อต่ออายุ session
        token.iat = Math.floor(Date.now() / 1000);
      }

      return token;
    },

    // Session Callback - ส่งข้อมูลไปที่ client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.roleData = token.roleData;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 ชั่วโมง (3600 วินาที)
    updateAge: 15 * 60, // ต่ออายุทุก 15 นาที เมื่อมีการใช้งาน (900 วินาที)
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

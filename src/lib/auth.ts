import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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
    // JWT Callback - เก็บข้อมูลใน token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleData = user.roleData;
      }
      return token;
    },

    // Session Callback - ส่งข้อมูลไปที่ client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

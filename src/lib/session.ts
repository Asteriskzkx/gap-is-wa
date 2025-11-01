import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * Helper function to get NextAuth session from request
 * @param req NextRequest object
 * @returns session object or null
 */
export async function getSessionFromRequest(req?: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Helper function to verify user has required role
 * @param req NextRequest object
 * @param allowedRoles Array of allowed roles
 * @returns { authorized: boolean, session: Session | null, error?: string }
 */
export async function checkAuthorization(
  req: NextRequest,
  allowedRoles: string[]
) {
  const session = await getSessionFromRequest(req);

  if (!session || !session.user) {
    return {
      authorized: false,
      session: null,
      error: "Unauthorized - No session found",
    };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      authorized: false,
      session,
      error: `Forbidden - Required roles: ${allowedRoles.join(", ")}`,
    };
  }

  return {
    authorized: true,
    session,
  };
}

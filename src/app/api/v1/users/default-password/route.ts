import { checkAuthorization } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Route handler for /api/v1/users/default-password (Admin only)
// WARNING: This exposes DEFAULT_PASSWORD to the admin UI.
export async function GET(_req: NextRequest) {
  const { authorized, error } = await checkAuthorization(_req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const defaultPassword = process.env.DEFAULT_PASSWORD;

  if (!defaultPassword) {
    return NextResponse.json(
      { message: "DEFAULT_PASSWORD is not configured in environment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ defaultPassword }, { status: 200 });
}

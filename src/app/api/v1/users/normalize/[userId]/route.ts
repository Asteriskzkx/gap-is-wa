import { checkAuthorization } from "@/lib/session";
import { userController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const { userId: userIdStr } = params;
  let userId: number | undefined;

  if (userIdStr) {
    userId = Number(userIdStr);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }
  }

  return userController.getUsersNormalized(req, userId);
}

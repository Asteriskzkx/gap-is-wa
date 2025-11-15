import { NextRequest, NextResponse } from "next/server";
import { userController } from "@/utils/dependencyInjections";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId: userIdStr } = params;
  let userId: number | undefined;

  if (userIdStr) {
    userId = Number(userIdStr);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }
  }

  console.log("Path userId:", userId);

  return userController.getUsersNormalized(req, userId);
}
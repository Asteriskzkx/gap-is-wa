import { NextRequest, NextResponse } from "next/server";
import { committeeController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/committees/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "COMMITTEE",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  if (session?.user?.role === "COMMITTEE") {
    return committeeController.getCurrentCommittee(req);
  }

  return committeeController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "COMMITTEE",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // หาก role เป็น COMMITTEE ต้องตรวจสอบว่าแก้ไขข้อมูลของตัวเองเท่านั้น
  if (session?.user?.role === "COMMITTEE") {
    const requestedCommitteeId = Number.parseInt(params.id, 10);
    const currentCommitteeId = session.user.roleData?.committeeId;

    if (!currentCommitteeId || requestedCommitteeId !== currentCommitteeId) {
      return NextResponse.json(
        { message: "คุณสามารถแก้ไขข้อมูลของตัวเองเท่านั้น" },
        { status: 403 }
      );
    }
  }

  return committeeController.updateCommitteeProfile(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return committeeController.delete(req, { params });
}

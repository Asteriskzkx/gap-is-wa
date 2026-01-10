import { NextRequest, NextResponse } from "next/server";
import { auditorController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers สำหรับ /api/v1/auditors/[id] เท่านั้น
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  if (session?.user?.role === "AUDITOR") {
    return auditorController.getCurrentAuditor(req);
  }

  return auditorController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // หาก role เป็น AUDITOR ต้องตรวจสอบว่าแก้ไขข้อมูลของตัวเองเท่านั้น
  if (session?.user?.role === "AUDITOR") {
    const requestedAuditorId = Number.parseInt(params.id, 10);
    const currentAuditorId = session.user.roleData?.auditorId;

    if (!currentAuditorId || requestedAuditorId !== currentAuditorId) {
      return NextResponse.json(
        { message: "คุณสามารถแก้ไขข้อมูลของตัวเองเท่านั้น" },
        { status: 403 }
      );
    }
  }

  return auditorController.updateAuditorProfile(req, { params });
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

  return auditorController.delete(req, { params });
}

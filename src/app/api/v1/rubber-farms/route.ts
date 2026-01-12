import { NextRequest, NextResponse } from "next/server";
import { rubberFarmController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/rubber-farms
export async function GET(req: NextRequest) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "FARMER",
    "ADMIN",
    "AUDITOR",
    "COMMITTEE",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);

  // หาก role เป็น FARMER ให้ดึงข้อมูลของตัวเองเท่านั้น
  if (session?.user?.role === "FARMER") {
    const farmerId = session.user.roleData?.farmerId;
    if (!farmerId) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลเกษตรกร" },
        { status: 404 }
      );
    }
    // เฉพาะกรณีที่มี query param `farmerId` และตรงกับ session.farmerId เท่านั้น
    if (!url.searchParams.has("farmerId")) {
      return NextResponse.json(
        { message: "ต้องระบุ farmerId ในพารามิเตอร์ของ URL" },
        { status: 400 }
      );
    }

    if (url.searchParams.get("farmerId") !== farmerId.toString()) {
      return NextResponse.json(
        { message: "คุณสามารถดูข้อมูลของตัวเองเท่านั้น" },
        { status: 403 }
      );
    }

    return rubberFarmController.getRubberFarmsByFarmerId(req);
  }

  // If farmerId is provided, get farms by farmer ID
  if (url.searchParams.has("farmerId")) {
    return rubberFarmController.getRubberFarmsByFarmerId(req);
  }
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "FARMER",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Handle creating a new rubber farm with planting details
  return rubberFarmController.createRubberFarmWithDetails(req);
}

import { NextRequest, NextResponse } from "next/server";
import { auditorService } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ว่าเป็น Auditor จริงหรือไม่
    const authResult = await checkAuthorization(req, ["AUDITOR"]);
    if (!authResult.authorized || !authResult.session) {
      return NextResponse.json(
        { message: authResult.error || "Unauthorized" },
        { status: authResult.session ? 403 : 401 }
      );
    }

    const auditorId = authResult.session.user.roleData?.auditorId;
    if (!auditorId) {
      return NextResponse.json(
        { message: "Auditor ID not found in session" },
        { status: 403 }
      );
    }

    // ดึง query parameters
    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = Number.parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || undefined;
    const sortOrder = searchParams.get("sortOrder") as
      | "asc"
      | "desc"
      | undefined;

    // Multi-sort
    let multiSortMeta: Array<{ field: string; order: 1 | -1 }> | undefined;
    const multiSortParam = searchParams.get("multiSortMeta");
    if (multiSortParam) {
      try {
        multiSortMeta = JSON.parse(multiSortParam);
      } catch (e) {
        console.error("Failed to parse multiSortMeta:", e);
      }
    }

    // ดึงรายชื่อ auditor อื่นๆ พร้อม pagination
    const result = await auditorService.getAuditorListExcept(auditorId, {
      limit,
      offset,
      search,
      sortField,
      sortOrder,
      multiSortMeta,
    });

    return NextResponse.json(
      {
        results: result.data,
        paginator: {
          limit,
          offset,
          total: result.total,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch other auditors" },
      { status: 500 }
    );
  }
}

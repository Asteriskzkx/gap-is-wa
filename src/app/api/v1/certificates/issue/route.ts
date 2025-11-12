import { NextRequest, NextResponse } from "next/server";
import { certificateController } from "@/utils/dependencyInjections";

export async function POST(req: NextRequest) {
  try {
    return await certificateController.createCertificate(req);
  } catch (err: any) {
    console.error("/api/v1/certificates/issue error", err);
    return NextResponse.json(
      { message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

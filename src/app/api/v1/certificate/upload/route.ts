import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { message: "Deprecated. Use /api/v1/files/upload instead" },
    { status: 410 }
  );
}

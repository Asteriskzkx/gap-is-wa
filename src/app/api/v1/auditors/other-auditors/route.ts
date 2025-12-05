import { NextRequest } from "next/server";
import { auditorController } from "@/utils/dependencyInjections";

export async function GET(req: NextRequest) {
  return auditorController.getOtherAuditors(req);
}

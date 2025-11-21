import { certificateController } from "@/utils/dependencyInjections";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return certificateController.updateCancelRequestDetail(req);
}

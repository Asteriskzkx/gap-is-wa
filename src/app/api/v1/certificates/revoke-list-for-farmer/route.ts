import { certificateController } from "@/utils/dependencyInjections";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return certificateController.getAlreadyIssuedForFarmer(req as any);
}

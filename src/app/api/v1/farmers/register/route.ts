import { farmerController } from "@/utils/dependencyInjections";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return farmerController.registerFarmer(req);
}

import { userController } from "@/utils/dependencyInjections";
import { NextRequest } from "next/server";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return userController.changeRole(req, { userId: params.id });
}
import { fileController } from "@/utils/dependencyInjections";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return new Response(JSON.stringify({ message: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return fileController.deleteFileById(id, req as any);
}

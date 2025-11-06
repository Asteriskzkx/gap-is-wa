import { UTApi, UTFile } from "uploadthing/server";

export async function uploadBufferToUploadThing(
  buffer: Buffer,
  filename: string,
  mimeType: string
) {
  const utapi = new UTApi();

  // UTFile expects BlobPart-like parts (ArrayBufferView). Convert Node Buffer -> Uint8Array
  const part = new Uint8Array(buffer);
  const file = new UTFile([part], filename, { type: mimeType });

  const res = await utapi.uploadFiles([file]);

  // res shape may vary depending on SDK version; be defensive and treat as any
  const first: any = res && res[0];

  // Try several possible properties that might contain the uploaded file URL
  return (
    first?.data?.file?.ufsUrl ||
    first?.data?.file?.url ||
    first?.data?.url ||
    first?.ufsUrl ||
    first?.url ||
    null
  );
}

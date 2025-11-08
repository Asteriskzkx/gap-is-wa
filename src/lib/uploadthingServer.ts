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

// Attempt to delete a previously-uploaded file from UploadThing via UTApi.
// We try a few method names defensively because the SDK surface can differ
// between versions. The function accepts a URL (ufsUrl or public url) and
// returns true when deletion was attempted successfully, false otherwise.
export async function deleteUploadThingFile(
  urlOrUfsUrl: string
): Promise<boolean> {
  try {
    const utapi: any = new UTApi();

    // Some SDK versions expose deleteFiles or deleteFile. Try both.
    if (typeof utapi.deleteFiles === "function") {
      // Accept either an array of urls/ids or a single value in array
      await utapi.deleteFiles([urlOrUfsUrl]);
      return true;
    }

    if (typeof utapi.deleteFile === "function") {
      await utapi.deleteFile(urlOrUfsUrl);
      return true;
    }

    // Some SDKs expect a file key rather than a URL. Try passing the URL as-is.
    if (typeof utapi.delete === "function") {
      await utapi.delete(urlOrUfsUrl);
      return true;
    }

    // If none of the above exist, log and return false.
    console.warn("UTApi does not expose a delete method on this SDK version.", {
      urlOrUfsUrl,
    });
    return false;
  } catch (err) {
    console.error("Failed to delete file from UploadThing:", err, urlOrUfsUrl);
    return false;
  }
}

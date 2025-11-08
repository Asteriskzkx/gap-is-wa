import { UTApi, UTFile } from "uploadthing/server";

export async function uploadBufferToUploadThing(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string | null; fileKey?: string | null }> {
  const utapi = new UTApi();

  // UTFile expects BlobPart-like parts (ArrayBufferView). Convert Node Buffer -> Uint8Array
  const part = new Uint8Array(buffer);
  const file = new UTFile([part], filename, { type: mimeType });

  const res = await utapi.uploadFiles([file]);

  // The SDK returns an UploadFileResult or an array of them. Normalize to first entry.
  const first: any = Array.isArray(res) ? res[0] : res;

  // Prefer the SDK-provided URL fields (ufsUrl/url). Check common nesting variants.
  const url =
    first?.ufsUrl ||
    first?.url ||
    first?.data?.ufsUrl ||
    first?.data?.url ||
    first?.data?.file?.ufsUrl ||
    first?.data?.file?.url ||
    null;

  // Prefer the SDK-provided file key (deterministic identifier). Do NOT derive
  // the key from the public URL — rely on SDK fields like `key`, `id`, or
  // nested `data.file.key` which UploadThing exposes in recent versions.
  const fileKey =
    first?.key ||
    first?.file?.key ||
    first?.data?.key ||
    first?.data?.file?.key ||
    first?.data?.file?.id ||
    first?.id ||
    null;

  return { url, fileKey };
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
      try {
        await utapi.delete(urlOrUfsUrl);
        return true;
      } catch (e) {
        // continue to try other variants
        console.warn("utapi.delete failed for url, will try id variants", e);
      }
    }

    // Try extracting file id(s) and attempt deletion for each candidate.
    const tryDeleteCandidate = async (candidate: string) => {
      try {
        if (typeof utapi.deleteFiles === "function") {
          await utapi.deleteFiles([candidate]);
          return true;
        }
        if (typeof utapi.deleteFile === "function") {
          await utapi.deleteFile(candidate);
          return true;
        }
        if (typeof utapi.delete === "function") {
          await utapi.delete(candidate);
          return true;
        }
      } catch (e) {
        console.warn(
          "delete attempt failed for candidate, trying next",
          candidate,
          e
        );
      }
      return false;
    };

    const candidateIds: string[] = [];
    try {
      const u = new URL(urlOrUfsUrl);
      const parts = u.pathname.split("/").filter(Boolean);
      const last = parts.at(-1);
      if (last) {
        candidateIds.push(last, u.pathname);
      }
    } catch (e) {
      console.warn("Not a full URL; will try raw string as candidate", e);
    }

    // include the original as last resort
    candidateIds.push(urlOrUfsUrl);

    for (const id of candidateIds) {
      const ok = await tryDeleteCandidate(id);
      if (ok) return true;
    }

    // If none of the above succeed, log and return false.
    console.warn(
      "UTApi does not expose a usable delete method or all attempts failed.",
      {
        urlOrUfsUrl,
      }
    );
    return false;
  } catch (err) {
    console.error("Failed to delete file from UploadThing:", err, urlOrUfsUrl);
    return false;
  }
}

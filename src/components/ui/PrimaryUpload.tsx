"use client";

import { NaturePeopleIcon } from "@/components/icons";
import { SPACING, TEXT } from "@/styles/auditorClasses";
import type { FileUploadHandlerEvent } from "primereact/fileupload";
import { FileUpload } from "primereact/fileupload";
import React from "react";

interface Props {
  readonly tableReference: string;
  readonly idReference?: number | null;
  readonly cacheKey?: string;
  readonly accept?: string;
  readonly maxFileSize?: number;
}

const buildCacheKey = (tableReference: string, cacheKey?: string) => {
  return `fileUploadCache:${tableReference}:${cacheKey ?? "pending"}`;
};

export default function PrimaryUpload({
  tableReference,
  idReference,
  cacheKey,
  accept = ".pdf",
  maxFileSize = 10 * 1024 * 1024,
}: Props) {
  const fuRef = React.useRef<any>(null);

  const buildKey = React.useCallback(
    () => buildCacheKey(tableReference, cacheKey),
    [tableReference, cacheKey]
  );

  const cacheFiles = React.useCallback(
    async (files: File[]) => {
      const key = buildKey();
      const existingJson = localStorage.getItem(key);
      const existing = existingJson ? JSON.parse(existingJson) : [];

      for (const f of files) {
        const dataUrl = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => {
            const r = reader.result;
            if (typeof r === "string") res(r);
            else res("");
          };
          reader.onerror = rej;
          reader.readAsDataURL(f);
        });

        existing.push({
          name: f.name,
          type: f.type,
          size: f.size,
          dataUrl,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem(key, JSON.stringify(existing));
    },
    [buildKey]
  );

  const flush = React.useCallback(
    async (idToUse?: number) => {
      const key = buildKey();
      const cached = localStorage.getItem(key);
      if (!cached) return;
      try {
        const items = JSON.parse(cached) as any[];
        for (const item of items) {
          const res = await fetch(item.dataUrl);
          const blob = await res.blob();
          const file = new File([blob], item.name, { type: item.type });

          const form = new FormData();
          form.append("tableReference", tableReference);
          form.append("idReference", String(idToUse ?? idReference));
          form.append("file", file, file.name);

          await fetch("/api/v1/files/upload", { method: "POST", body: form });
        }
        localStorage.removeItem(key);
      } catch (err) {
        console.error("PrimaryUpload flush error:", err);
      }
    },
    [buildKey, tableReference, idReference]
  );

  React.useEffect(() => {
    if (idReference) flush(idReference);
  }, [idReference, flush]);

  const uploadHandler = async (event: FileUploadHandlerEvent) => {
    const asFiles: File[] = Array.isArray(event?.files)
      ? (event.files as File[])
      : [];
    if (!asFiles.length) return;

    if (idReference) {
      const form = new FormData();
      form.append("tableReference", tableReference);
      form.append("idReference", String(idReference));
      for (const f of asFiles) form.append("file", f, f.name);
      await fetch("/api/v1/files/upload", { method: "POST", body: form });
      fuRef.current?.clear();
      return;
    }

    try {
      await cacheFiles(asFiles);
      fuRef.current?.clear();
    } catch (err) {
      console.error("PrimaryUpload cache error:", err);
    }
  };

  const emptyTemplate = () => (
    <div className={`flex flex-col items-center gap-3 ${SPACING.py2}`}>
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-white border">
          <NaturePeopleIcon className="h-10 w-10 text-gray-400" />
        </div>
      </div>
      <div className={`${TEXT.smMedium}`}>ลากและวางไฟล์ที่นี่</div>
    </div>
  );

  return (
    <div className="primary-upload p-card p-component p-4 bg-white rounded-md shadow-sm">
      <div className="flex flex-col gap-3">
        <FileUpload
          ref={fuRef}
          name="file"
          url={"/api/v1/files/upload"}
          mode="advanced"
          multiple
          accept={accept}
          maxFileSize={maxFileSize}
          customUpload={true}
          uploadHandler={uploadHandler}
          emptyTemplate={emptyTemplate}
          chooseLabel="เลือกไฟล์"
          cancelLabel="ยกเลิก"
          uploadLabel="อัปโหลด"
          className="w-full"
        />
      </div>
    </div>
  );
}

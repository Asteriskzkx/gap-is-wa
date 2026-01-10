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
  readonly multiple?: boolean;
  readonly fileValidator?: (file: File) => boolean;
}

const buildCacheKey = (tableReference: string, cacheKey?: string) => {
  return `fileUploadCache:${tableReference}:${cacheKey ?? "pending"}`;
};

export default function PrimaryUpload(props: Props) {
  const {
    tableReference,
    idReference,
    cacheKey,
    accept = ".pdf",
    maxFileSize = 10 * 1024 * 1024,
    multiple = true,
    fileValidator,
  } = props;
  const fuRef = React.useRef<any>(null);

  const buildKey = React.useCallback(
    () => buildCacheKey(tableReference, cacheKey),
    [tableReference, cacheKey]
  );

  const cacheFiles = React.useCallback(
    async (files: File[]) => {
      const key = buildKey();
      console.info("PrimaryUpload: caching files -> key=", key);

      let existing: any[] = [];
      if (multiple) {
        const existingJson = localStorage.getItem(key);
        existing = existingJson ? JSON.parse(existingJson) : [];
      } else {
        existing = [];
      }

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
    [buildKey, multiple]
  );

  const flush = React.useCallback(
    async (idToUse?: number) => {
      const key = buildKey();
      const cached = localStorage.getItem(key);
      if (!cached) {
        console.info("PrimaryUpload.flush: no cached files for key", key);
        return;
      }

      console.info(
        "PrimaryUpload.flush: found cached files, uploading -> key=",
        key,
        "idToUse=",
        idToUse ?? idReference
      );

      try {
        const items = JSON.parse(cached) as any[];

        const files: File[] = await Promise.all(
          items.map(async (item) => {
            try {
              const res = await fetch(item.dataUrl);
              const blob = await res.blob();
              return new File([blob], item.name, { type: item.type });
            } catch (err) {
              console.error(
                "PrimaryUpload.flush: error converting dataUrl to blob for",
                item.name,
                err
              );
              return null as any;
            }
          })
        );

        const validFiles = files.filter(Boolean);
        if (!validFiles.length) {
          console.info(
            "PrimaryUpload.flush: no valid files to upload for key",
            key
          );
          return;
        }

        const form = new FormData();
        form.append("tableReference", tableReference);
        form.append("idReference", String(idToUse ?? idReference));
        for (const f of validFiles) form.append("file", f, f.name);

        console.info(
          "PrimaryUpload.flush: uploading",
          validFiles.map((f) => f.name),
          "for id",
          idToUse ?? idReference
        );

        const upl = await fetch("/api/v1/files/upload", {
          method: "POST",
          body: form,
        });

        if (upl.ok) {
          console.info("PrimaryUpload.flush: upload succeeded for key", key);
          localStorage.removeItem(key);
          fuRef.current?.clear();
          console.info("PrimaryUpload.flush: cleared cache for key", key);
        } else {
          const text = await upl.text().catch(() => "");
          console.error("PrimaryUpload.flush: upload failed", {
            status: upl.status,
            body: text,
          });
        }
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

    // กรองไฟล์ด้วย fileValidator ถ้ามี
    const filteredFiles = fileValidator
      ? asFiles.filter(fileValidator)
      : asFiles;
    if (!filteredFiles.length) {
      alert("กรุณาเลือกไฟล์ที่ถูกต้องตามที่ระบบกำหนด");
      return;
    }

    if (idReference) {
      const form = new FormData();
      form.append("tableReference", tableReference);
      form.append("idReference", String(idReference));
      for (const f of filteredFiles) form.append("file", f, f.name);
      const resp = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: form,
      });
      if (resp.ok) {
        fuRef.current?.clear();
      }
      return;
    }

    try {
      await cacheFiles(filteredFiles);
    } catch (err) {
      console.error("PrimaryUpload cache error:", err);
    }
  };

  const onSelect = async (event: any) => {
    const asFiles: File[] = Array.isArray(event?.files) ? event.files : [];
    if (!asFiles.length) return;

    // กรองไฟล์ด้วย fileValidator ถ้ามี
    const filteredFiles = fileValidator
      ? asFiles.filter(fileValidator)
      : asFiles;

    if (fileValidator && asFiles.length > filteredFiles.length) {
      // clear ทั้งหมด
      fuRef.current?.clear();
      alert("กรุณาเลือกไฟล์ที่ถูกต้องตามที่ระบบกำหนด");
      return;
    }

    if (!filteredFiles.length) return;

    console.info(
      "PrimaryUpload.onSelect: user selected files",
      filteredFiles.map((f) => f.name)
    );

    if (idReference) {
      const form = new FormData();
      form.append("tableReference", tableReference);
      form.append("idReference", String(idReference));
      for (const f of filteredFiles) form.append("file", f, f.name);
      try {
        const resp = await fetch("/api/v1/files/upload", {
          method: "POST",
          body: form,
        });
        if (resp.ok) {
          console.info("PrimaryUpload.onSelect: immediate upload succeeded");
          fuRef.current?.clear();
        } else
          console.error(
            "PrimaryUpload.onSelect: immediate upload failed",
            await resp.text().catch(() => "")
          );
      } catch (err) {
        console.error("PrimaryUpload.onSelect: immediate upload error", err);
      }
      return;
    }

    try {
      await cacheFiles(filteredFiles);
    } catch (err) {
      console.error("PrimaryUpload onSelect cache error:", err);
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
          multiple={multiple}
          accept={accept}
          maxFileSize={maxFileSize}
          customUpload={true}
          uploadHandler={uploadHandler}
          onSelect={onSelect}
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

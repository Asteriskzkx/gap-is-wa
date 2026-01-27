// src/lib/export/types.ts
export type CsvExportResult = {
  type: "csv";
  stream: ReadableStream | NodeJS.ReadableStream;
  filename: string;
};

export type XlsxExportResult = {
  type: "xlsx";
  workbook: {
    xlsx: {
      writeBuffer(): Promise<ArrayBuffer>;
    };
  };
  filename: string;
};

export type ExportResult = CsvExportResult | XlsxExportResult;

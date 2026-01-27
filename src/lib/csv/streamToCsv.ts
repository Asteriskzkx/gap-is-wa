import { format } from "@fast-csv/format";
import { Readable } from "stream";

type CsvOptions = {
  headers: string[];
};

export function streamToCsv(
  dataStream: Readable,
  options: CsvOptions
) {
  const csvStream = format({ headers: options.headers });
  return dataStream.pipe(csvStream);
}

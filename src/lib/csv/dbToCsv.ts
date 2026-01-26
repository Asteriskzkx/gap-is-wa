import QueryStream from "pg-query-stream";
import { pgPool } from "@/lib/pg/pg";
import { streamToCsv } from "./streamToCsv";

export async function dbToCsv(
  sql: string,
  headers: string[]
) {
  const client = await pgPool.connect();

  const queryStream = new QueryStream(sql);
  const dbStream = client.query(queryStream);

  const csvStream = streamToCsv(dbStream, { headers });

  csvStream.on("end", () => client.release());
  csvStream.on("error", () => client.release());

  return csvStream;
}

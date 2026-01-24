import QueryStream from "pg-query-stream";
import { Readable } from "stream";
import { pgPool } from "@/lib/pg/pg";

export abstract class BaseExportRepository {
  protected async createQueryStream(
    sql: string,
    params: any[] = []
  ): Promise<Readable> {
    const client = await pgPool.connect();

    const query = new QueryStream(sql, params);
    const stream = client.query(query);

    const release = () => client.release();

    stream.on("end", release);
    stream.on("error", release);

    return stream;
  }

  protected async executeAggregation<T>(
    sql: string,
    params: any[] = []
  ): Promise<T[]> {
    const client = await pgPool.connect();

    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }
}

import QueryStream from "pg-query-stream";
import { Readable } from "stream";
import { pgPool } from "@/lib/pg/pg";
import { dateRange } from "@/types/dateRange";

export abstract class BaseExportRepository {

  // BaseExportRepository.ts
  protected buildDateWhere(
    column: string,
    dateRange?: dateRange,
    moreCondition: string[] = []
  ): string {
    if (!dateRange?.startDate && !dateRange?.endDate ) return "";

    const conditions: string[] = [];
    
    if (moreCondition.length > 0) {
      conditions.push(...moreCondition);
    }


    if (dateRange.startDate) {
      conditions.push(`${column} >= '${dateRange.startDate}'`);
    }

    if (dateRange.endDate) {
      conditions.push(`${column} <= '${dateRange.endDate}'`);
    }

    if (conditions.length === 0) return "";
    return `WHERE ${conditions.join(" AND ")}`;
  }


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

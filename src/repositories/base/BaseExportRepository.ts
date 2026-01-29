import QueryStream from "pg-query-stream";
import { Readable } from "stream";
import { pgPool } from "@/lib/pg/pg";

export abstract class BaseExportRepository {

  private isMockExport(): boolean {
    return (
      process.env.NODE_ENV !== "production" &&
      process.env.MOCK_EXPORT_COUNT === "true"
    );
  }

  protected async createQueryStream(
    sql: string,
    params: any[] = []
  ): Promise<Readable> {

     if (this.isMockExport() && !/count\s*\(/i.test(sql)) {
      console.log("🧪 MOCK STREAM:", sql);

      const mockRows = Array.from({ length: 100 }).map((_, i) => ({
        id: i + 1,
      }));

      return Readable.from(mockRows);
    }
    
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
    
    // 🧪 MOCK: COUNT
    if (this.isMockExport() && /count\s*\(/i.test(sql)) {
      console.log("🧪 MOCK COUNT:", sql);

      // FOR TC-040
      // if (sql.includes('"User"')) {
      //   return [{ count: 1_200_000 }] as any;
      // }
      
      // if (sql.includes('"Inspection"')) {
      //   return [{ count: 1_00 }] as any;
      // }

      // FOR TC-041

      
      // if (sql.includes('"CommitteePerformance"')) {
      //   return [{ count: 1_200_000 }] as any;
      // }
      
      // if (sql.includes('"Certificate"')) {
      //   return [{ count: 1_00 }] as any;
      // }

      return [{ count: 1_000_000 }] as any;
    }

    const client = await pgPool.connect();

    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }
}
import { Client } from "pg";
import QueryStream from "pg-query-stream";
import { Readable } from "stream";

export abstract class BaseExportRepository {
  protected async createQueryStream(sql: string): Promise<Readable> {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const stream = client.query(new QueryStream(sql));

    stream.on("end", () => client.end());
    stream.on("error", () => client.end());

    return stream;
  }

  protected async executeAggregation<T>(sql: string): Promise<T[]> {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    try {
      const result = await client.query(sql);
      return result.rows as T[];
    } finally {
      await client.end();
    }
  }
}

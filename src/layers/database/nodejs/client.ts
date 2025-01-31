import { Pool, QueryResult } from 'pg';
import * as mssql from 'mssql';

export type DatabaseType = 'postgres' | 'mssql';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  // MSSQL specific
  server?: string;
}

interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface MssqlConfig extends mssql.config {
  server: string;
  database: string;
  user: string;
  password: string;
}

export class DatabaseClient {
  private config: DatabaseConfig;
  private client: Pool | mssql.ConnectionPool | null;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.client = null;
  }

  async connect(): Promise<Pool | mssql.ConnectionPool> {
    if (this.client) return this.client;

    const dbType = process.env.DB_TYPE as DatabaseType;
    switch (dbType) {
      case 'postgres': {
        const pgConfig: PostgresConfig = {
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password
        };
        this.client = new Pool(pgConfig);
        break;
      }
      case 'mssql': {
        const mssqlConfig: MssqlConfig = {
          server: this.config.host,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          options: {
            trustServerCertificate: true
          }
        };
        this.client = await mssql.connect(mssqlConfig);
        break;
      }
      default:
        throw new Error(`Unsupported database type: ${process.env.DB_TYPE}`);
    }

    return this.client;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.connect();
    const dbType = process.env.DB_TYPE as DatabaseType;

    switch (dbType) {
      case 'postgres': {
        const { rows } = await (client as Pool).query(sql, params);
        return rows as T[];
      }
      case 'mssql': {
        const result = await (client as mssql.ConnectionPool)
          .request()
          .input('params', params)
          .query(sql);
        return result.recordset as T[];
      }
      default:
        throw new Error(`Unsupported database type: ${process.env.DB_TYPE}`);
    }
  }

  async close(): Promise<void> {
    if (!this.client) return;

    const dbType = process.env.DB_TYPE as DatabaseType;
    switch (dbType) {
      case 'postgres':
        await (this.client as Pool).end();
        break;
      case 'mssql':
        await (this.client as mssql.ConnectionPool).close();
        break;
    }
    this.client = null;
  }
}

export function createDatabaseClient(): DatabaseClient {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  };

  return new DatabaseClient(config);
}

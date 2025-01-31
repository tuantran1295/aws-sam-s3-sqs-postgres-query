import { Pool } from 'pg';
import * as mssql from 'mssql';
export type DatabaseType = 'postgres' | 'mssql';
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    server?: string;
}
export declare class DatabaseClient {
    private config;
    private client;
    constructor(config: DatabaseConfig);
    connect(): Promise<Pool | mssql.ConnectionPool>;
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    close(): Promise<void>;
}
export declare function createDatabaseClient(): DatabaseClient;

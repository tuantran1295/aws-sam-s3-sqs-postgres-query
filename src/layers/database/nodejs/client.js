"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseClient = void 0;
exports.createDatabaseClient = createDatabaseClient;
const pg_1 = require("pg");
const mssql = __importStar(require("mssql"));
class DatabaseClient {
    constructor(config) {
        this.config = config;
        this.client = null;
    }
    async connect() {
        if (this.client)
            return this.client;
        const dbType = process.env.DB_TYPE;
        switch (dbType) {
            case 'postgres': {
                const pgConfig = {
                    host: this.config.host,
                    port: this.config.port,
                    database: this.config.database,
                    user: this.config.user,
                    password: this.config.password
                };
                this.client = new pg_1.Pool(pgConfig);
                break;
            }
            case 'mssql': {
                const mssqlConfig = {
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
    async query(sql, params = []) {
        const client = await this.connect();
        const dbType = process.env.DB_TYPE;
        switch (dbType) {
            case 'postgres': {
                const { rows } = await client.query(sql, params);
                return rows;
            }
            case 'mssql': {
                const result = await client
                    .request()
                    .input('params', params)
                    .query(sql);
                return result.recordset;
            }
            default:
                throw new Error(`Unsupported database type: ${process.env.DB_TYPE}`);
        }
    }
    async close() {
        if (!this.client)
            return;
        const dbType = process.env.DB_TYPE;
        switch (dbType) {
            case 'postgres':
                await this.client.end();
                break;
            case 'mssql':
                await this.client.close();
                break;
        }
        this.client = null;
    }
}
exports.DatabaseClient = DatabaseClient;
function createDatabaseClient() {
    const config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };
    return new DatabaseClient(config);
}

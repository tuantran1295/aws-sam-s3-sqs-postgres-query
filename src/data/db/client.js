const { Pool } = require('pg');
const mssql = require('mssql');

class DatabaseClient {
  constructor(config) {
    this.config = config;
    this.client = null;
  }

  async connect() {
    if (this.client) return this.client;

    switch (process.env.DB_TYPE) {
      case 'postgres':
        this.client = new Pool(this.config);
        break;
      case 'mssql':
        this.client = await mssql.connect(this.config);
        break;
      default:
        throw new Error(`Unsupported database type: ${process.env.DB_TYPE}`);
    }

    return this.client;
  }

  async query(sql, params = []) {
    const client = await this.connect();

    switch (process.env.DB_TYPE) {
      case 'postgres':
        const { rows } = await client.query(sql, params);
        return rows;
      case 'mssql':
        const result = await client.request()
          .input('params', params)
          .query(sql);
        return result.recordset;
      default:
        throw new Error(`Unsupported database type: ${process.env.DB_TYPE}`);
    }
  }

  async close() {
    if (!this.client) return;

    switch (process.env.DB_TYPE) {
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

function createDatabaseClient() {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  return new DatabaseClient(config);
}

module.exports = { createDatabaseClient };

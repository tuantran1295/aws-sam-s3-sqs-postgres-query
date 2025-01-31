import { DatabaseClient } from '../client';

export interface Report {
  reportId: string;
  status: 'pending' | 'processing' | 'queued' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  request: any;
  exportLocation?: string;
  error?: string;
}

export interface StatusUpdateDetails {
  exportLocation?: string;
  error?: string;
}

export class ReportRepository {
  constructor(private db: DatabaseClient) {}

  async create(report: Omit<Report, 'exportLocation' | 'error'>): Promise<Report> {
    const sql = `
      INSERT INTO reports (
        report_id, status, created_at, updated_at, request_data
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING *
    `;

    const params = [
      report.reportId,
      report.status,
      report.createdAt,
      report.updatedAt,
      JSON.stringify(report.request)
    ];

    const [result] = await this.db.query<Report>(sql, params);
    return result;
  }

  async updateStatus(
    reportId: string,
    status: Report['status'],
    details: StatusUpdateDetails = {}
  ): Promise<Report> {
    const sql = `
      UPDATE reports
      SET status = $1,
          updated_at = $2,
          export_location = $3,
          error = $4
      WHERE report_id = $5
      RETURNING *
    `;

    const params = [
      status,
      new Date().toISOString(),
      details.exportLocation,
      details.error,
      reportId
    ];

    const [result] = await this.db.query<Report>(sql, params);
    return result;
  }

  async findById(reportId: string): Promise<Report | null> {
    const sql = `
      SELECT *
      FROM reports
      WHERE report_id = $1
    `;

    const [result] = await this.db.query<Report>(sql, [reportId]);
    return result || null;
  }

  async findByStatus(status: Report['status']): Promise<Report[]> {
    const sql = `
      SELECT *
      FROM reports
      WHERE status = $1
      ORDER BY created_at DESC
    `;

    return await this.db.query<Report>(sql, [status]);
  }
}

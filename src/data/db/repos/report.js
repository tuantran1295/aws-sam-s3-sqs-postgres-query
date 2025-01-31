class ReportRepository {
  constructor(dbClient) {
    this.db = dbClient;
  }

  async create(report) {
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

    const [result] = await this.db.query(sql, params);
    return result;
  }

  async updateStatus(reportId, status, details = {}) {
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

    const [result] = await this.db.query(sql, params);
    return result;
  }

  async findById(reportId) {
    const sql = `
      SELECT *
      FROM reports
      WHERE report_id = $1
    `;

    const [result] = await this.db.query(sql, [reportId]);
    return result;
  }

  async findByStatus(status) {
    const sql = `
      SELECT *
      FROM reports
      WHERE status = $1
      ORDER BY created_at DESC
    `;

    return await this.db.query(sql, [status]);
  }
}

module.exports = ReportRepository;

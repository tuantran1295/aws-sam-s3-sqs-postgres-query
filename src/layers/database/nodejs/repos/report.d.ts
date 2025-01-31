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
export declare class ReportRepository {
    private db;
    constructor(db: DatabaseClient);
    create(report: Omit<Report, 'exportLocation' | 'error'>): Promise<Report>;
    updateStatus(reportId: string, status: Report['status'], details?: StatusUpdateDetails): Promise<Report>;
    findById(reportId: string): Promise<Report | null>;
    findByStatus(status: Report['status']): Promise<Report[]>;
}

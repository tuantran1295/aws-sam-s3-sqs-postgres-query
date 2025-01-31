export interface ExportConfig {
    reportId: string;
    startDate: string;
    endDate: string;
    dealerIds?: string[];
    outputLocation: string;
}
export interface DataLake {
    startExport(config: ExportConfig): Promise<void>;
}
export declare function createDataLake(type?: string): DataLake;

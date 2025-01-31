import { DataLake, ExportConfig } from '../factory';
export declare class MockDataLake implements DataLake {
    private s3Client;
    constructor();
    startExport(config: ExportConfig): Promise<void>;
}

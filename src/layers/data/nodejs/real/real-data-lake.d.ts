import { DataLake, ExportConfig } from '../factory';
export declare class RealDataLake implements DataLake {
    startExport(config: ExportConfig): Promise<void>;
}

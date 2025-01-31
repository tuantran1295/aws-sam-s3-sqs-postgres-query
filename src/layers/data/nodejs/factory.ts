import { MockDataLake } from './mock/mock-data-lake';
import { RealDataLake } from './real/real-data-lake';

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

export function createDataLake(type = process.env.DATA_LAKE_TYPE || 'mock'): DataLake {
  switch (type) {
    case 'mock':
      return new MockDataLake();
    case 'real':
      return new RealDataLake();
    default:
      throw new Error(`Unknown data lake type: ${type}`);
  }
}

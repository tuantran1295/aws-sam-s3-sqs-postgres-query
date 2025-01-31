import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DataLake, ExportConfig } from '../factory';

interface DealerMetrics {
  sales: number;
  revenue: number;
  customers: number;
}

interface MockDataEntry {
  dealerId: string;
  date: string;
  metrics: DealerMetrics;
}

const mockData: MockDataEntry[] = [
  {
    dealerId: 'dealer123',
    date: '2023-01-01',
    metrics: {
      sales: 100,
      revenue: 50000,
      customers: 75
    }
  },
  {
    dealerId: 'dealer456',
    date: '2023-01-02',
    metrics: {
      sales: 150,
      revenue: 75000,
      customers: 100
    }
  }
];

export class MockDataLake implements DataLake {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({});
  }

  async startExport(config: ExportConfig): Promise<void> {
    const { startDate, endDate, dealerIds, outputLocation } = config;

    // Simulate data lake export by writing mock data to S3
    const filteredData = mockData.filter(data => {
      const date = new Date(data.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return date >= start &&
             date <= end &&
             (!dealerIds || dealerIds.includes(data.dealerId));
    });

    // Extract bucket and key from S3 URI
    const [bucket, ...keyParts] = outputLocation
      .replace('s3://', '')
      .split('/');
    const key = keyParts.join('/');

    // Write to S3 (this will trigger the processing Lambda)
    await this.s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: `${key}/data.json`,
      Body: JSON.stringify(filteredData),
      ContentType: 'application/json'
    }));
  }
}

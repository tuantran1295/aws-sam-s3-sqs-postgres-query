"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDataLake = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const mockData = [
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
class MockDataLake {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({});
    }
    async startExport(config) {
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
        await this.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: `${key}/data.json`,
            Body: JSON.stringify(filteredData),
            ContentType: 'application/json'
        }));
    }
}
exports.MockDataLake = MockDataLake;

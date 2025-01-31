const { S3 } = require('aws-sdk');

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
    this.s3 = new S3();
  }

  async startExport({ reportId, startDate, endDate, dealerIds, outputLocation }) {
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
    await this.s3.putObject({
      Bucket: bucket,
      Key: `${key}/data.json`,
      Body: JSON.stringify(filteredData),
      ContentType: 'application/json'
    }).promise();
  }
}

module.exports = MockDataLake;

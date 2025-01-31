const { handler } = require('../../../src/export/handlers/export');
const { createDatabaseClient } = require('../../../src/data/db/client');
const AWS = require('aws-sdk');

jest.mock('../../../src/data/db/client');
jest.mock('aws-sdk', () => {
  const mockS3 = {
    getObject: jest.fn().mockReturnThis(),
    putObject: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  return {
    S3: jest.fn(() => mockS3)
  };
});

describe('export handler', () => {
  let mockDb;
  let mockS3;

  beforeEach(() => {
    // Mock database client
    mockDb = {
      query: jest.fn().mockResolvedValue([{ id: 'test' }]),
      close: jest.fn().mockResolvedValue()
    };
    createDatabaseClient.mockReturnValue(mockDb);

    // Get mock S3 instance
    mockS3 = new AWS.S3();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process export data successfully', async () => {
    // Mock S3 getObject response with test data
    mockS3.promise.mockResolvedValueOnce({
      Body: Buffer.from(JSON.stringify([
        {
          dealerId: 'dealer123',
          metrics: {
            sales: 100,
            revenue: 50000,
            customers: 75
          }
        },
        {
          dealerId: 'dealer456',
          metrics: {
            sales: 150,
            revenue: 75000,
            customers: 100
          }
        }
      ]))
    });

    // Mock S3 putObject response
    mockS3.promise.mockResolvedValueOnce({});

    const event = {
      Records: [{
        body: JSON.stringify({
          reportId: 'report-123',
          dataLocation: 'test-bucket/exports/report-123/data.json'
        })
      }]
    };

    await handler(event);

    // Verify database status updates
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['processing'])
    );
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['completed'])
    );

    // Verify S3 interactions
    expect(mockS3.getObject).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'exports/report-123/data.json'
    });

    expect(mockS3.putObject).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'exports/report-123/result.json',
      Body: expect.stringContaining('"totalSales":250'),
      ContentType: 'application/json'
    });

    // Verify database was closed
    expect(mockDb.close).toHaveBeenCalled();
  });

  it('should handle invalid data format', async () => {
    // Mock S3 getObject response with invalid data
    mockS3.promise.mockResolvedValueOnce({
      Body: Buffer.from('invalid json')
    });

    const event = {
      Records: [{
        body: JSON.stringify({
          reportId: 'report-123',
          dataLocation: 'test-bucket/exports/report-123/data.json'
        })
      }]
    };

    await handler(event);

    // Verify error status update
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['failed'])
    );

    // Verify S3 putObject was not called
    expect(mockS3.putObject).not.toHaveBeenCalled();
  });

  it('should handle S3 errors', async () => {
    // Mock S3 error
    mockS3.promise.mockRejectedValue(new Error('S3 error'));

    const event = {
      Records: [{
        body: JSON.stringify({
          reportId: 'report-123',
          dataLocation: 'test-bucket/exports/report-123/data.json'
        })
      }]
    };

    await handler(event);

    // Verify error status update
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['failed'])
    );

    // Verify database was closed
    expect(mockDb.close).toHaveBeenCalled();
  });
});

const { handler } = require('../../../src/export/handlers/process-export');
const { createDatabaseClient } = require('../../../src/data/db/client');
const AWS = require('aws-sdk');

jest.mock('../../../src/data/db/client');
jest.mock('aws-sdk', () => {
  const mockS3 = {
    getObject: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  const mockSQS = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  return {
    S3: jest.fn(() => mockS3),
    SQS: jest.fn(() => mockSQS)
  };
});

describe('process-export handler', () => {
  let mockDb;
  let mockS3;
  let mockSQS;

  beforeEach(() => {
    // Mock database client
    mockDb = {
      query: jest.fn().mockResolvedValue([{ id: 'test' }]),
      close: jest.fn().mockResolvedValue()
    };
    createDatabaseClient.mockReturnValue(mockDb);

    // Get mock S3 and SQS instances
    mockS3 = new AWS.S3();
    mockSQS = new AWS.SQS();

    // Set environment variables
    process.env.EXPORT_QUEUE_URL = 'test-queue-url';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process export successfully', async () => {
    // Mock S3 response with valid data
    mockS3.promise.mockResolvedValue({
      Body: Buffer.from(JSON.stringify([{ id: 1 }]))
    });

    // Mock SQS response
    mockSQS.promise.mockResolvedValue({});

    const event = {
      Records: [{
        s3: {
          bucket: { name: 'test-bucket' },
          object: { key: 'exports/report-123/data.json' }
        }
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
      expect.arrayContaining(['queued'])
    );
    expect(mockDb.close).toHaveBeenCalled();

    // Verify S3 interaction
    expect(mockS3.getObject).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'exports/report-123/data.json'
    });

    // Verify SQS message
    expect(mockSQS.sendMessage).toHaveBeenCalledWith({
      QueueUrl: 'test-queue-url',
      MessageBody: expect.stringContaining('report-123')
    });
  });

  it('should handle invalid export data', async () => {
    // Mock S3 response with invalid data
    mockS3.promise.mockResolvedValue({
      Body: Buffer.from(JSON.stringify({ notAnArray: true }))
    });

    const event = {
      Records: [{
        s3: {
          bucket: { name: 'test-bucket' },
          object: { key: 'exports/report-123/data.json' }
        }
      }]
    };

    await handler(event);

    // Verify error status update
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['failed'])
    );

    // Verify SQS was not called
    expect(mockSQS.sendMessage).not.toHaveBeenCalled();
  });

  it('should handle S3 errors', async () => {
    // Mock S3 error
    mockS3.promise.mockRejectedValue(new Error('S3 error'));

    const event = {
      Records: [{
        s3: {
          bucket: { name: 'test-bucket' },
          object: { key: 'exports/report-123/data.json' }
        }
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

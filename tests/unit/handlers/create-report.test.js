const { handler } = require('../../../src/api/handlers/create-report');
const { createDataLake } = require('../../../src/data/factory');
const { createDatabaseClient } = require('../../../src/data/db/client');

jest.mock('../../../src/data/factory');
jest.mock('../../../src/data/db/client');

describe('create-report handler', () => {
  let mockDb;
  let mockDataLake;

  beforeEach(() => {
    // Mock database client
    mockDb = {
      query: jest.fn().mockResolvedValue([{ id: 'test' }]),
      close: jest.fn().mockResolvedValue()
    };
    createDatabaseClient.mockReturnValue(mockDb);

    // Mock data lake
    mockDataLake = {
      startExport: jest.fn().mockResolvedValue()
    };
    createDataLake.mockReturnValue(mockDataLake);

    // Set environment variables
    process.env.DATA_BUCKET = 'test-bucket';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a report successfully', async () => {
    const event = {
      body: JSON.stringify({
        filter: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          dealerIds: ['dealer123']
        }
      })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(202);
    const body = JSON.parse(response.body);
    expect(body.reportId).toBeDefined();
    expect(body.status).toBe('pending');

    // Verify database interactions
    expect(mockDb.query).toHaveBeenCalled();
    expect(mockDb.close).toHaveBeenCalled();

    // Verify data lake interaction
    expect(mockDataLake.startExport).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        dealerIds: ['dealer123']
      })
    );
  });

  it('should return 400 for missing required parameters', async () => {
    const event = {
      body: JSON.stringify({
        filter: {
          // Missing startDate and endDate
          dealerIds: ['dealer123']
        }
      })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Missing required filter parameters');
  });

  it('should handle errors gracefully', async () => {
    mockDb.query.mockRejectedValue(new Error('Database error'));

    const event = {
      body: JSON.stringify({
        filter: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Failed to initiate report');
    expect(body.details).toBe('Database error');
  });
});

# Report Generation POC

An event-driven report generation system using AWS SAM, S3, SQS, and Lambda.

## Architecture

The system follows an event-driven architecture:
1. API request initiates data lake export to S3
2. S3 event triggers processing Lambda when export completes
3. Processing Lambda validates data and queues for final processing
4. Export Lambda processes the data and generates final report

## Prerequisites

- Node.js 18.x
- AWS SAM CLI
- PostgreSQL or MSSQL (for local development)
- AWS CLI configured with appropriate credentials
- TypeScript 5.x

## Project Structure

```
report-poc/
├── src/
│   ├── layers/             # Lambda layers
│   │   ├── database/      # Database access layer (PostgreSQL/MSSQL)
│   │   │   └── nodejs/
│   │   │       ├── client.ts   # Database client with TypeScript types
│   │   │       └── repos/      # Type-safe repositories
│   │   ├── data/         # Data lake layer (Mock/Real implementations)
│   │   │   └── nodejs/
│   │   │       ├── mock/  # Mock data lake for testing
│   │   │       └── real/  # Real data lake implementation
│   │   └── global-dependencies/  # Shared dependencies
│   └── functions/        # Lambda functions
│       ├── create-export/  # Report creation endpoint
│       ├── process-export/ # S3 event processor
│       └── export/        # SQS message processor
├── scripts/              # Build and utility scripts
│   ├── build.sh         # TypeScript build script
│   └── create-function.sh # Function generator
├── tests/               # Test files
└── template.yaml       # SAM template
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure database:
```bash
# For PostgreSQL
export DB_TYPE=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=your_db
export DB_USER=your_user
export DB_PASSWORD=your_password

# Run migrations
npm run db:migrate:pg

# For MSSQL
export DB_TYPE=mssql
export DB_HOST=localhost
export DB_PORT=1433
export DB_NAME=your_db
export DB_USER=your_user
export DB_PASSWORD=your_password

# Run migrations
npm run db:migrate:mssql
```

## Development

### Creating New Functions

To create a new TypeScript Lambda function:
```bash
npm run create:function your-function-name
```

This will:
1. Create a new function directory with TypeScript setup
2. Initialize package.json with required dependencies
3. Set up Jest testing configuration
4. Create basic Lambda handler with TypeScript types
5. Configure layer references

The generated function includes:
- TypeScript configuration with proper layer references
- AWS Lambda type definitions
- Jest testing setup with TypeScript support
- Basic handler with error handling
- Layer imports for database and data access
- Type-safe event handling (API Gateway, SQS, S3)

After creating a function:
1. Add it to template.yaml
2. Implement your business logic
3. Run the build command

### TypeScript Configuration

Each function and layer includes its own TypeScript configuration:
- Functions reference layers through path mappings
- Layers compile to /opt/nodejs structure
- Type definitions are generated automatically
- Strict type checking is enabled
- AWS Lambda types are included
- Path aliases for clean imports

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Local Development

1. Start API locally:
```bash
npm run start-api
```

2. Invoke functions locally:
```bash
# Create a report
npm run invoke CreateReportFunction -e events/create-report.json

# Process export
npm run invoke ProcessExportFunction -e events/s3-event.json

# Run export
npm run invoke ExportFunction -e events/sqs-event.json
```

## Building and Deployment

### Building

The build process handles TypeScript compilation and SAM packaging:

```bash
npm run build
```

This will:
1. Build all TypeScript code in layers:
   - Compile database layer with type definitions
   - Compile data layer with mock/real implementations
   - Install layer dependencies
   - Generate d.ts files for type safety
2. Build all TypeScript code in functions:
   - Compile each function's TypeScript code
   - Install function dependencies
   - Generate type definitions
   - Resolve layer references
3. Package everything with SAM:
   - Bundle layers with their dependencies
   - Bundle functions with compiled code
   - Create deployment artifacts
   - Validate TypeScript types

### Deployment

Deploy to AWS:
```bash
# Deploy with mock data lake
npm run deploy -- --parameter-overrides DataLakeType=mock

# Deploy with real data lake
npm run deploy -- --parameter-overrides DataLakeType=real
```

## API Endpoints

### Create Report
- **POST** `/report`
- Request Body:
```json
{
  "filter": {
    "startDate": "2023-01-01",
    "endDate": "2023-12-31",
    "dealerIds": ["dealer123"]
  }
}
```
- Response:
```json
{
  "reportId": "uuid",
  "status": "pending",
  "message": "Report generation initiated"
}
```

## Database Schema

```sql
CREATE TABLE reports (
  report_id UUID PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  request_data JSONB NOT NULL,
  export_location TEXT,
  error TEXT
);
```

## Report Statuses

- `pending`: Initial state when report is created
- `processing`: Data lake export is being processed
- `queued`: Export completed and queued for processing
- `completed`: Report generation completed successfully
- `failed`: Report generation failed

## Testing

The project includes comprehensive tests:
- Unit tests for all Lambda handlers
- Integration tests for database operations
- Mocked AWS services (S3, SQS) in tests
- TypeScript type checking
- Jest configuration for TypeScript
- Type-safe mocks and assertions

Run tests with coverage report:
```bash
npm run test:coverage

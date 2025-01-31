-- PostgreSQL Schema
CREATE TABLE IF NOT EXISTS reports
(
    report_id
    UUID
    PRIMARY
    KEY,
    status
    VARCHAR
(
    50
) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    request_data JSONB NOT NULL,
    export_location TEXT,
    error TEXT
    );

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- MSSQL Schema (commented out, uncomment when using MSSQL)
/*
CREATE TABLE reports (
  report_id UNIQUEIDENTIFIER PRIMARY KEY,
  status NVARCHAR(50) NOT NULL,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL,
  request_data NVARCHAR(MAX) NOT NULL,
  export_location NVARCHAR(MAX),
  error NVARCHAR(MAX)
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
*/

-- Common status values:
-- pending: Initial state when report is created
-- processing: Data lake export is being processed
-- queued: Export completed and queued for processing
-- completed: Report generation completed successfully
-- failed: Report generation failed

CREATE TABLE Sales_Summary
(
    Dealer_ID     INT            NOT NULL,
    Report_Date   DATE           NOT NULL,
    Product      VARCHAR(50)    NOT NULL,
    Quantity_Sold INT            NOT NULL,
    Total_Sales   DECIMAL(10, 2) NOT NULL,
    Region       VARCHAR(50)    NOT NULL
);

INSERT INTO Sales_Summary (Dealer_ID, Report_Date, Product, Quantity_Sold, Total_Sales, Region)
VALUES (12345, '2025-01-01', 'Product A', 50, 2500.00, 'North America'),
       (12345, '2025-01-02', 'Product B', 40, 2000.00, 'Europe'),
       (12345, '2025-01-03', 'Product C', 60, 3000.00, 'Asia'),
       (12346, '2025-01-04', 'Product D', 70, 3500.00, 'South America'),
       (12347, '2025-01-05', 'Product E', 80, 4000.00, 'North America'),
       (12345, '2025-01-06', 'Product F', 90, 4500.00, 'Europe'),
       (12346, '2025-01-07', 'Product G', 30, 1500.00, 'Asia'),
       (12347, '2025-01-08', 'Product H', 20, 1000.00, 'North America'),
       (12348, '2025-01-09', 'Product I', 100, 5000.00, 'Europe'),
       (12349, '2025-01-10', 'Product J', 10, 500.00, 'Asia'),
       (12345, '2025-01-11', 'Product K', 25, 1250.00, 'South America'),
       (12346, '2025-01-12', 'Product L', 35, 1750.00, 'North America'),
       (12347, '2025-01-13', 'Product M', 45, 2250.00, 'Europe'),
       (12348, '2025-01-14', 'Product N', 55, 2750.00, 'Asia'),
       (12349, '2025-01-15', 'Product O', 65, 3250.00, 'North America'),
       (12345, '2025-01-16', 'Product P', 75, 3750.00, 'Europe'),
       (12346, '2025-01-17', 'Product Q', 85, 4250.00, 'Asia'),
       (12347, '2025-01-18', 'Product R', 95, 4750.00, 'South America'),
       (12348, '2025-01-19', 'Product S', 15, 750.00, 'North America'),
       (12349, '2025-01-20', 'Product T', 25, 1250.00, 'Europe'),
       (12345, '2025-01-21', 'Product U', 35, 1750.00, 'Asia'),
       (12346, '2025-01-22', 'Product V', 45, 2250.00, 'North America'),
       (12347, '2025-01-23', 'Product W', 55, 2750.00, 'Europe'),
       (12348, '2025-01-24', 'Product X', 65, 3250.00, 'Asia'),
       (12349, '2025-01-25', 'Product Y', 75, 3750.00, 'North America'),
       (12345, '2025-01-26', 'Product Z', 85, 4250.00, 'Europe'),
       (12346, '2025-01-27', 'Product AA', 95, 4750.00, 'Asia'),
       (12347, '2025-01-28', 'Product AB', 15, 750.00, 'North America'),
       (12348, '2025-01-29', 'Product AC', 25, 1250.00, 'Europe'),
       (12349, '2025-01-30', 'Product AD', 35, 1750.00, 'Asia'),
       (12345, '2025-01-31', 'Product AE', 45, 2250.00, 'North America'),
       (12346, '2025-02-01', 'Product AF', 55, 2750.00, 'Europe'),
       (12347, '2025-02-02', 'Product AG', 65, 3250.00, 'Asia'),
       (12348, '2025-02-03', 'Product AH', 75, 3750.00, 'North America'),
       (12349, '2025-02-04', 'Product AI', 85, 4250.00, 'Europe'),
       (12345, '2025-02-05', 'Product AJ', 95, 4750.00, 'Asia'),
       (12346, '2025-02-06', 'Product AK', 15, 750.00, 'North America'),
       (12347, '2025-02-07', 'Product AL', 25, 1250.00, 'Europe'),
       (12348, '2025-02-08', 'Product AM', 35, 1750.00, 'Asia'),
       (12349, '2025-02-09', 'Product AN', 45, 2250.00, 'North America'),
       (12345, '2025-02-10', 'Product AO', 55, 2750.00, 'Europe'),
       (12346, '2025-02-11', 'Product AP', 65, 3250.00, 'Asia'),
       (12347, '2025-02-12', 'Product AQ', 75, 3750.00, 'North America'),
       (12348, '2025-02-13', 'Product AR', 85, 4250.00, 'Europe'),
       (12349, '2025-02-14', 'Product AS', 95, 4750.00, 'Asia');

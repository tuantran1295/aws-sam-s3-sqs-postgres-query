import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createDatabaseClient } from '/opt/nodejs/client';
import { ReportRepository } from '/opt/nodejs/repos/report';

const s3Client = new S3Client({});
const sqsClient = new SQSClient({});

interface ExportMessage {
  reportId: string;
  dataLocation: string;
}

export const handler = async (event: S3Event): Promise<void> => {
  const db = createDatabaseClient();
  const reportRepo = new ReportRepository(db);

  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key);

      // Extract reportId from key (exports/{reportId}/data.json)
      const reportId = key.split('/')[1];

      try {
        // Update status to processing
        await reportRepo.updateStatus(reportId, 'processing');

        // Validate the exported data
        const response = await s3Client.send(new GetObjectCommand({
          Bucket: bucket,
          Key: key
        }));

        if (!response.Body) {
          throw new Error('No data received from S3');
        }

        const rawData = await response.Body.transformToString();
        const exportedData = JSON.parse(rawData);

        if (!Array.isArray(exportedData)) {
          throw new Error('Exported data is not in expected format');
        }

        // Queue export job
        const message: ExportMessage = {
          reportId,
          dataLocation: `${bucket}/${key}`
        };

        await sqsClient.send(new SendMessageCommand({
          QueueUrl: process.env.EXPORT_QUEUE_URL,
          MessageBody: JSON.stringify(message)
        }));

        // Update status to queued
        await reportRepo.updateStatus(reportId, 'queued', {
          exportLocation: `${bucket}/${key}`
        });

      } catch (error) {
        console.error(`Error processing export for report ${reportId}:`, error);
        await reportRepo.updateStatus(reportId, 'failed', {
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }
  } finally {
    await db.close();
  }
};

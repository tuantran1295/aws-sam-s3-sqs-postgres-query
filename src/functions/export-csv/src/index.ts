import {SQSEvent, SQSHandler, SQSRecord} from 'aws-lambda';
import {S3Client, ListObjectsV2Command, PutObjectCommand} from '@aws-sdk/client-s3';
import {Parser} from 'json2csv';
import crypto from "crypto";

const s3Client = new S3Client({});

const BUCKET_NAME = process.env.DATA_BUCKET;

const getNextVersion = async (dealerID: string, templateID: string, generationDate: string): Promise<number> => {
    const prefix = `SSE_${dealerID}/${templateID}/${generationDate}/`;
    try {
        const response = await s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix,
            Delimiter: "/"
        }));

        const versions = response.CommonPrefixes?.map(prefix => parseInt(prefix.Prefix?.split("/").slice(-2, -1)[0] || "1", 10)).filter(Number.isInteger) || [];
        return versions.length > 0 ? Math.max(...versions) + 1 : 1;
    } catch (error) {
        console.error("Error retrieving versions from S3", error);
        return 1;
    }
};

export const handler: SQSHandler = async (event: SQSEvent): Promise<any> => {
    for (const record of event.Records) {
        try {
            const message = JSON.parse(record.body);
            const {metadata, data} = message;

            if (!Array.isArray(data) || data.length === 0) {
                console.warn('No valid data to process');
                throw new Error('No valid data to process');
            }

            const formattedMetadata = Object.keys(metadata).reduce((acc, key) => {
                acc[key.toLowerCase()] = metadata[key].toString(); // Ensure lowercase and string values
                return acc;
            }, {} as Record<string, string>);

            console.debug("Metadata: ", formattedMetadata);

            const dealerID = data[0]?.dealer_id || 'unknown';
            const templateID = metadata.template_id || 'unknown';
            const generationDate = new Date().toISOString().split('T')[0];
            const timestamp = new Date()
                .toISOString()
                .replace(/[-:T.]/g, '')
                .slice(0, 15);
            const randomHash = crypto.randomBytes(3).toString('hex');
            const fileName = `${templateID}_${timestamp}_${randomHash}.csv`;

            const version = await getNextVersion(dealerID, templateID, generationDate);

            const filePath = `SSE_${dealerID}/${templateID}/${generationDate}/${version}/${fileName}`;

            const parser = new Parser();
            const csvData = parser.parse(data);

            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: filePath,
                Body: csvData,
                ContentType: 'text/csv',
                Metadata: formattedMetadata
            }));

            console.log(`File uploaded to S3: ${filePath}`);

            return {
                statusCode: 200,
                body: JSON.stringify([{message: 'Report uploaded to S3, file path: '}, filePath]),
            };

        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify([
                    {message: 'Error processing SQS message', error},
                ]),
            };
        }
    }
}

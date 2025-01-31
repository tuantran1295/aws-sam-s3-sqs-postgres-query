import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {createDatabaseClient} from '/opt/nodejs/client';
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const db = createDatabaseClient();

    const {dealer_id, template_id, start_date, end_date} = event.queryStringParameters || {};

    if (!dealer_id || !template_id || !start_date || !end_date) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'Missing required parameters'}),
        };
    }

    let reportType, query, queryParams, currentDB, result = null;

    try {
        await db.connect();

        const currentDBQuery = `SELECT current_database()`;
        currentDB = await db.query(currentDBQuery);

        reportType = camelToSnake(template_id);

        const query = `SELECT *
                       from ${reportType}
                       WHERE dealer_id = $1
                         AND report_date BETWEEN $2 AND $3`;
        queryParams = [dealer_id, start_date, end_date];
        result = await db.query(query, queryParams);

        queryParams = {dealer_id: dealer_id, start_date: start_date, end_date: end_date, report_type: reportType};

        const payload = {
            metadata: {
                template_id: template_id,
                query_start_date: start_date,
                query_end_date: end_date,
                query_params: JSON.stringify(queryParams),
            },
            data: result,
        }

        await db.close();

        await sqsClient.send(
            new SendMessageCommand({
                QueueUrl: process.env.EXPORT_QUEUE_URL,
                MessageBody: JSON.stringify(payload),
            }),
        );

        return {
            statusCode: 200,
            body: JSON.stringify([{message: 'Query result sent to SQS'}, payload]),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify([
                {
                    message: 'Error querying database or sending to SQS',
                    'Error: ': error,
                    'Report Template ID: ': reportType,
                    'Query: ': query,
                    'Params: ': queryParams,
                    'Current DB: ': currentDB,
                    'Result: ': result
                },
            ]),
        };
    }
};

function camelToSnake(camelStr: string): string {
    return camelStr.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}
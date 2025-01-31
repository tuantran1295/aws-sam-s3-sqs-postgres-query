import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../index';

describe('create-export-v2 Lambda function', () => {
  it('should return 200 with a message', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/create-export-v2',
      body: null
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.message).toBe('Hello from create-export-v2!');
  });
});

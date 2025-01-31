#!/bin/bash

# Check if function name is provided
if [ -z "$1" ]; then
    echo "Please provide a function name"
    echo "Usage: ./create-function.sh <function-name>"
    exit 1
fi

FUNCTION_NAME=$1
FUNCTION_PATH="src/functions/$FUNCTION_NAME"

# Create function directory
mkdir -p $FUNCTION_PATH

# Initialize package.json
cat > $FUNCTION_PATH/package.json << EOL
{
  "name": "${FUNCTION_NAME}-function",
  "version": "1.0.0",
  "description": "Lambda function for ${FUNCTION_NAME}",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "jest"
  },
  "dependencies": {
    "aws-lambda": "^1.0.7"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.10.119",
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "@types/jest": "^29.5.3",
    "jest": "^29.6.2",
    "ts-jest": "^29.1.1"
  }
}
EOL

# Initialize TypeScript configuration
cat > $FUNCTION_PATH/tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
EOL

# Create src directory
mkdir -p $FUNCTION_PATH/src

# Create index.ts with basic Lambda handler
cat > $FUNCTION_PATH/src/index.ts << EOL
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello from ${FUNCTION_NAME}!',
        event
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
};
EOL

# Create test directory and basic test file
mkdir -p $FUNCTION_PATH/src/__tests__

cat > $FUNCTION_PATH/src/__tests__/index.test.ts << EOL
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../index';

describe('${FUNCTION_NAME} Lambda function', () => {
  it('should return 200 with a message', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/${FUNCTION_NAME}',
      body: null
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.message).toBe('Hello from ${FUNCTION_NAME}!');
  });
});
EOL

# Make the script executable
chmod +x $FUNCTION_PATH/src/index.ts

# Install dependencies
cd $FUNCTION_PATH && npm install

echo "✅ Created new Lambda function: $FUNCTION_NAME"
echo "📁 Location: $FUNCTION_PATH"
echo "🚀 Next steps:"
echo "1. Add your function to template.yaml"
echo "2. Implement your business logic in src/index.ts"
echo "3. Run 'npm run build' to compile TypeScript"
echo "4. Run 'npm test' to run tests"

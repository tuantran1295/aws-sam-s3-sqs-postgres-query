const MockDataLake = require('./mock/mock-data-lake');
const RealDataLake = require('./real/real-data-lake');

function createDataLake(type = process.env.DATA_LAKE_TYPE || 'mock') {
  switch (type) {
    case 'mock':
      return new MockDataLake();
    case 'real':
      return new RealDataLake();
    default:
      throw new Error(`Unknown data lake type: ${type}`);
  }
}

module.exports = { createDataLake };

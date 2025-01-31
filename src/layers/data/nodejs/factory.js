"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataLake = createDataLake;
const mock_data_lake_1 = require("./mock/mock-data-lake");
const real_data_lake_1 = require("./real/real-data-lake");
function createDataLake(type = process.env.DATA_LAKE_TYPE || 'mock') {
    switch (type) {
        case 'mock':
            return new mock_data_lake_1.MockDataLake();
        case 'real':
            return new real_data_lake_1.RealDataLake();
        default:
            throw new Error(`Unknown data lake type: ${type}`);
    }
}

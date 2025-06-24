import { createAppSyncApiKey, executeTestAppSyncQueries } from '../../testLib';
import path from "path";
import fs from "fs";

const outputFolderPath = './test/TestCases/Case07/output';
const awsResources = JSON.parse(fs.readFileSync(path.join(outputFolderPath, 'AirportsJestSDKTest-resources.json'), 'utf8'));
const apiId = awsResources.AppSyncAPI;
const region = awsResources.region;
const apiKey = await createAppSyncApiKey(apiId, region);

describe(`Can query App Sync API successfully`, () => {
    executeTestAppSyncQueries({apiId: apiId, region: region, apiKey: apiKey});
});
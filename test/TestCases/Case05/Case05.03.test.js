import { createAppSyncApiKey, executeTestAppSyncQueries } from '../../testLib';
import fs from "fs";
import path from "path";

const outputFolderPath = './test/TestCases/Case05/output';
const awsResources = JSON.parse(fs.readFileSync(path.join(outputFolderPath, 'AirportsJestTest-resources.json'), 'utf8'));
const apiId = awsResources.AppSyncAPI;
const region = awsResources.region;
const apiKey = await createAppSyncApiKey(apiId, region);

describe(`Can query App Sync API successfully`, () => {
    executeTestAppSyncQueries({apiId: apiId, region: region, apiKey: apiKey});
});
import { executeTestAppSyncQueries } from "./testLib.js";

const apiId = process.env['APP_SYNC_API_ID'];
const apiKey = process.env['APP_SYNC_API_KEY'];
const region = process.env['APP_SYNC_REGION'];

/**
 * This test can be used to execute graphQL queries against an App Sync API that is specified via environment variables.
 * This can be useful to test manually deployed App Sync APIs that were not created as part of the integration test suite.
 * It requires the following environment variables to be set:
 * APP_SYNC_API_ID: The ID of the App Sync API
 * APP_SYNC_API_KEY: The API key for the App Sync API
 * APP_SYNC_REGION: The region where the App Sync API is hosted
 */
describe('Execute App Sync test queries', () => {
    if (apiId && apiKey && region) {
        executeTestAppSyncQueries({apiId: apiId, apiKey: apiKey, region: region});
    } else {
        console.log("Skipping App Sync test queries. Environment variables APP_SYNC_API_ID, APP_SYNC_API_KEY, and APP_SYNC_REGION can be set to enable App Sync test queries.");
        test('Test is disabled because no environment variables are set', () => {
            expect(apiId).toBeFalsy();
            expect(apiKey).toBeFalsy();
            expect(region).toBeFalsy();
        });
    }
});
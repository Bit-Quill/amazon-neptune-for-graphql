import { executeTestAppSyncQueries } from "./testLib.js";

const apiId = process.env['APP_SYNC_API_ID'];
const apiKey = process.env['APP_SYNC_API_KEY'];
const region = process.env['APP_SYNC_REGION'];


if (!apiId || !apiKey || !region) {
    console.error("Please set APP_SYNC_API_ID, APP_SYNC_API_KEY, and APP_SYNC_REGION environment variables.");
    process.exit(1);
}
describe('Execute App Sync test queries', () => {
    executeTestAppSyncQueries({apiId: apiId, apiKey: apiKey, region: region});
});
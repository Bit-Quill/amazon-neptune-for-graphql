
import { jest } from '@jest/globals';
import { readJSONFile } from '../../testLib';
import { main } from "../../../src/main";

const casetest = readJSONFile('./test/TestCases/Case04/get-db-schema.json');

async function executeUtility() {    
    process.argv = casetest.argv;
    await main();
}

test('Execute utility: ' + casetest.argv.join(' '), async () => {
    expect(await executeUtility()).not.toBe(null);    
}, 30000);

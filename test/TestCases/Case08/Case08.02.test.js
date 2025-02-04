import {readJSONFile, unzipAndGetContents} from '../../testLib';
import fs from "fs";
import {parseNeptuneEndpoint} from "../../../src/util.js";

describe('Validate Apollo Server output artifacts', () => {

    afterAll(async () => {
        fs.rmSync('./test/TestCases/Case08/output', {recursive: true});
    });

    test('Validate zip contents', () => {
        const expectedFiles = [
            '.env',
            'index.mjs',
            'output.resolver.graphql.js',
            'package.json',
            'package-lock.json',
            'schema.graphql',
            'neptune.mjs',
            'queryHttpNeptune.mjs'
        ];
        const actualFiles = unzipAndGetContents('./test/TestCases/Case08/output/unzipped', './test/TestCases/Case08/output/apollo.server.zip');
        expect(actualFiles.toSorted()).toEqual(expectedFiles.toSorted());
    });

    test('Validate .env values', () => {
        const testCase = readJSONFile('./test/TestCases/Case08/case01.json');
        const testDbInfo = parseNeptuneEndpoint(testCase.host + ':' + testCase.port);
        const expectedContent = [
            `NEPTUNE_TYPE=${testDbInfo.neptuneType}`,
            `NEPTUNE_HOST=${testCase.host}`,
            `NEPTUNE_PORT=${testCase.port}`,
            `AWS_REGION=${testDbInfo.region}`,
            'LOGGING_ENABLED=false',
            'SUBGRAPH=false'
        ];
        const actualContent = fs.readFileSync('./test/TestCases/Case08/output/unzipped/.env', 'utf8');
        expect(actualContent).toEqual(expectedContent.join('\n'));
    });

});
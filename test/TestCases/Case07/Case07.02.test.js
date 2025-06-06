import { checkFolderContainsFiles, checkOutputFilesContent, readJSONFile, unzipAndGetContents } from '../../testLib';
import path from "path";
import fs from "fs";

const outputFolderPath = './test/TestCases/Case07/output';

describe('Validate pipeline with sdk resolver output content', () => {
    const casetest = readJSONFile('./test/TestCases/Case07/case01.json');
    const expectedFiles = [
        'AirportsJestSDKTest.resolver.schema.json',
        'AirportsJestSDKTest.zip',
        'AirportsJestSDKTest-resources.json',
        'sdk.resolver.graphql.js',
        'sdk.schema.graphql',
        'sdk.source.schema.graphql'
    ];
    checkFolderContainsFiles(outputFolderPath, expectedFiles);
    checkOutputFilesContent(outputFolderPath, casetest.testOutputFilesContent, './test/TestCases/Case07/outputReference');

    test('Zip file contains expected files', async () => {
        const expectedFiles = [
            'index.mjs',
            'node_modules',
            'output.resolver.graphql.js',
            'output.resolver.schema.json',
            'package-lock.json',
            'package.json'
        ];


        const unzippedFolder = path.join(outputFolderPath, 'unzipped');
        const actualFiles = unzipAndGetContents(unzippedFolder, path.join(outputFolderPath, 'AirportsJestTest.zip'));
        expect(actualFiles.toSorted()).toEqual(expectedFiles.toSorted());

        // resolver should be using aws sdk
        const fileContent = fs.readFileSync(path.join(unzippedFolder, 'index.mjs'), 'utf8');
        expect(fileContent).toContain('@aws-sdk/client-neptune');
    });
});
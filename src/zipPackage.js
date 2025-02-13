import fs from 'fs';
import archiver from 'archiver';
import {loggerError} from "./logger.js";
import path from "path";
import {fileURLToPath} from "url";

export function getModulePath() {
    return path.dirname(fileURLToPath(import.meta.url));
}

export async function createZip({targetZipFilePath, includeFolderPaths = [], includeFilePaths = [], includeContent = []}) {
    try {
        const output = fs.createWriteStream(targetZipFilePath);
        const archive = archiver('zip', {zlib: {level: 9}});
        archive.pipe(output);
        includeFolderPaths.forEach(folderPath => {
            // if no target specified, add contents to root of archive
            archive.directory(folderPath.source, folderPath.target ?? false);
        });
        includeFilePaths.forEach(filePath => {
            archive.file(filePath.source, {name: filePath.target})
        })
        includeContent.forEach(content => {
            archive.append(content.source, {name: content.target});
        });
        await archive.finalize();
    } catch (error) {
        loggerError('Zip creation failed', error);
        throw error;
    }
}

/**
 * Creates a zip package of Apollo Server deployment artifacts.
 *
 * @param zipFilePath the file path where the zip should be created
 * @param resolverFilePath path to the resolver file to include in the zip
 * @param schemaFilePath path to the schema file to include in the zip
 * @param neptuneInfo object containing neptune db/graph related information such as URL, region, etc
 * @param options additional options which can determine the contents of the zip
 * @param options.subgraph true if the service should be deployed as a subgraph
 * @returns {Promise<void>}
 */
export async function createApolloDeploymentPackage(zipFilePath, resolverFilePath, schemaFilePath, neptuneInfo, options = {subgraph: false}) {
    const envVars = [
        `NEPTUNE_TYPE=${neptuneInfo.neptuneType}`,
        `NEPTUNE_HOST=${neptuneInfo.host}`,
        `NEPTUNE_PORT=${neptuneInfo.port}`,
        `AWS_REGION=${neptuneInfo.region}`,
        'LOGGING_ENABLED=false', // do not log query data by default
        `SUBGRAPH=${options?.subgraph || false}`
    ];
    const modulePath = getModulePath();
    try {
        await createZip({
            targetZipFilePath: zipFilePath,
            includeFolderPaths: [{source: path.join(modulePath, '/../templates/ApolloServer')}],
            includeFilePaths: [
                {source: resolverFilePath, target: 'output.resolver.graphql.js'},
                {source: schemaFilePath, target: 'schema.graphql'},
                // querying neptune using SDK not yet supported
                {source: path.join(modulePath, '/../templates/queryHttpNeptune.mjs'), target: 'queryHttpNeptune.mjs'}
            ],
            includeContent: [{source: envVars.join('\n'), target: '.env'}]
        })
    } catch (error) {
        loggerError('Apollo server deployment package creation failed', error);
        throw error;
    }
}

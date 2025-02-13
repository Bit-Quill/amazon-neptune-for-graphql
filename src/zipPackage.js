import fs from 'fs';
import archiver from 'archiver';
import {loggerError} from "./logger.js";
import path from "path";
import {fileURLToPath} from "url";

function getModulePath() {
    return path.dirname(fileURLToPath(import.meta.url));
}

export async function createZip({targetZipFilePath, includeFolderPaths = [], includeFilePaths = []}) {
    try {
        const output = fs.createWriteStream(targetZipFilePath);
        const archive = archiver('zip', {zlib: {level: 9}});
        archive.pipe(output);
        includeFolderPaths.forEach(folderPath => {
            // put folder contents in root of archive, not in a sub-folder
            archive.directory(folderPath, false);
        });
        includeFilePaths.forEach(filePath => {
            archive.file(filePath.source, {name: filePath.target})
        })
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
    const templateFolderPath = `${modulePath}/../templates/ApolloServer`;
    try {
        const archive = archiver('zip', {zlib: {level: 9}});
        archive.pipe(fs.createWriteStream(zipFilePath));
        archive.directory(templateFolderPath, false);
        archive.append(envVars.join('\n'), {name: ".env"});
        archive.file(resolverFilePath, {name: 'output.resolver.graphql.js'})
        archive.file(schemaFilePath, {name: 'schema.graphql'})
        // querying neptune using SDK not yet supported
        archive.file(modulePath + '/../templates/queryHttpNeptune.mjs', {name: 'queryHttpNeptune.mjs'})
        await archive.finalize();
    } catch (error) {
        loggerError('Apollo server deployment package creation failed', error);
        throw error;
    }
}

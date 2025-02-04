import fs from 'fs';
import archiver from 'archiver';
import {loggerError} from "./logger.js";
import path from "path";
import {fileURLToPath} from "url";

function getModulePath() {
    return path.dirname(fileURLToPath(import.meta.url));
}

/**
 * Creates a zip package of AWS Lambda deployment artifacts.
 *
 * @param templatePath path of the template folder that contains the template artifacts that should be included in the zip
 * @param zipFilePath path where the zip should be created
 * @param resolverFilePath path to the resolver file to include in the zip
 * @param options additional options which can determine the contents of the zip
 * @param options.http true if the lambda should use http to query neptune
 * @returns {Promise<void>}
 */
export async function createLambdaDeploymentPackage(templatePath, zipFilePath, resolverFilePath, options = {http: false}) {
    try {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {zlib: {level: 9}});
        archive.pipe(output);
        archive.directory(templatePath, false);
        archive.file(resolverFilePath, {name: 'output.resolver.graphql.js'})
        if (options?.http) {
            const modulePath = getModulePath();
            archive.file(modulePath + '/../templates/queryHttpNeptune.mjs', {name: 'queryHttpNeptune.mjs'})
        }
        await archive.finalize();
    } catch (error) {
        loggerError('Lambda deployment package creation failed', error);
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

import fs from 'fs';
import archiver from 'archiver';
import {loggerError} from "./logger.js";
import path from "path";
import {fileURLToPath} from "url";

function getModulePath() {
    return path.dirname(fileURLToPath(import.meta.url));
}

export async function createLambdaDeploymentPackage(templatePath, zipFilePath, options = {http: false}) {
    try {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(templatePath, false);
        archive.file('./output/output.resolver.graphql.js', { name: 'output.resolver.graphql.js' })
        if (options?.http) {
            const modulePath = getModulePath();
            archive.file(modulePath + '/../templates/queryHttpNeptune.js', {name: 'queryHttpNeptune.js'})
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
 * @param neptuneInfo object containing neptune db/graph related information such as URL, region, etc
 * @returns {Promise<void>}
 */
export async function createApolloDeploymentPackage(zipFilePath, neptuneInfo) {
    const envInfo = `NEPTUNE_TYPE=${neptuneInfo.neptuneType}\nNEPTUNE_HOST=${neptuneInfo.host}\nNEPTUNE_PORT=${neptuneInfo.port}\nAWS_REGION=${neptuneInfo.region}\nLOGGING_ENABLED=false`;
    const modulePath = getModulePath();
    const templateFolderPath = modulePath + '/../templates/ApolloServer';
    try {
        const archive = archiver('zip', {zlib: {level: 9}});
        archive.pipe(fs.createWriteStream(zipFilePath));
        archive.directory(templateFolderPath, false);
        archive.append(envInfo, {name: ".env"});
        archive.file('./output/output.resolver.graphql.js', {name: 'output.resolver.graphql.js'})
        archive.file('./output/output.schema.graphql', {name: 'schema.graphql'})
        // querying neptune using SDK not yet supported
        archive.file(modulePath + '/../templates/queryHttpNeptune.js', {name: 'queryHttpNeptune.js'})
        await archive.finalize();
    } catch (error) {
        loggerError('Apollo server deployment package creation failed', error);
    }
}

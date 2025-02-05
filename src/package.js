import fs from 'fs';
import archiver from 'archiver';
import { loggerError } from "./logger.js";

async function createLambdaDeploymentPackage(templatePath, zipFilePath) {
    try {       
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(templatePath, false);
        archive.file('./output/output.resolver.graphql.js', { name: 'output.resolver.graphql.js' })
        await archive.finalize();
    } catch (error) {
        loggerError('Lambda deployment package creation failed', error);
    }
}

/**
 * Creates a zip package of Apollo Server deployment artifacts.
 *
 * @param templateFolderPath the template folder path that contains the file artifacts that should be included in the zip package
 * @param zipFilePath the file path where the zip should be created
 * @param neptuneInfo object containing neptune db/graph related information such as URL, region, etc
 * @returns {Promise<void>}
 */
async function createApolloDeploymentPackage(templateFolderPath, zipFilePath, neptuneInfo) {
    const envInfo = `NEPTUNE_TYPE=${neptuneInfo.neptuneType}\nNEPTUNE_HOST=${neptuneInfo.host}\nNEPTUNE_PORT=${neptuneInfo.port}\nAWS_REGION=${neptuneInfo.region}\nLOGGING_ENABLED=false`;
    try {
        const archive = archiver('zip', {zlib: {level: 9}});
        archive.pipe(fs.createWriteStream(zipFilePath));
        archive.directory(templateFolderPath, false);
        archive.append(envInfo, {name: ".env"});
        archive.file('./output/output.resolver.graphql.js', {name: 'resolver.graphql.js'})
        archive.file('./output/output.schema.graphql', {name: 'schema.graphql'})
        await archive.finalize();
    } catch (error) {
        loggerError('Apollo server deployment package creation failed', error);
    }
}

export { createLambdaDeploymentPackage, createApolloDeploymentPackage }
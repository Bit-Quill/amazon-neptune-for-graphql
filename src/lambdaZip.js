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

async function createApolloDeploymentPackage(templatePath, zipFilePath, neptuneInfo) {
    const envInfo = `NEPTUNE_TYPE=${neptuneInfo.neptuneType}\nNEPTUNE_HOST=${neptuneInfo.host}\nNEPTUNE_PORT=${neptuneInfo.port}\nAWS_REGION=${neptuneInfo.region}`;
    try {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(templatePath, false);
        archive.append(envInfo, { name: ".env" });
        archive.file('./output/output.resolver.graphql.js', { name: 'output.resolver.graphql.js' })
        archive.file('./output/output.schema.graphql', { name: 'output.schema.graphql' })
        await archive.finalize();
    } catch (error) {
        loggerError('Apollo deployment package creation failed', error);
    }
}

export { createLambdaDeploymentPackage, createApolloDeploymentPackage }
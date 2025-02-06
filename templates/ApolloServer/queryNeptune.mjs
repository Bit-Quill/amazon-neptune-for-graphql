import axios from "axios";
import * as rax from 'retry-axios';
import a4I from "aws4-axios";
import cp from "@aws-sdk/credential-providers";
import dotenv from 'dotenv';
import { resolveGraphDBQuery} from './output.resolver.graphql.js'
import { queryNeptune } from './queryHttpNeptune.js'

dotenv.config();

const loggingEnabled = process.env.LOGGING_ENABLED;
const credentialProvider = cp.fromNodeProviderChain();
const credentials = await credentialProvider();
const interceptor = a4I.aws4Interceptor({
    options: {
        region: process.env.AWS_REGION,
        service: process.env.NEPTUNE_TYPE,
    },
    credentials: credentials
});
axios.default.interceptors.request.use(interceptor);
rax.attach();

export async function queryNeptuneWithGraphQL(query, args){
    let resultData = null;

    try {
        if (loggingEnabled) {
            console.log("Resolving graphQL query: ",query);
        }
        const resolver = resolveGraphDBQuery(query, args);
        if (loggingEnabled) {
            console.log("Resolved query: ", resolver);
        }

        resultData = queryNeptune(`https://${process.env.NEPTUNE_HOST}:${process.env.NEPTUNE_PORT}`, resolver, {loggingEnabled: loggingEnabled});
    } catch (err) {
        if (loggingEnabled) {
            console.error(err);
        }
        return {
            "error": [{ "message": err}]
        };
    }

    return resultData;
}
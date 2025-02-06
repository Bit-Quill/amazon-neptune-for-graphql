import axios from "axios";
import * as rax from 'retry-axios';
import a4I, { aws4Interceptor } from "aws4-axios";
import cp from "@aws-sdk/credential-providers";
import dotenv from 'dotenv';
import { resolveGraphDBQuery} from './output.resolver.graphql.js'
import { queryNeptune } from './queryHttpNeptune.js'

dotenv.config();

const LOGGING_ENABLED = process.env.LOGGING_ENABLED;
const NEPTUNE_TYPE = process.env.NEPTUNE_TYPE;
const AWS_REGION = process.env.AWS_REGION;

const credentialProvider = cp.fromNodeProviderChain();
const credentials = await credentialProvider();
const interceptor = a4I.aws4Interceptor({
    options: {
        region: AWS_REGION,
        service: NEPTUNE_TYPE,
    },
    credentials: credentials
});

axios.default.interceptors.request.use(interceptor);
rax.attach();

export const queryNeptuneWithGraphQL = async (query, args) => {
    let resultData = null;

    try {
        if (LOGGING_ENABLED) {
            console.log("Resolving graphQL query: ",query);
        }
        const resolver = resolveGraphDBQuery(query, args);
        if (LOGGING_ENABLED) {
            console.log("Resolved query: ", resolver);
        }

        resultData = queryNeptune(`https://${process.env.NEPTUNE_HOST}:${process.env.NEPTUNE_PORT}`, resolver, {loggingEnabled: LOGGING_ENABLED});
    } catch (err) {
        if (LOGGING_ENABLED) {
            console.error(err);
        }
        return {
            "error": [{ "message": err}]
        };
    }

    return resultData;
};
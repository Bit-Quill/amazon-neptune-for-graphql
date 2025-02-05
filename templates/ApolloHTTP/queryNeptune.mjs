import axios from "axios";
import * as rax from 'retry-axios';
import a4I, { aws4Interceptor } from "aws4-axios";
import cp from "@aws-sdk/credential-providers";
import dotenv from 'dotenv';
import { refactorGremlinqueryOutput, resolveGraphDBQuery} from './resolver.graphql.js'

dotenv.config();

const LOGGING_ENABLED = process.env.LOGGING_ENABLED;
const NEPTUNE_TYPE = process.env.NEPTUNE_TYPE;
const NEPTUNE_HOST = process.env.NEPTUNE_HOST;
const NEPTUNE_PORT = process.env.NEPTUNE_PORT;
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

        const myConfig = {
            raxConfig: {
              retry: 5,
              noResponseRetries: 5,
              onRetryAttempt: err => {
                const cfg = rax.getConfig(err);
                console.log(`Retry attempt #${cfg.currentRetryAttempt} Status: ${err.response.statusText}`);
              }
            },
            timeout: 20000
        };

        let response;
        if (resolver.language === 'opencypher') {
            response = await axios.post(`https://${NEPTUNE_HOST}:${NEPTUNE_PORT}/opencypher`, {
                query: resolver.query,
                parameters: JSON.stringify(resolver.parameters)
            }, myConfig);
        } else {
            response = await axios.post(`https://${NEPTUNE_HOST}:${NEPTUNE_PORT}/gremlin`, {
                gremlin: resolver.query
            }, myConfig);
        }
        if (LOGGING_ENABLED) {
            console.log("Query result: ", JSON.stringify(response.data, null, 2));
        }

        if (resolver.language === 'gremlin') {
            const gremlinData = response.data["result"]["data"];
            const jsonData = refactorGremlinqueryOutput(gremlinData, resolver.fieldsAlias);
            if (LOGGING_ENABLED) {
                console.log("Query result data: ", jsonData);
            }
            resultData = JSON.parse(jsonData);
        }

        if (resolver.language === 'opencypher') {
            let openCypherData = response.data;
            if (openCypherData.results.length === 0) {
                return null;
            }
            resultData = openCypherData.results[0][Object.keys(openCypherData.results[0])[0]];
        }
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
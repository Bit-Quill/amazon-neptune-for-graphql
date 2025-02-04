import axios from "axios";
import * as rax from 'retry-axios';
import a4I, { aws4Interceptor } from "aws4-axios";
import cp from "@aws-sdk/credential-providers";
import dotenv from 'dotenv';
import { refactorGremlinqueryOutput, resolveGraphDBQuery} from './output.resolver.graphql.js'

dotenv.config();

const LOGGING_ENABLED = true;
const NEPTUNE_TYPE = process.env.NEPTUNE_TYPE; // 'neptune-db' || 'neptune-graph'
const NEPTUNE_HOST = process.env.NEPTUNE_HOST;
const NEPTUNE_PORT = process.env.NEPTUNE_PORT;
const AWS_REGION = process.env.AWS_REGION;

let cred = null;

const credentialProvider = cp.fromNodeProviderChain();
if (cred == null) {
    cred = await credentialProvider();

    const interceptor = a4I.aws4Interceptor({
        options: {
            region: AWS_REGION,
            service: NEPTUNE_TYPE,
        },
        credentials: cred
    });

    axios.default.interceptors.request.use(interceptor);
}

rax.attach();

export const queryNeptuneWithGraphQL = async (graphqlQuery, args) => {
    let r = null;
    let resolver = { query:'', parameters: {}, language: 'opencypher', fieldsAlias: {} };
    let result = null;

    // Create Neptune query from GraphQL query
    try {
        if (LOGGING_ENABLED) console.log("Event: ",graphqlQuery);
        resolver = resolveGraphDBQuery(graphqlQuery, args);
        if (LOGGING_ENABLED) console.log("Resolver: ", resolver);

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
        
        if (resolver.language === 'opencypher') {
            result = await axios.post(`https://${NEPTUNE_HOST}:${NEPTUNE_PORT}/opencypher`, {
                query: resolver.query,
                parameters: JSON.stringify(resolver.parameters)
            }, myConfig);
        } else {
            result = await axios.post(`https://${NEPTUNE_HOST}:${NEPTUNE_PORT}/gremlin`, {
                gremlin: resolver.query
            }, myConfig);
        }
        if (LOGGING_ENABLED) console.log("Result: ", JSON.stringify(result.data, null, 2));
    } catch (err) {
        if (LOGGING_ENABLED) console.error(err);
        return {
            "error": [{ "message": err}]
        };
    }
    
    if (LOGGING_ENABLED) console.log("Got data.");

    // Based on Neptune query type
    if (resolver.language == 'gremlin') {
        const input = result.data["result"]["data"];
        const refac = refactorGremlinqueryOutput(input, resolver.fieldsAlias);
        if (LOGGING_ENABLED) console.log("Refac: ", refac);
        r = JSON.parse(refac);        
    } 

    if (resolver.language == 'opencypher') {
        let data = result.data;
        if (data.results.length == 0) {
            return null;
        }        
        r = data.results[0][Object.keys(data.results[0])[0]];
    }

    return r;
};
import { NeptuneGraphClient, ExecuteQueryCommand } from "@aws-sdk/client-neptune-graph";
import { resolveGraphDBQueryFromAppSyncEvent } from './output.resolver.graphql.js';

const LOGGING_ENABLED = process.env.LOGGING_ENABLED;
const PROTOCOL = 'https';
const QUERY_LANGUAGE = 'OPEN_CYPHER';
const RESOLVER_LANGUAGE = 'opencypher';

let client;

function getClient() {
    if (client) {
        return client;
    }
    try {
        client = new NeptuneGraphClient({
            port: `${process.env.NEPTUNE_PORT}`,
            host: `${process.env.NEPTUNE_DOMAIN}`,
            region: `${process.env.NEPTUNE_REGION}`,
            protocol: PROTOCOL,
        });
        return client;
    } catch (error) {
        return onError('Error instantiating NeptuneGraphClient: ', error);
    }
}


function onError(context, error) {
    let msg;
    if (error) {
        msg = context + ':' + error.message;
    } else {
        msg = context;
    }
    console.error(msg);
    return {
        "error": [{"message": msg}]
    };
}

export const handler = async(event) => {
    if (LOGGING_ENABLED) console.log(event);
    let resolver;

    try {
        resolver = resolveGraphDBQueryFromAppSyncEvent(event);
        if (LOGGING_ENABLED) console.log('Resolver: ' + JSON.stringify(resolver, null, 2));
    } catch (error) {
        return onError('Error resolving graphQL query', error);
    }
    if (resolver.language !== RESOLVER_LANGUAGE) {
        return onError('Unsupported resolver language:' + resolver.language)
    }

    try {
        const input = {
            graphIdentifier: `${process.env.NEPTUNE_DB_NAME}`,
            queryString: resolver.query,
            language: QUERY_LANGUAGE,
            parameters: resolver.parameters
        };
        if (LOGGING_ENABLED) console.log('input:' + JSON.stringify(input));
        const command = new ExecuteQueryCommand(input);
        const response = await getClient().send(command);
        let data = await new Response(response.payload).json();
        if (LOGGING_ENABLED) console.log('data:' + JSON.stringify(data));
        return data.results[0][Object.keys(data.results[0])[0]];
    } catch (error) {
        return onError('Error executing openCypher query: ', error);
    }
};
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';

import { readFileSync } from 'fs';
import { gql } from 'apollo-server'; // maybe there is an equivalent in @apollo/server
import { queryNeptuneWithGraphQL } from './queryNeptune.mjs'


const typeDefs = gql(readFileSync('./output.schema.graphql', 'utf-8'));


const queryDefinition = typeDefs.definitions.find(
    definition => definition.kind === 'ObjectTypeDefinition' && definition.name.value === 'Query'
);
const queryNames = queryDefinition.fields.map(field => field.name.value);

// TODO - mutation

const resolvers = {
    Query: queryNames.reduce((acc, queryName) => {
        acc[queryName] = (parent, args, context, info) => {
            let graphQLQuery = info.operation.loc.source.body;
            return queryNeptuneWithGraphQL(graphQLQuery, args).then((result) => {
                return result;
            });
        };
        return acc;
    }, {}),
};

const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }])
  });

/*
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
*/

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);


/*
const federationExtension = `
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.3"
      import: ["@key", "@shareable"]
    )
    `
const stringGeneratedSchema = graphql.printSchema(typeDefs)    
const schema = gql`${federationExtension} ${stringGeneratedSchema}`
*/
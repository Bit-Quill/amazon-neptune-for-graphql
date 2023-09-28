# Detailed Resources

Steps:

1. Run Neptune Graph Utility
2. Create the Lambda
3. Load in the Lambda the GraphQL resolver code
4. Create the AppSync API
5. Create the AppSync data source for the Lambda
6. Create the AppSync function for the Lambda with selectionSetGraphQL payload
7. Create the AppSync GraphQL Schema using the Neptune Graph Utility output
8. Attach to each GraphQL Schema operation the resolver function
9. Test using the AppSync Queries


## 1 . Run Neptune Graph Utility

Run the Neptune GraphQL Utility to generate the resolver code for the Lambda, and the GraphQL schema for AppSync.

Starting from an existing Neptune database.
Run the command below passing your Neptune cluster endpoint and port.
You can run the utility from a personal computer where you setup an SSH tunnel to an EC2 instance in the same VPC of your Neptune DB, or run the utility from an EC2 instance in the same Neptune VPC.

`neptune-for-graphql --input-graphdb-schema-neptune-endpoint` *your-database-endpoint:port*

The default output location for the GraphQL schema file to use in AppSync schema is: ./output/output.schema.graphql
The default output location of Lambda files that includes the resolver is: ./output/output.resolver.graphql.js


## 2. Create the Lambda

Create the AWS Lambda that will receive the AppSync query requests, resolve it into a Neptune graph query, query the Neptune database and return the result to AppSync.
To create the Lambda you have two options:

1. go to the Neptune documentation here https://docs.aws.amazon.com/neptune/latest/userguide/get-started-cfn-lambda.html, can run the CloudFormation template that creates the Lambda. Lambda runtime is Node.js 18x.
     (NOTE: the Neptune CloudFormation to create the Lambda is outdated, the nodejs12.x is no longer supported by Lambda)
2. go to Lambda console
    1. Create a new function, author from scratch
    2. Name the function ( you will point AppSync to this fucntion)
    3. Runtime: Node.js 18.x
    4. Open Advance settings, enable VPC, and select your Neptune DB VPC, Subnets and Security Group.
    5. Create the function
    6. Open the Lambda Environment Variables and add:
        1. NEPTUNE_HOST= your database endpoint
        2. NEPTUNE_IAM_AUTH_ENABLED = true
        3. NEPTUNE_PORT = your database port typically 8182

## 3. Load in the Lambda the GraphQL resolver code

1. Create a zip file called like the Lambda you just created with the content of the folder ./src/Lambda4AppSync/ and the ./output/output.resolver.graphql.js.
2. Go to the Lambda code source and delete the existing file index.mjs
3. Upload in the Lambda the zip file you just created, and Save
4. The Lambda is now ready

## 4. Create the AppSync API

1. Go to the AppSync Console
2. Create API
    1. Select “GraphQL API” and “Design from scratch”
    2. Next
    3. Name the API
    4. Next and Create API

## 5. Create the AppSync data source for the Lambda

1. Select “Data Sources” from the AppSync menu of your new API
    1. Create data source
    2. Name the data source
    3. Select “AWS Lambda function” as “Data source type”
    4. Select the region, same as Neptune Database and the Lambda
    5. Select the ARN of the Lambda you created
    6. Create

## 6. Create the AppSync function for the Lambda with selectionSetGraphQL payload

Select “Functions” from the AppSync menu of your new API

1. Create function
2. for “Data Source name” select the one you just created.
3. Name the function
4. replace the “Function code” with the following, then Create

```js
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const {source, args} = ctx
  return {
    operation: 'Invoke',
    payload: {
        field: ctx.info.fieldName, 
        arguments: args,
        selectionSetGraphQL: ctx.info.selectionSetGraphQL,
        source },
  };
}

export function response(ctx) {
  return ctx.result;
}
```

## 7. Create the AppSync GraphQL Schema using the Neptune Graph Utility output

Select “Schema” from the AppSync menu of your new API

1. Replace the AppSync Schema with the content of the Neptune GraphQL Utility output in the file with default named  ./output/output.schema.graphql.
2. Save Schema

## 8. Attach to each GraphQL Schema operation the resolver function

1. Scroll through the “Resolvers” list to Query
    1. for each field in the Query section select “Attach”
    2. In the “Create pipeline resolver” 
        1. “Add function“ selecting the AppSync function you just created
        2. Select “Create”
2. Go back to the AppSync Schema, and repeat the step above for each field in the Resolvers Query and Mutation section. Note: you might have to repeat it 10-30 times :(
3. Congratulation you have now a GraphQL API for your Neptune database

## 9. Test using the AppSync Queries

To test it, select “Query” in the AppSync menu of your new API.

1. from the “Explorer” select a query, the parameters and then “Run”

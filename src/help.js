/*
Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
A copy of the License is located at
    http://www.apache.org/licenses/LICENSE-2.0
or in the "license" file accompanying this file. This file is distributed
on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. See the License for the specific language governing
permissions and limitations under the License.
*/

const helpTxt =`
Amazon Neptune utility for GraphQL(TM) schemas and resolvers

Description
***********
Create a GraphQL API, Schema and Resolver for Amazon Neptune.
You have the option to start from an existing Amazon Neptune database, or a property graph database schema, or a GraphQL schema. 
The utility generates the GraphQL Schema and the Resolver code to query Amazon Neptune via a GraphQL server.
Optionally, the utility can create, update or remove an AppSync GraphQL API, and the AWS resources to query 
the Amazon Neptune database, or a CDK file. The utility generates an intermediate GraphQL schema that includes the 
directives that inform the resolver how to query the graph databases. If you input a GraphQL schema without graph 
database directives the utility inference them.

Input options:
- Amazon Neptune endpoint
- Property graph database schema  
- GraphQL schema

Output:
- AppSync GraphQL API
- GraphQL schema without directives, the default name is output.schema.graphql
- GraphQL schema with directives, the default name is output.source.schema.graphql
- GraphQL resolver Javascript resolver, the default name is output.lambda.index.js
- A zip file with the Lambda code, default name is output.lambda.zip
- A file with the list of AWS resources created
- CDK file with the Lambda zip file

Use cases
***********
Input an Amazon Neptune database enpoint
 - the utility capture the graph database schema and output it as file
 - the utility inference and output the GraphQL resolver, including operations like
   queries and mutations.
 - the utility also output the enriched schema with directives. It can be edited and
   used as input to the utility.

Input a GraphQL schema with no directives
 - the utility inference and output the GraphQL resolver, including operations like
   queries and mutations.
 - the utility also output the enriched schema with directives. It can be edited and
   used as input to the utility.

Input a GraphQL schema with directives
 - the utility inference and output the GraphQL resolvers, and a GraphQL schema 
   without directives.

Input a property graph database schema
 - the utility inference and output the GraphQL resolver, including operations like
   queries and mutations.
 - the utility also output the enriched schema with directives. It can be edited and
   used as input to the utility.
 - file format: { 
    "nodeStructures": [
        { "label":"nodelabel1", 
            "properties": [
                { "name":"name1", "type":"type1" }
            ]
        },
        { "label":"nodelabel2", 
            "properties": [
                { "name":"name2", "type":"type1" }
        ]}
    ],
    "edgeStructures": [
        { "label":"label1",
            "directions": [
                { "from":"nodelabel1", "to":"nodelabel2", "relationship":"ONE-ONE|ONE-MANY|MANY-MANY"  }
            ], 
            "properties": [
                { "name":"name1", "type":"type1" }
            ]
        }]
    }

Input a changes file
 - the user can remove or add to the GraphQL schema generated by the utility.
 - Changes file format: [
     { "type": "graphQLTypeName", 
       "field": "graphQLFieldName",       
       "action": "remove|add",
       "value": "value"
    }   
   ]

Create, update or remove the AWS resources pipeline for the AppSync GraphQL API
 - it creates the AWS Lambda execution role
 - it creates or update the AWS Lambda, in the Neptune DB VPC, set the environment variables, 
   and upload the resolver code generated by the utiliy.
 - it create or update the AWS AppSync GraphQL API, the datasource for the AWS Lambda, a function 
   with modified code, upload the schema generated by the utility, map for each query and mutation
   the resolver function.

Create the CDK Files
 - it output a CDK file with the class
 - it output the Lamdbda zip file with the resolver code


Parameters
***********
[--help                                                     -h   ]
[--version                                                  -v   ]
[--quiet                                                    -q   ]

[--input-schema <value>                                     -is  ]
[--input-schema-file <value>                                -isf ]
[--input-schema-changes-file <value>                        -isc ]   
[--input-graphdb-schema <value>                             -ig  ]
[--input-graphdb-schema-file <value>                        -igf ]
[--input-graphdb-schema-neptune-endpoint <value>            -ie  ]

[--output-folder-path <value>                               -o   ]  default: ./output
[--output-schema-file <value>                               -os  ]  default: output.schema.graphql
[--output-source-schema-file <value>                        -oss ]  default: output.source.schema.graphql
[--output-schema-no-mutations                               -onm ]  default: false
[--output-neptune-schema-file                               -og  ]  default: output.neptune.schema.json
[--output-js-resolver-file <value>                          -or  ]  default: output.resolver.graphql.js
[--output-lambda-resolver-zip-file <value>                  -olf ]  default: output.lambda.zip
[--output-no-lambda-zip                                     -onl ]
[--output-resolver-query-https |                            -orh ]  default: SDK, this is the Neptune query menthod
 --output-resolver-query-sdk]                               -ors ]

[--create-update-aws-pipeline                               -p   ]
[--create-update-aws-pipeline-name <value>                  -pn  ]  default: Neptune DB name from --input-graphdb-schema-neptune-endpoint if exists
[--create-update-aws-pipeline-region <value>                -pr  ]  default: us-east-1 or from --input-graphdb-schema-neptune-endpoint if exists
[--create-update-aws-pipeline-neptune-endpoint <value>      -pe  ]  default: --input-graphdb-schema-neptune-endpoint if exists
[--create-update-aws-pipeline-neptune-database-name <value> -pd  ]
[--create-update-aws-pipeline-neptune-IAM                   -pi  ]  default: is Neptune VPC
[--remove-aws-pipeline-name <value>                         -rp  ]  

[--output-aws-pipeline-cdk                                  -c   ]
[--output-aws-pipeline-cdk-name <value>                     -cn  ]  default: Neptune DB name from --input-graphdb-schema-neptune-endpoint if exists
[--output-aws-pipeline-cdk-neptune-endpoint <value>         -ce  ]  default: --input-graphdb-schema-neptune-endpoint if exists
[--output-aws-pipeline-cdk-neptune-database-name <value>    -cd  ]
[--output-aws-pipeline-cdk-region <value>                   -cr  ]  default: us-east-1 or from --input-graphdb-schema-neptune-endpoint if exists
[--output-aws-pipeline-cdk-file <value>                     -cf  ]  default: --output-aws-pipeline-cdk-name <value>-cdk.js
[--output-aws-pipeline-cdk-neptune-IAM                      -ci  ]  default: is Neptune VPC

`

export { helpTxt };
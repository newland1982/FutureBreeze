//triggered by dynamodb stream
'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const gql = require('graphql-tag');

AWS.config.region = process.env.REGION;
const credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.IDENTITYPOOLID
});

const poolData = {
  UserPoolId: process.env.USERPOOLID,
  ClientId: process.env.CLIENTID
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const query = gql(`
query GetIpAddressList($input: GetIpAddressListInput!) {
	getIpAddressList(input: $input) {
		ipAddressList {
			ipAddress
		}
	}
}`);

const client = new AWSAppSyncClient({
  url: process.env.ENDPOINT,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

exports.handler = (event, context, callback) => {
  event.Records.forEach(record => {
    console.log('eventName', record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
    console.log('heyhey', record.dynamodb.NewImage.ipAddress.S);

    const GetIpAddressListInput = {
      ipAddress: record.dynamodb.NewImage.ipAddress.S
    };
    let ipAddressCount;
    if (record.eventName === 'INSERT') {
      (async () => {
        await client.hydrated();

        const result = await client
          .query({
            query,
            variables: { input: GetIpAddressListInput },
            fetchPolicy: 'network-only'
          })
          .catch(error => console.log(error));
        console.log(result.data.getIpAddressList.ipAddressList.length);
        ipAddressCount = result.data.getIpAddressList.ipAddressList.length;
        console.log('ipaddresscount', ipAddressCount);
        if (ipAddressCount > 4) {
          console.log('more than 3!!!', ipAddressCount);
        }
      })();
    }
  });
};

// layer package.json
{
  "dependencies": {
    "apollo-cache-inmemory": "^1.1.0",
    "apollo-client": "^2.0.3",
    "apollo-link": "^1.0.3",
    "apollo-link-http": "^1.2.0",
    "aws-sdk": "^2.141.0",
    "aws-appsync": "^1.0.0",
    "es6-promise": "^4.1.1",
    "graphql": "^0.11.7",
    "graphql-tag": "^2.5.0",
    "isomorphic-fetch": "^2.2.1",
    "ws": "^3.3.1",
    "amazon-cognito-identity-js": "^3.2.0"
  }
}

//Schema
input CreateUserInfoInput {
	id: ID
	ipAddress: String
	userName: String!
	createdDate: String
	password: String
	status: String
}

input GetIpAddressListInput {
	ipAddress: String!
}

type IpAddress {
	ipAddress: String!
}

type IpAddressList {
	ipAddressList: [IpAddress!]!
}

type Mutation {
	createUserInfo(input: CreateUserInfoInput!): UserName
}

type Query {
	getIpAddressList(input: GetIpAddressListInput!): IpAddressList
	getUserInfo(userName: String!, createdDate: String!): UserName
}

type UserInfo {
	id: ID
	ipAddress: String
	userName: String!
	createdDate: String
	password: String
	status: String
}

type UserName {
	userName: String!
}

schema {
	query: Query
	mutation: Mutation
}

//Mutation Resolver
{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
  	 "id" : { "S" : "${util.autoId()}" },
     "ipAddress" : { "S" : "${context.identity.sourceIp[0]}"},
  },
  
  "attributeValues" : {
      "userName": { "S" : "${context.arguments.input.userName}" },
      "password": { "S" : "${context.arguments.input.password}" },
      "createdDate": { "S" : "$util.time.nowFormatted("yyyy-MM-dd")" },
  },
  "condition": {
    "expression": "attribute_not_exists(#id)",
    "expressionNames": {
      "#id": "id"
    },
  },
}

$util.toJson($ctx.result)

//Query Resolver
{
  "version" : "2017-02-28",
  "operation" : "Query",
  "index" : "ipAddress-index",
  "query" : {
    "expression": "ipAddress = :ipAddress",
      "expressionValues" : {
        ":ipAddress" : { "S" : "${context.arguments.input.ipAddress}" }
      }
  }
}

{
  "ipAddressList": $utils.toJson($context.result.items)
}

//pre-signup
exports.handler = (event, context, callback) => {
  if (!event.userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
    callback(new Error('invalid userName'), event);
  } else {
    event.response.autoConfirmUser = false;
    callback(null, event);
  }
};

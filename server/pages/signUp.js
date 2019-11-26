//triggered by dynamodb stream
'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;

const AWS = require('aws-sdk');
// AWS.config.update({
//   region: process.env.REGION,
//   credentials: new AWS.Credentials({
//     accessKeyId: process.env.ACCESSKEYID,
//     secretAccessKey: process.env.SECRETACCESSKEY
//   })
// });
AWS.config.region = process.env.REGION;
const credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.IDENTITYPOOLID
});

const gql = require('graphql-tag');
const query = gql(`
query GetIpAddress($input: GetIpAddressInput!) {
  getIpAddress(input: $input) {
    ipAddressList {ipAddress}
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
    console.log('heyhey', record.dynamodb.Keys.ipAddress.S);

    const GetIpAddressInput = {
      ipAddress: record.dynamodb.Keys.ipAddress.S
    };
    console.log('fafds', GetIpAddressInput);

    if (record.eventName == 'INSERT') {
      client.hydrated().then(function(client) {
        client
          .query({
            query,
            variables: { input: GetIpAddressInput },
            fetchPolicy: 'network-only'
          })
          .then(function logData(data) {
            console.log('results of queryyyyyy: ', data);
            console.log(
              'results of queraaaaa: ',
              data.data.getIpAddress.ipAddressList.length
            );
          })
          .catch(console.error);
      });
    }
  });
};

//Schema
input CreateUserInfoInput {
	id: ID
	ipAddress: String
	userName: String!
	createdDate: String
	password: String
	status: String
}

input GetIpAddressInput {
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
	getIpAddress(input: GetIpAddressInput!): IpAddressList
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
  "items": $utils.toJson($context.result.items)
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

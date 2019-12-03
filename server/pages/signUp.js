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

const queryGetIpAddressList = gql(`
  query GetIpAddressList($input: GetIpAddressListInput!) {
    getIpAddressList(input: $input) {
      ipAddressList {
        ipAddress
      }
    }
  }`);

const mutationSetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      status
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
    if (record.eventName !== 'INSERT') {
      return;
    }
    console.log('eventName', record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
    console.log('heyhey', record.dynamodb.NewImage.ipAddress.S);

    const GetIpAddressListInput = {
      ipAddress: record.dynamodb.NewImage.ipAddress.S
    };
    let ipAddressCount;

    (async () => {
      await client.hydrated();

      const result = await client
        .query({
          query: queryGetIpAddressList,
          variables: { input: GetIpAddressListInput },
          fetchPolicy: 'network-only'
        })
        .catch(error => console.log(error));
      console.log(result.data.getIpAddressList.ipAddressList.length);
      console.log('yuyu', result.data);
      ipAddressCount = result.data.getIpAddressList.ipAddressList.length;
      console.log('ipaddresscount', ipAddressCount);
      if (ipAddressCount > process.env.ACCESSLIMIT) {
        const SetStatusInput = {
          id: record.dynamodb.NewImage.id.S,
          ipAddress: record.dynamodb.NewImage.ipAddress.S,
          status: 'accessLimitExceeded'
        };
        console.log('SetStatusInput', SetStatusInput);

        await client
          .mutate({
            mutation: mutationSetStatus,
            variables: { input: SetStatusInput },
            fetchPolicy: 'no-cache'
          })
          .catch(error => console.log(error));
        return;
      }
      userPool.signUp(
        record.dynamodb.NewImage.userName.S,
        record.dynamodb.NewImage.password.S,
        [],
        null,
        (error, result) => {
          if (error) {
            console.log(error);
            return;
          }
          console.log('user name is ', result);
        }
      );
    })();
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
	password: String!
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
	setStatus(input: SetStatusInput!): Status
}

type Query {
	getIpAddressList(input: GetIpAddressListInput!): IpAddressList
	getUserInfo(userName: String!, createdDate: String!): UserName
}

input SetStatusInput {
	id: ID!
	ipAddress: String!
	status: String!
}

type Status {
	status: String!
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

//Mutation.createUserInfo Resolver
{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
  	 "id" : { "S" : "${util.autoId()}" },
     "ipAddress" : { "S" : "${context.identity.sourceIp[0]}"}
  },
  
  "attributeValues" : {
      "userName": { "S" : "${context.arguments.input.userName}" },
      "createdDate": { "S" : "$util.time.nowFormatted("yyyy-MM-dd")" },
      "password": { "S" : "${context.arguments.input.password}" },
      "status": { "S" : "init" }
  },
  "condition": {
    "expression": "attribute_not_exists(#id)",
    "expressionNames": {
      "#id": "id"
    },
  }
}

$util.toJson($ctx.result)

//Mutation.setStatus Resolver
{
  "version" : "2017-02-28",
  "operation" : "UpdateItem",
  "key" : {
      "id" : { "S" : "${context.arguments.input.id}" },
      "ipAddress" : { "S" : "${context.arguments.input.ipAddress}"}
  },
  "update" : {
      "expression" : "SET #status = :status",
      "expressionNames": {
          "#status" : "status"
      },
      "expressionValues": {
          ":status" : { "S": "${context.arguments.input.status}" }
      }
  }
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
    event.response.autoConfirmUser = true;
    callback(null, event);
  }
};

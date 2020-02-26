'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;

const poolData = {
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.CLIENT_ID
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const mutationSetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      status
    }
  }`);

const queryGetIpAddressList = gql(`
  query GetIpAddressList($input: GetIpAddressListInput!) {
    getIpAddressList(input: $input) {
      ipAddressList {
        ipAddress
      }
    }
  }`);

const queryGetStatus = gql(`
  query GetStatus($input: GetStatusInput!) {
    getStatus(input: $input) {
      status
    }
  }`);

const client = new AWSAppSyncClient({
  url: process.env.END_POINT_SignUpUsers,
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

    let ipAddressCount;

    const commonSetStatusInput = {
      id: record.dynamodb.NewImage.id.S
    };

    const getIpAddressListInput = {
      ipAddress: record.dynamodb.NewImage.ipAddress.S
    };

    const getStatusInput = {
      id: record.dynamodb.NewImage.id.S
    };

    (async () => {
      await client.hydrated();

      const queryGetStatusResult = await client
        .query({
          query: queryGetStatus,
          variables: { input: getStatusInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {
          await client
            .mutate({
              mutation: mutationSetStatus,
              variables: {
                input: { ...commonSetStatusInput, status: 'signUpError' }
              },
              fetchPolicy: 'no-cache'
            })
            .catch(() => {});
        });

      if (
        queryGetStatusResult.data.getStatus.status === 'processing' ||
        queryGetStatusResult.data.getStatus.status === 'completed'
      ) {
        return;
      }

      await client
        .mutate({
          mutation: mutationSetStatus,
          variables: {
            input: { ...commonSetStatusInput, status: 'processing' }
          },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});

      const result = await client
        .query({
          query: queryGetIpAddressList,
          variables: { input: getIpAddressListInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {
          await client
            .mutate({
              mutation: mutationSetStatus,
              variables: {
                input: { ...commonSetStatusInput, status: 'signUpError' }
              },
              fetchPolicy: 'no-cache'
            })
            .catch(() => {});
        });

      ipAddressCount = result.data.getIpAddressList.ipAddressList.length;

      if (ipAddressCount > process.env.ACCESS_LIMIT) {
        await client
          .mutate({
            mutation: mutationSetStatus,
            variables: {
              input: { ...commonSetStatusInput, status: 'accessLimitExceeded' }
            },
            fetchPolicy: 'no-cache'
          })
          .catch(() => {});
        return;
      }

      userPool.signUp(
        record.dynamodb.NewImage.fullUsername.S,
        record.dynamodb.NewImage.password.S,
        [],
        null,
        async (error, result) => {
          if (error) {
            await client
              .mutate({
                mutation: mutationSetStatus,
                variables: {
                  input: { ...commonSetStatusInput, status: 'signUpError' }
                },
                fetchPolicy: 'no-cache'
              })
              .catch(() => {});
            return;
          }
        },
        {
          id: record.dynamodb.NewImage.id.S
        }
      );
    })();
  });
};

/* layer package.json
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
*/

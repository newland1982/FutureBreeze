'use strict';

// @ts-ignore
global.WebSocket = require('ws');
// @ts-ignore
require('es6-promise').polyfill();
require('isomorphic-fetch');
// @ts-ignore
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
// @ts-ignore
const AWSAppSyncClient = require('aws-appsync').default;
// @ts-ignore
const AWS = require('aws-sdk');
// @ts-ignore
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
// @ts-ignore
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;

const poolData = {
  UserPoolId: process.env.User_Pool_Id,
  ClientId: process.env.Client_Id,
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const signUpUsersMutationSetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      status
    }
  }`);

const signUpUsersQueryGetIpAddresses = gql(`
  query GetIpAddresses($input: GetIpAddressesInput!) {
    getIpAddresses(input: $input) {
      ipAddresses {
        ipAddress
      }
    }
  }`);

const signUpUsersQueryGetStatus = gql(`
  query GetStatus($input: GetStatusInput!) {
    getStatus(input: $input) {
      status
    }
  }`);

const signUpUsersClient = new AWSAppSyncClient({
  url: process.env.AppSync_SignUpUsers,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName !== 'INSERT') {
      return;
    }

    let ipAddressCount;

    const commonSignUpUsersMutationSetStatusInput = {
      id: record.dynamodb.NewImage.id.S,
    };

    const signUpUsersQueryGetIpAddressesInput = {
      ipAddress: record.dynamodb.NewImage.ipAddress.S,
    };

    const signUpUsersQueryGetStatusInput = {
      id: record.dynamodb.NewImage.id.S,
    };

    (async () => {
      await signUpUsersClient.hydrated();

      const signUpUsersQueryGetStatusResult = await signUpUsersClient
        .query({
          query: signUpUsersQueryGetStatus,
          variables: { input: signUpUsersQueryGetStatusInput },
          fetchPolicy: 'network-only',
        })
        .catch(async () => {
          await signUpUsersClient.mutate({
            mutation: signUpUsersMutationSetStatus,
            variables: {
              input: {
                ...commonSignUpUsersMutationSetStatusInput,
                status: 'signUpError',
              },
            },
            fetchPolicy: 'no-cache',
          });
        });

      if (
        signUpUsersQueryGetStatusResult.data.getStatus.status ===
          'processing' ||
        signUpUsersQueryGetStatusResult.data.getStatus.status === 'completed'
      ) {
        return;
      }

      await signUpUsersClient.mutate({
        mutation: signUpUsersMutationSetStatus,
        variables: {
          input: {
            ...commonSignUpUsersMutationSetStatusInput,
            status: 'processing',
          },
        },
        fetchPolicy: 'no-cache',
      });

      const result = await signUpUsersClient
        .query({
          query: signUpUsersQueryGetIpAddresses,
          variables: { input: signUpUsersQueryGetIpAddressesInput },
          fetchPolicy: 'network-only',
        })
        .catch(async () => {
          await signUpUsersClient.mutate({
            mutation: signUpUsersMutationSetStatus,
            variables: {
              input: {
                ...commonSignUpUsersMutationSetStatusInput,
                status: 'signUpError',
              },
            },
            fetchPolicy: 'no-cache',
          });
        });

      ipAddressCount = result.data.getIpAddresses.ipAddresses.length;

      if (ipAddressCount > process.env.Access_Limit) {
        await signUpUsersClient.mutate({
          mutation: signUpUsersMutationSetStatus,
          variables: {
            input: {
              ...commonSignUpUsersMutationSetStatusInput,
              status: 'accessLimitExceeded',
            },
          },
          fetchPolicy: 'no-cache',
        });
        return;
      }

      userPool.signUp(
        record.dynamodb.NewImage.accountName.S,
        record.dynamodb.NewImage.password.S,
        [],
        null,
        async (error, result) => {
          if (error) {
            await signUpUsersClient.mutate({
              mutation: signUpUsersMutationSetStatus,
              variables: {
                input: {
                  ...commonSignUpUsersMutationSetStatusInput,
                  status: 'signUpError',
                },
              },
              fetchPolicy: 'no-cache',
            });
            return;
          }
        },
        {
          id: record.dynamodb.NewImage.id.S,
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

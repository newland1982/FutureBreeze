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

const signUpUsersMutationSetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      status
    }
  }`);

const signUpUsersQueryGetIpAddressList = gql(`
  query GetIpAddressList($input: GetIpAddressListInput!) {
    getIpAddressList(input: $input) {
      ipAddressList {
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

    const commonSignUpUsersMutationSetStatusInput = {
      id: record.dynamodb.NewImage.id.S
    };

    const signUpUsersQueryGetIpAddressListInput = {
      ipAddress: record.dynamodb.NewImage.ipAddress.S
    };

    const signUpUsersQueryGetStatusInput = {
      id: record.dynamodb.NewImage.id.S
    };

    (async () => {
      await signUpUsersClient.hydrated();

      const signUpUsersQueryGetStatusResult = await signUpUsersClient
        .query({
          query: signUpUsersQueryGetStatus,
          variables: { input: signUpUsersQueryGetStatusInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {
          await signUpUsersClient
            .mutate({
              mutation: signUpUsersMutationSetStatus,
              variables: {
                input: {
                  ...commonSignUpUsersMutationSetStatusInput,
                  status: 'signUpError'
                }
              },
              fetchPolicy: 'no-cache'
            })
            .catch(() => {});
        });

      if (
        signUpUsersQueryGetStatusResult.data.getStatus.status ===
          'processing' ||
        signUpUsersQueryGetStatusResult.data.getStatus.status === 'completed'
      ) {
        return;
      }

      await signUpUsersClient
        .mutate({
          mutation: signUpUsersMutationSetStatus,
          variables: {
            input: {
              ...commonSignUpUsersMutationSetStatusInput,
              status: 'processing'
            }
          },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});

      const result = await signUpUsersClient
        .query({
          query: signUpUsersQueryGetIpAddressList,
          variables: { input: signUpUsersQueryGetIpAddressListInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {
          await signUpUsersClient
            .mutate({
              mutation: signUpUsersMutationSetStatus,
              variables: {
                input: {
                  ...commonSignUpUsersMutationSetStatusInput,
                  status: 'signUpError'
                }
              },
              fetchPolicy: 'no-cache'
            })
            .catch(() => {});
        });

      ipAddressCount = result.data.getIpAddressList.ipAddressList.length;

      if (ipAddressCount > process.env.ACCESS_LIMIT) {
        await signUpUsersClient
          .mutate({
            mutation: signUpUsersMutationSetStatus,
            variables: {
              input: {
                ...commonSignUpUsersMutationSetStatusInput,
                status: 'accessLimitExceeded'
              }
            },
            fetchPolicy: 'no-cache'
          })
          .catch(() => {});
        return;
      }

      userPool.signUp(
        record.dynamodb.NewImage.accountName.S,
        record.dynamodb.NewImage.password.S,
        [],
        null,
        async (error, result) => {
          if (error) {
            await signUpUsersClient
              .mutate({
                mutation: signUpUsersMutationSetStatus,
                variables: {
                  input: {
                    ...commonSignUpUsersMutationSetStatusInput,
                    status: 'signUpError'
                  }
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

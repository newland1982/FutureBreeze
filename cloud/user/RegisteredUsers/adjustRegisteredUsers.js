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
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;
const lambda = new AWS.Lambda();

const registeredUsers_Query_GetAccountNames = gql(`
  query GetAccountNames($input: GetAccountNamesInput!) {
    getAccountNames(input: $input) {
      accountNames {
        accountName
      }
    }
  }`);

const registeredUsersClient = new AWSAppSyncClient({
  url: process.env.AppSync_RegisteredUsers,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const statuses = ['init', 'invalid', 'valid'];

const registeredUsers_Query_GetAccountNames_Limit = 12;

exports.handler = () => {
  let unprocessedStatuses = statuses.slice();

  (async () => {
    await registeredUsersClient.hydrated();

    do {
      for (const status of statuses) {
        if (unprocessedStatuses.indexOf(status) !== -1) {
          try {
            const registeredUsers_Query_GetAccountNames_Input = {
              limit: registeredUsers_Query_GetAccountNames_Limit,
              status,
            };
            const registeredUsers_Query_GetAccountNames_Result = await registeredUsersClient.query(
              {
                query: registeredUsers_Query_GetAccountNames,
                variables: {
                  input: registeredUsers_Query_GetAccountNames_Input,
                },
                fetchPolicy: 'network-only',
              }
            );

            if (
              registeredUsers_Query_GetAccountNames_Result.data.getAccountNames
                .accountNames.length <
              registeredUsers_Query_GetAccountNames_Limit
            ) {
              unprocessedStatuses.splice(
                unprocessedStatuses.indexOf(status),
                1
              );
            }

            if (
              registeredUsers_Query_GetAccountNames_Result.data.getAccountNames
                .accountNames.length !== 0
            ) {
              const accountNames = registeredUsers_Query_GetAccountNames_Result.data.getAccountNames.accountNames.map(
                (value) => value.accountName
              );
              await Promise.all(
                accountNames.map(async (accountName) => {
                  if (status === 'init' || status === 'invalid') {
                    await lambda
                      .invoke({
                        FunctionName: 'deleteAccount',
                        InvocationType: 'RequestResponse',
                        Payload: JSON.stringify({
                          accountName,
                        }),
                      })
                      .promise();
                  }
                })
              );
            }
          } catch (error) {
            console.log('Error', error);
            return;
          }
        }
      }
    } while (unprocessedStatuses.length > 0);
  })();
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
    "ws": "^3.3.1"
  }
}
*/

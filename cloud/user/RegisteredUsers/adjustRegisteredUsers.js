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

const s3 = new AWS.S3();

const registeredUsers_Query_GetAccountNames = gql(`
  mutation DeleteRegisteredUser($input: DeleteRegisteredUserInput!) {
    deleteRegisteredUser(input: $input) {
      displayName
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

const errors_Query_GetDatas_Limit = 12;

exports.handler = () => {
  let unprocessedActions = statuses.slice();

  (async () => {
    await registeredUsersClient.hydrated();

    do {
      for (const action of statuses) {
        if (unprocessedActions.indexOf(action) !== -1) {
          try {
            const registeredUsers_Query_GetAccountNames_Input = {
              action,
            };
            const errors_Query_GetDatas_Result = await registeredUsersClient.query(
              {
                query: registeredUsers_Query_GetAccountNames,
                variables: {
                  input: registeredUsers_Query_GetAccountNames_Input,
                },
                fetchPolicy: 'network-only',
              }
            );

            if (
              errors_Query_GetDatas_Result.data.getDatas.datas.length <
              errors_Query_GetDatas_Limit
            ) {
              unprocessedActions.splice(unprocessedActions.indexOf(action), 1);
            }

            if (errors_Query_GetDatas_Result.data.getDatas.datas.length !== 0) {
              const datas = errors_Query_GetDatas_Result.data.getDatas.datas;
              await Promise.all(
                datas.map(async (data) => {
                  if (action === 'deleteS3Object') {
                    const deleteS3ObjectInput = {
                      Bucket: data.deleteS3ObjectInputBucket,
                      Key: data.deleteS3ObjectInputKey,
                      VersionId: data.deleteS3ObjectInputVersionId,
                    };
                    await s3.deleteObject(deleteS3ObjectInput).promise();
                    const errors_Mutation_DeleteError_Input = {
                      id: data.id,
                    };
                    await registeredUsersClient.mutate({
                      mutation: registeredUsers_Query_GetAccountNames,
                      variables: { input: errors_Mutation_DeleteError_Input },
                      fetchPolicy: 'no-cache',
                    });
                  }
                })
              );
            }
          } catch (error) {
            console.log('error', error);
            return;
          }
        }
      }
    } while (unprocessedActions.length > 0);
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

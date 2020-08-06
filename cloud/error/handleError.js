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

const errors_Mutation_CreateError = gql(`
  mutation CreateError($input: CreateErrorInput!) {
    createError(input: $input) {
      id
    }
  }`);

const errors_Mutation_DeleteError = gql(`
  mutation DeleteError($input: DeleteErrorInput!) {
    deleteError(input: $input) {
      id
    }
  }`);

const errors_Query_GetDatas = gql(`
  query GetDatas($input: GetDatasInput!) {
    getDatas(input: $input) {
      datas {
        id
        deleteS3ObjectInputBucket
        deleteS3ObjectInputKey
        deleteS3ObjectInputVersionId
        screens_Mutation_ChangePosterId_Input_PosterId
        cognitoIdentityServiceProviderAdminDeleteUserInputUserPoolId
        cognitoIdentityServiceProviderAdminDeleteUserInputUsername
        registeredUsers_Mutation_DeleteRegisteredUser_Input_DisplayName
      }
    }
  }`);

const registeredUsers_Mutation_DeleteRegisteredUser = gql(`
  mutation DeleteRegisteredUser($input: DeleteRegisteredUserInput!) {
    deleteRegisteredUser(input: $input) {
      displayName
    }
  }`);

const screens_Mutation_ChangePosterId = gql(`
  mutation ChangePosterId($input: ChangePosterIdInput!) {
    changePosterId(input: $input) {
      timed_out
    }
  }`);

const errorsClient = new AWSAppSyncClient({
  url: process.env.AppSync_Errors,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const registeredUsersClient = new AWSAppSyncClient({
  url: process.env.AppSync_RegisteredUsers,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const screensClient = new AWSAppSyncClient({
  url: process.env.AppSync_Screens,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const deleteS3Object = async (s3, deleteS3ObjectInput) => {
  await s3.deleteObject(deleteS3ObjectInput).promise();
};

const actions = ['deleteS3Object'];

const errors_Query_GetDatas_Limit = 12;

exports.handler = () => {
  (async () => {
    await errorsClient.hydrated();
    await registeredUsersClient.hydrated();
    await screensClient.hydrated();

    let processIsCompleted;
    // begin
    do {
      for (const action of actions) {
        try {
          const errors_Query_GetDatas_Input = {
            action,
          };
          const errors_Query_GetDatas_Result = await errorsClient.query({
            query: errors_Query_GetDatas,
            variables: { input: errors_Query_GetDatas_Input },
            fetchPolicy: 'network-only',
          });
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

                  deleteS3Object(new AWS.S3(), deleteS3ObjectInput);
                }
                // end
              })
            );
          }
          if (
            errors_Query_GetDatas_Result.data.getDatas.datas.length <
              errors_Query_GetDatas_Limit &&
            (typeof processIsCompleted === undefined ||
              processIsCompleted === true)
          ) {
            processIsCompleted = true;
          } else {
            processIsCompleted = false;
          }
        } catch (error) {}
      }
    } while (!processIsCompleted);
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

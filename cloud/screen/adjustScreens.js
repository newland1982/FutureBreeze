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

const screens_Mutation_SetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      timed_out
  }
 }`);

const screens_Mutation_DeleteScreen = gql(`
  mutation DeleteScreen($input: DeleteScreenInput!) {
    deleteScreen(input: $input) {
      timed_out
  }
 }`);

const screens_Query_GetObjectKeys = gql(`
  query GetObjectKeys($input: GetObjectKeysInput!) {
    getObjectKeys(input: $input) {
      objectKey
  }
 }`);

const screens_Query_GetScreenNames = gql(`
  query GetScreenNames($input: GetScreenNamesInput!) {
    getScreenNames(input: $input) {
      screenName
  }
 }`);

const screens_Query_GetVersionIds = gql(`
  query GetVersionIds($input: GetVersionIdsInput!) {
    getVersionIds(input: $input) {
      versionId
  }
 }`);

const errors_Mutation_CreateError = gql(`
  mutation CreateError($input: CreateErrorInput!) {
    createError(input: $input) {
      id
  }
 }`);

const screensClient = new AWSAppSyncClient({
  url: process.env.AppSync_Screens,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const errorsClient = new AWSAppSyncClient({
  url: process.env.AppSync_Errors,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const deleteS3Object = async (
  s3,
  deleteS3ObjectInput,
  errorsClient,
  errors_Mutation_CreateError
) => {
  await s3
    .deleteObject(deleteS3ObjectInput)
    .promise()
    .catch(async () => {
      await errorsClient.hydrated();
      const errors_Mutation_CreateError_Input = {
        type: 'adjustScreens',
        data: JSON.stringify({
          action: 'deleteS3Object',
          deleteS3ObjectInput,
        }),
      };
      await errorsClient.mutate({
        mutation: errors_Mutation_CreateError,
        variables: { input: errors_Mutation_CreateError_Input },
        fetchPolicy: 'no-cache',
      });
    });
};

const types = ['thumbnai', 'mobile', 'pc'];

const screens_Query_GetScreenNames_Size = 12;

exports.handler = (event) => {
  (async () => {
    await screensClient.hydrated();

    let processIsCompleted;

    do {
      for (const type of types) {
        try {
          const screens_Query_GetScreenNames_Input = {
            type,
          };
          const screens_Query_GetScreenNames_Result = await screensClient.query(
            {
              query: screens_Query_GetScreenNames,
              variables: { input: screens_Query_GetScreenNames_Input },
              fetchPolicy: 'network-only',
            }
          );
          if (
            screens_Query_GetScreenNames_Result.data.getScreenNames.length !== 0
          ) {
            const screenNames = screens_Query_GetScreenNames_Result.data.getScreenNames.map(
              (value) => value.screenName
            );
            await Promise.all(
              screenNames.map(async (screenName) => {
                const screens_Query_GetObjectKeys_Input = {
                  screenName,
                };
                const screens_Query_GetObjectKeys_Result = await screensClient.query(
                  {
                    query: screens_Query_GetObjectKeys,
                    variables: { input: screens_Query_GetObjectKeys_Input },
                    fetchPolicy: 'network-only',
                  }
                );
                const objectKeys = screens_Query_GetObjectKeys_Result.data.getObjectKeys.map(
                  (value) => value.objectKey
                );
                if (objectKeys.length === types.length) {
                  const screens_Mutation_SetStatus_Input = {
                    screenName,
                    status: 'completed',
                  };
                  await screensClient.mutate({
                    mutation: screens_Mutation_SetStatus,
                    variables: { input: screens_Mutation_SetStatus_Input },
                    fetchPolicy: 'no-cache',
                  });
                } else {
                  await Promise.all(
                    objectKeys.map(async (objectKey) => {
                      const screens_Query_GetVersionIds_Input = {
                        objectKey,
                      };
                      const screens_Query_GetVersionIds_Result = await screensClient.query(
                        {
                          query: screens_Query_GetVersionIds,
                          variables: {
                            input: screens_Query_GetVersionIds_Input,
                          },
                          fetchPolicy: 'network-only',
                        }
                      );
                      const deleteS3ObjectInput = {
                        Bucket: process.env.Bucket,
                        Key: objectKey,
                        VersionId:
                          screens_Query_GetVersionIds_Result.data
                            .getVersionIds[0].versionId,
                      };
                      deleteS3Object(
                        new AWS.S3(),
                        deleteS3ObjectInput,
                        errorsClient,
                        errors_Mutation_CreateError
                      );
                    })
                  );
                  const screens_Mutation_DeleteScreen_Input = {
                    screenName,
                  };
                  await screensClient.mutate({
                    mutation: screens_Mutation_DeleteScreen,
                    variables: { input: screens_Mutation_DeleteScreen_Input },
                    fetchPolicy: 'no-cache',
                  });
                }
              })
            );
          }
          if (
            screens_Query_GetScreenNames_Result.data.getScreenNames.length <
              screens_Query_GetScreenNames_Size &&
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

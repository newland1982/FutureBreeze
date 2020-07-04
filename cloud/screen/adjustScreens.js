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
let cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

const screensMutationSetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      timed_out
  }
 }`);

const screensMutationDeleteScreen = gql(`
  mutation DeleteScreen($input: DeleteScreenInput!) {
    deleteScreen(input: $input) {
      timed_out
  }
 }`);

const screensQueryGetObjectKeys = gql(`
  query GetObjectKeys($input: GetObjectKeysInput!) {
    getObjectKeys(input: $input) {
      objectKey
  }
 }`);

const screensQueryGetScreenNames = gql(`
  query GetScreenNames($input: GetScreenNamesInput!) {
    getScreenNames(input: $input) {
      screenName
  }
 }`);

const screensQueryGetVersionIds = gql(`
  query GetVersionIds($input: GetVersionIdsInput!) {
    getVersionIds(input: $input) {
      objectKey
  }
 }`);

const errorsMutationCreateError = gql(`
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
  errorsMutationCreateError
) => {
  await s3
    .deleteObject(deleteS3ObjectInput)
    .promise()
    .catch(async () => {
      await errorsClient.hydrated();
      const errorsMutationCreateErrorInput = {
        type: 'adjustScreens',
        data: JSON.stringify({
          action: 'deleteS3Object',
          deleteS3ObjectInput,
        }),
      };
      await errorsClient
        .mutate({
          mutation: errorsMutationCreateError,
          variables: { input: errorsMutationCreateErrorInput },
          fetchPolicy: 'no-cache',
        })
        .catch(() => {});
    });
};

const types = ['thumbnai', 'mobile', 'pc'];

exports.handler = async (event) => {
  (async () => {
    await screensClient.hydrated();
    for (const type of types) {
      try {
        const screensQueryGetScreenNamesInput = {
          type,
        };
        const screensQueryGetScreenNamesResult = await screensClient.query({
          query: screensQueryGetScreenNames,
          variables: { input: screensQueryGetScreenNamesInput },
          fetchPolicy: 'network-only',
        });
        if (screensQueryGetScreenNamesResult.length !== 0) {
          await Promise.all(
            screensQueryGetScreenNamesResult.map(async (value) => {
              const screenName = value.screenName;
              const screensQueryGetObjectKeysInput = {
                screenName,
              };
              const screensQueryGetObjectKeysResult = await screensClient.query(
                {
                  query: screensQueryGetObjectKeys,
                  variables: { input: screensQueryGetObjectKeysInput },
                  fetchPolicy: 'network-only',
                }
              );
              if (screensQueryGetObjectKeysResult.length === types.length) {
                const screensMutationSetStatusInput = {
                  screenName,
                  status: 'completed',
                };
                await screensClient.mutate({
                  mutation: screensMutationSetStatus,
                  variables: { input: screensMutationSetStatusInput },
                  fetchPolicy: 'no-cache',
                });
              } else {
                await Promise.all(
                  screensQueryGetObjectKeysResult.map(async (value) => {
                    const objectKey = value.objectKey;
                    const screensQueryGetVersionIdsInput = {
                      objectKey,
                    };
                    const screensQueryGetVersionIdsResult = await screensClient.query(
                      {
                        query: screensQueryGetVersionIds,
                        variables: { input: screensQueryGetVersionIdsInput },
                        fetchPolicy: 'network-only',
                      }
                    );
                    const deleteS3ObjectInput = {
                      Bucket: process.env.Bucket,
                      Key: objectKey,
                      VersionId: screensQueryGetVersionIdsResult[0].VersionId,
                    };
                    deleteS3Object(
                      new AWS.S3(),
                      deleteS3ObjectInput,
                      errorsClient,
                      errorsMutationCreateError
                    );
                  })
                );
              }
            })
          );
        }
      } catch (error) {}
    }
  })();
};

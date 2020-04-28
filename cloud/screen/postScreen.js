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

const screensQueryGetObjectKey = gql(`
  query GetObjectKey($input: GetObjectKeyInput!) {
    getObjectKey(input: $input) {
      objectKey
  }
 }`);

const registeredUsersQueryGetAccountName = gql(`
  query GetAccountName($input: GetAccountNameInput!) {
    getAccountName(input: $input) {
      accountName
  }
 }`);

const screensMutationChangePosterId = gql(`
  mutation ChangePosterId($input: ChangePosterIdInput!) {
    changePosterId(input: $input) {
      posterId
  }
 }`);

const registeredUsersMutationDeleteRegisteredUser = gql(`
  mutation DeleteRegisteredUser($input: DeleteRegisteredUserInput!) {
    deleteRegisteredUser(input: $input) {
      displayName
  }
 }`);

const screensMutationCreateScreen = gql(`
  mutation CreateScreen($input: CreateScreenInput!) {
    createScreen(input: $input) {
      objectKey
  }
 }`);

const errorsMutationCreateError = gql(`
  mutation CreateError($input: CreateErrorInput!) {
    createError(input: $input) {
      id
  }
 }`);

const registeredUsersClient = new AWSAppSyncClient({
  url: process.env.END_POINT_RegisteredUsers,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const screensClient = new AWSAppSyncClient({
  url: process.env.END_POINT_Screens,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const errorsClient = new AWSAppSyncClient({
  url: process.env.END_POINT_Errors,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

const getObjectDataObject = (eventRecord) => {
  const objectKey = eventRecord.s3.object.key;
  const s3FileAccessLevel = `protected`;
  const region = `(${process.env.REGION}`;
  const UUIDPattern = `[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})`;
  const displayNamePattern = `([0-9a-z]{1,}_[0-9a-z]{1,})`;
  const displayNameSuffixPattern = `[0-9]{13,}`;
  const fileNamePattern = `(pc|mobile|thumbnail)[0-9]{13,}`;
  const preciseObjectKeyPattern = new RegExp(
    '^' +
      s3FileAccessLevel +
      '/' +
      region +
      '%3A' +
      UUIDPattern +
      '/' +
      displayNamePattern +
      '_' +
      displayNameSuffixPattern +
      '/' +
      fileNamePattern +
      '$'
  );
  const roughObjectKeyPattern = new RegExp(
    '^' +
      s3FileAccessLevel +
      '/' +
      region +
      '%3A' +
      UUIDPattern +
      '/' +
      '.*' +
      '$'
  );
  const preciseObjectKeyRegexResult = objectKey.match(preciseObjectKeyPattern);
  const roughObjectKeyRegexResult = objectKey.match(roughObjectKeyPattern);

  if (!preciseObjectKeyRegexResult) {
    return {
      validationResult: 'invalid',
      cognitoIdentityId: roughObjectKeyRegexResult[1].replace('%3A', ':'),
    };
  }

  return {
    validationResult: 'valid',
    cognitoIdentityId: preciseObjectKeyRegexResult[1].replace('%3A', ':'),
    displayName: preciseObjectKeyRegexResult[2],
    size: eventRecord.s3.object.size,
    type: preciseObjectKeyRegexResult[3],
  };
};

const s3DeleteObject = async (
  s3,
  objectKey,
  errorsClient,
  errorsMutationCreateError
) => {
  await s3
    .deleteObject({
      Bucket: process.env.Bucket,
      Key: objectKey,
    })
    .promise()
    .catch(async () => {
      await errorsClient.hydrated();
      const errorsMutationCreateErrorInput = {
        type: 'postScreen',
        data: JSON.stringify({
          action: 's3DeleteObject',
          s3DeleteObjectInput: {
            Bucket: process.env.Bucket,
            Key: objectKey,
          },
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

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (
      record.eventName !== 'ObjectCreated:Put' &&
      record.eventName !== 'ObjectCreated:CompleteMultipartUpload'
    ) {
      return;
    }

    const objectDataObject = getObjectDataObject(event.Records[0]);

    (async () => {
      await screensClient.hydrated();

      const screensQueryGetObjectKeyInput = {
        objectKey: event.Records[0].s3.object.key.replace('%3A', ':'),
      };

      const screensQueryGetObjectKeyResult = await screensClient
        .query({
          query: screensQueryGetObjectKey,
          variables: { input: screensQueryGetObjectKeyInput },
          fetchPolicy: 'network-only',
        })
        .catch((e) => {
          console.log('screensQueryGetObjectAERRORRR', e);
        });

      console.log(
        'screensQueryGetObjectKeyResulttttt',
        screensQueryGetObjectKeyResult.data.getObjectKey.length
      );

      await registeredUsersClient.hydrated();

      const registeredUsersQueryGetAccountNameInput = {
        cognitoIdentityId: objectDataObject.cognitoIdentityId,
      };

      const registeredUsersQueryGetAccountNameResult = await registeredUsersClient
        .query({
          query: registeredUsersQueryGetAccountName,
          variables: { input: registeredUsersQueryGetAccountNameInput },
          fetchPolicy: 'network-only',
        })
        .catch(() => {});

      if (!registeredUsersQueryGetAccountNameResult) {
        s3DeleteObject(
          new AWS.S3(),
          event.Records[0].s3.object.key.replace('%3A', ':'),
          errorsClient,
          errorsMutationCreateError
        );
        return;
      }

      if (
        !(objectDataObject.validationResult === 'valid') ||
        !(objectDataObject.size < Number(process.env.OBJECT_SIZE_LIMIT)) ||
        !(
          registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
            96
          ) === objectDataObject.displayName
        )
      ) {
        s3DeleteObject(
          new AWS.S3(),
          event.Records[0].s3.object.key.replace('%3A', ':'),
          errorsClient,
          errorsMutationCreateError
        );

        try {
          await screensClient.hydrated();

          const screensMutationChangePosterIdInput = {
            posterId: registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
              96
            ),
          };

          await screensClient.mutate({
            mutation: screensMutationChangePosterId,
            variables: { input: screensMutationChangePosterIdInput },
            fetchPolicy: 'no-cache',
          });
        } catch (error) {
          await errorsClient.hydrated();
          const errorsMutationCreateErrorInput = {
            type: 'postScreen',
            data: JSON.stringify({
              action: 'screensMutationChangePosterId',
              screensMutationChangePosterIdInput: {
                posterId: registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
                  96
                ),
              },
              cognitoIdentityServiceProviderAdminDeleteUserInput: {
                UserPoolId: process.env.USER_POOL_ID,
                Username:
                  registeredUsersQueryGetAccountNameResult.data.getAccountName
                    .accountName,
              },
              registeredUsersMutationDeleteRegisteredUserInput: {
                displayName: registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
                  96
                ),
              },
            }),
          };
          await errorsClient
            .mutate({
              mutation: errorsMutationCreateError,
              variables: { input: errorsMutationCreateErrorInput },
              fetchPolicy: 'no-cache',
            })
            .catch(() => {});
          return;
        }

        try {
          const result = await cognitoIdentityServiceProvider
            .adminGetUser({
              UserPoolId: process.env.USER_POOL_ID,
              Username:
                registeredUsersQueryGetAccountNameResult.data.getAccountName
                  .accountName,
            })
            .promise();
          console.log('adminGetUserrrr11111', result);
        } catch (error) {
          console.log('adminGetUserrrr2222', error);
          return;
        }

        try {
          await cognitoIdentityServiceProvider
            .adminDeleteUser({
              UserPoolId: process.env.USER_POOL_ID,
              Username:
                registeredUsersQueryGetAccountNameResult.data.getAccountName
                  .accountName,
            })
            .promise();
        } catch (error) {
          await errorsClient.hydrated();
          const errorsMutationCreateErrorInput = {
            type: 'postScreen',
            data: JSON.stringify({
              action: 'adminDeleteUser',
              cognitoIdentityServiceProviderAdminDeleteUserInput: {
                UserPoolId: process.env.USER_POOL_ID,
                Username:
                  registeredUsersQueryGetAccountNameResult.data.getAccountName
                    .accountName,
              },
              registeredUsersMutationDeleteRegisteredUserInput: {
                displayName: registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
                  96
                ),
              },
            }),
          };
          await errorsClient
            .mutate({
              mutation: errorsMutationCreateError,
              variables: { input: errorsMutationCreateErrorInput },
              fetchPolicy: 'no-cache',
            })
            .catch(() => {});
          return;
        }

        try {
          await registeredUsersClient.hydrated();

          const registeredUsersMutationDeleteRegisteredUserInput = {
            displayName: registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
              96
            ),
          };

          await registeredUsersClient.mutate({
            mutation: registeredUsersMutationDeleteRegisteredUser,
            variables: {
              input: registeredUsersMutationDeleteRegisteredUserInput,
            },
            fetchPolicy: 'no-cache',
          });
        } catch (error) {
          await errorsClient.hydrated();
          const errorsMutationCreateErrorInput = {
            type: 'postScreen',
            data: JSON.stringify({
              action: 'registeredUsersMutationDeleteRegisteredUser',
              registeredUsersMutationDeleteRegisteredUserInput: {
                displayName: registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
                  96
                ),
              },
            }),
          };
          await errorsClient
            .mutate({
              mutation: errorsMutationCreateError,
              variables: { input: errorsMutationCreateErrorInput },
              fetchPolicy: 'no-cache',
            })
            .catch(() => {});
          return;
        }

        return;
      }

      await screensClient.hydrated();

      const screensMutationCreateScreenInput = {
        objectKey: event.Records[0].s3.object.key.replace('%3A', ':'),
        posterId: objectDataObject.displayName,
        type: objectDataObject.type,
      };

      try {
        await screensClient.mutate({
          mutation: screensMutationCreateScreen,
          variables: { input: screensMutationCreateScreenInput },
          fetchPolicy: 'no-cache',
        });
      } catch (error) {
        await errorsClient.hydrated();
        const errorsMutationCreateErrorInput = {
          type: 'postScreen',
          data: JSON.stringify({
            action: 'screensMutationCreateScreen',
            objectKey: event.Records[0].s3.object.key.replace('%3A', ':'),
            posterId: objectDataObject.displayName,
            type: objectDataObject.type,
          }),
        };
        await errorsClient
          .mutate({
            mutation: errorsMutationCreateError,
            variables: { input: errorsMutationCreateErrorInput },
            fetchPolicy: 'no-cache',
          })
          .catch(() => {});
        return;
      }
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

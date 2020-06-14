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

const screensMutationCreateScreen = gql(`
 mutation CreateScreen($input: CreateScreenInput!) {
  createScreen(input: $input) {
     objectKey
 }
}`);

const screensMutationChangePosterId = gql(`
  mutation ChangePosterId($input: ChangePosterIdInput!) {
    changePosterId(input: $input) {
      timed_out
  }
 }`);

const screensQueryGetObjectKeyList = gql(`
  query GetObjectKeyList($input: GetObjectKeyListInput!) {
    getObjectKeyList(input: $input) {
      objectKey
  }
 }`);

const registeredUsersMutationDeleteRegisteredUser = gql(`
  mutation DeleteRegisteredUser($input: DeleteRegisteredUserInput!) {
    deleteRegisteredUser(input: $input) {
      displayName
  }
 }`);

const registeredUsersMutationSetPostScreenCount = gql(`
  mutation SetPostScreenCount($input: SetPostScreenCountInput!) {
    setPostScreenCount(input: $input) {
      postScreenCount
  }
 }`);

const registeredUsersQueryGetAccountNameList = gql(`
  query GetAccountNameList($input: GetAccountNameListInput!) {
    getAccountNameList(input: $input) {
      accountNameList {
        accountName
      }
  }
 }`);

const registeredUsersQueryGetPostScreenCount = gql(`
  query GetPostScreenCount($input: GetPostScreenCountInput!) {
    getPostScreenCount(input: $input) {
      postScreenCount
  }
 }`);

const errorsMutationCreateError = gql(`
  mutation CreateError($input: CreateErrorInput!) {
    createError(input: $input) {
      id
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

const getS3ObjectData = (eventRecord) => {
  const encodedObjectKey = eventRecord.s3.object.key;
  const s3FileAccessLevel = `protected`;
  const region = `(${process.env.S3_Region}`;
  const UUIDPattern = `[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})`;
  const displayNamePattern = `([0-9a-z]{1,}_[0-9a-z]{1,})`;
  const displayNameSuffixPattern = `[0-9]{13,}`;
  const fileNamePattern = `[0-9]{13,}(pc|mobile|thumbnail)`;
  const preciseEncodedObjectKeyPattern = new RegExp(
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
  const roughEncodedObjectKeyPattern = new RegExp(
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
  const preciseEncodedObjectKeyRegexResult = encodedObjectKey.match(
    preciseEncodedObjectKeyPattern
  );
  const roughEncodedObjectKeyRegexResult = encodedObjectKey.match(
    roughEncodedObjectKeyPattern
  );

  if (!preciseEncodedObjectKeyRegexResult) {
    return {
      validationResult: 'invalid',
      cognitoIdentityId: roughEncodedObjectKeyRegexResult[1].replace(
        '%3A',
        ':'
      ),
    };
  }

  return {
    validationResult: 'valid',
    cognitoIdentityId: preciseEncodedObjectKeyRegexResult[1].replace(
      '%3A',
      ':'
    ),
    displayName: preciseEncodedObjectKeyRegexResult[2],
    size: eventRecord.s3.object.size,
    type: preciseEncodedObjectKeyRegexResult[3],
  };
};

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
        type: 'postScreen',
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

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (
      record.eventName !== 'ObjectCreated:Put' &&
      record.eventName !== 'ObjectCreated:CompleteMultipartUpload'
    ) {
      return;
    }

    const s3ObjectData = getS3ObjectData(event.Records[0]);

    const objectKey = event.Records[0].s3.object.key.replace('%3A', ':');

    const deleteS3ObjectInput = {
      Bucket: process.env.Bucket,
      Key: objectKey,
      VersionId: event.Records[0].s3.object.versionId,
    };

    let postScreenCount = 0;

    let screensQueryGetObjectKeyListResult;

    let registeredUsersQueryGetAccountNameListResult;

    (async () => {
      try {
        await screensClient.hydrated();

        const screensQueryGetObjectKeyListInput = {
          objectKey,
        };

        screensQueryGetObjectKeyListResult = await screensClient.query({
          query: screensQueryGetObjectKeyList,
          variables: { input: screensQueryGetObjectKeyListInput },
          fetchPolicy: 'network-only',
        });
      } catch (error) {
        if (
          s3ObjectData.validationResult === 'valid' &&
          s3ObjectData.size < Number(process.env.Object_Size_Limit)
        ) {
          deleteS3Object(
            new AWS.S3(),
            deleteS3ObjectInput,
            errorsClient,
            errorsMutationCreateError
          );
        }
        return;
      }

      try {
        await registeredUsersClient.hydrated();
        const registeredUsersQueryGetAccountNameListInput = {
          cognitoIdentityId: s3ObjectData.cognitoIdentityId,
        };
        registeredUsersQueryGetAccountNameListResult = await registeredUsersClient.query(
          {
            query: registeredUsersQueryGetAccountNameList,
            variables: { input: registeredUsersQueryGetAccountNameListInput },
            fetchPolicy: 'network-only',
          }
        );
      } catch (error) {
        if (
          s3ObjectData.validationResult === 'valid' &&
          s3ObjectData.size < Number(process.env.Object_Size_Limit)
        ) {
          deleteS3Object(
            new AWS.S3(),
            deleteS3ObjectInput,
            errorsClient,
            errorsMutationCreateError
          );
        }
        return;
      }

      if (
        s3ObjectData.validationResult === 'valid' &&
        s3ObjectData.size < Number(process.env.Object_Size_Limit) &&
        registeredUsersQueryGetAccountNameListResult.data.getAccountNameList.accountNameList[0].accountName.slice(
          96
        ) === s3ObjectData.displayName
      ) {
        await registeredUsersClient.hydrated();
        const registeredUsersQueryGetPostScreenCountInput = {
          displayName: s3ObjectData.displayName,
        };
        const result = await registeredUsersClient
          .query({
            query: registeredUsersQueryGetPostScreenCount,
            variables: { input: registeredUsersQueryGetPostScreenCountInput },
            fetchPolicy: 'network-only',
          })
          .catch(() => {});
        if (result) {
          postScreenCount = result.data.getPostScreenCount.postScreenCount;
        }
      }

      if (
        !(s3ObjectData.validationResult === 'valid') ||
        !(s3ObjectData.size < Number(process.env.Object_Size_Limit)) ||
        !(
          screensQueryGetObjectKeyListResult.data.getObjectKeyList.length === 0
        ) ||
        !(
          registeredUsersQueryGetAccountNameListResult.data.getAccountNameList.accountNameList[0].accountName.slice(
            96
          ) === s3ObjectData.displayName
        ) ||
        !(postScreenCount + 1 <= Number(process.env.Post_Screen_Count_Limit))
      ) {
        const screensMutationChangePosterIdInput = {
          posterId: registeredUsersQueryGetAccountNameListResult.data.getAccountNameList.accountNameList[0].accountName.slice(
            96
          ),
        };

        const cognitoIdentityServiceProviderAdminDeleteUserInput = {
          UserPoolId: process.env.User_Pool_Id,
          Username:
            registeredUsersQueryGetAccountNameListResult.data.getAccountNameList
              .accountNameList[0].accountName,
        };

        const registeredUsersMutationDeleteRegisteredUserInput = {
          displayName: registeredUsersQueryGetAccountNameListResult.data.getAccountNameList.accountNameList[0].accountName.slice(
            96
          ),
        };

        deleteS3Object(
          new AWS.S3(),
          deleteS3ObjectInput,
          errorsClient,
          errorsMutationCreateError
        );

        await screensClient.hydrated();

        try {
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
              screensMutationChangePosterIdInput,
              cognitoIdentityServiceProviderAdminDeleteUserInput,
              registeredUsersMutationDeleteRegisteredUserInput,
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
          await cognitoIdentityServiceProvider
            .adminDeleteUser(cognitoIdentityServiceProviderAdminDeleteUserInput)
            .promise();
        } catch (error) {
          if (error.code === 'UserNotFoundException') {
            return;
          }
          await errorsClient.hydrated();
          const errorsMutationCreateErrorInput = {
            type: 'postScreen',
            data: JSON.stringify({
              action: 'adminDeleteUser',
              cognitoIdentityServiceProviderAdminDeleteUserInput,
              registeredUsersMutationDeleteRegisteredUserInput,
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
              registeredUsersMutationDeleteRegisteredUserInput,
            }),
          };
          await errorsClient
            .mutate({
              mutation: errorsMutationCreateError,
              variables: { input: errorsMutationCreateErrorInput },
              fetchPolicy: 'no-cache',
            })
            .catch(() => {});
        }
        return;
      }

      // begin 2
      let labelsForSuggester;
      let labelsForSearch;
      if (s3ObjectData.type === 'thumbnail') {
        try {
          const rekognition = new AWS.Rekognition({
            apiVersion: process.env.Rekognition_ApiVersion,
          });

          const rekognitionDetectLabelsInput = {
            Image: {
              S3Object: {
                Bucket: process.env.Bucket,
                Name: objectKey,
              },
            },
            MaxLabels: process.env.Rekognition_DetectLabels_MaxLabels,
            MinConfidence: process.env.Rekognition_DetectLabels_MinConfidence,
          };
          const rekognitionDetectLabelsResult = await rekognition
            .detectLabels(rekognitionDetectLabelsInput)
            .promise();
          labelsForSuggester = rekognitionDetectLabelsResult.Labels.map(
            (value) => {
              return { input: [value.Name] };
            }
          );
          labelsForSearch = rekognitionDetectLabelsResult.Labels.map(
            (value) => {
              return { label: [value.Name] };
            }
          );
          console.log('deteee111', labelsForSuggester);
          console.log('deteee1.5555511', labelsForSearch);
        } catch (error) {
          console.log('deteee222', error);
        }
      }
      // end 2

      await registeredUsersClient.hydrated();
      const registeredUsersMutationSetPostScreenCountInput = {
        displayName: s3ObjectData.displayName,
        postScreenCount,
      };
      await registeredUsersClient
        .mutate({
          mutation: registeredUsersMutationSetPostScreenCount,
          variables: { input: registeredUsersMutationSetPostScreenCountInput },
          fetchPolicy: 'no-cache',
        })
        .catch(() => {});

      // begin 3
      const s3FileAccessLevel = `(protected`;
      const region = `${process.env.S3_Region}`;
      const UUIDPattern = `[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}`;
      const displayNamePattern = `[0-9a-z]{1,}_[0-9a-z]{1,}`;
      const displayNameSuffixPattern = `[0-9]{13,}`;
      const fileNamePattern = `[0-9]{13,})(pc|mobile|thumbnail)`;
      const objectKeyPattern = new RegExp(
        '^' +
          s3FileAccessLevel +
          '/' +
          region +
          ':' +
          UUIDPattern +
          '/' +
          displayNamePattern +
          '_' +
          displayNameSuffixPattern +
          '/' +
          fileNamePattern +
          '$'
      );
      const objectKeyRegexResult = objectKey.match(objectKeyPattern);
      const screenName = objectKeyRegexResult[1];
      // end 3

      let screensMutationCreateScreenInput;
      await screensClient.hydrated();
      if (s3ObjectData.type === 'thumbnail') {
        screensMutationCreateScreenInput = {
          screenName,
          objectKey,
          posterId: s3ObjectData.displayName,
          type: s3ObjectData.type,
          labelsForSuggester,
          labelsForSearch,
        };
      } else {
        screensMutationCreateScreenInput = {
          screenName,
          objectKey,
          type: s3ObjectData.type,
        };
      }

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
            screensMutationCreateScreenInput,
          }),
        };
        await errorsClient
          .mutate({
            mutation: errorsMutationCreateError,
            variables: { input: errorsMutationCreateErrorInput },
            fetchPolicy: 'no-cache',
          })
          .catch(() => {});
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

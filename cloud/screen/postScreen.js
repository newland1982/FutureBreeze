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

const screens_Mutation_CreateScreen = gql(`
  mutation CreateScreen($input: CreateScreenInput!) {
    createScreen(input: $input) {
      objectKey
  }
 }`);

const screens_Mutation_ChangePosterId = gql(`
  mutation ChangePosterId($input: ChangePosterIdInput!) {
    changePosterId(input: $input) {
      timed_out
  }
 }`);

const screens_Query_GetObjectKeys = gql(`
  query GetObjectKeys($input: GetObjectKeysInput!) {
    getObjectKeys(input: $input) {
      objectKey
  }
 }`);

const registeredUsers_Mutation_DeleteRegisteredUser = gql(`
  mutation DeleteRegisteredUser($input: DeleteRegisteredUserInput!) {
    deleteRegisteredUser(input: $input) {
      displayName
  }
 }`);

const registeredUsers_Mutation_SetPostScreenCount = gql(`
  mutation SetPostScreenCount($input: SetPostScreenCountInput!) {
    setPostScreenCount(input: $input) {
      postScreenCount
  }
 }`);

const registeredUsers_Query_GetAccountNames = gql(`
  query GetAccountNames($input: GetAccountNamesInput!) {
    getAccountNames(input: $input) {
      accountNames {
        accountName
      }
  }
 }`);

const registeredUsers_Query_GetPostScreenCount = gql(`
  query GetPostScreenCount($input: GetPostScreenCountInput!) {
    getPostScreenCount(input: $input) {
      postScreenCount
  }
 }`);

const errors_Mutation_CreateError = gql(`
  mutation CreateError($input: CreateErrorInput!) {
    createError(input: $input) {
      id
      sequenceNumber
  }
 }`);

const errors_Mutation_DeleteError = gql(`
  mutation DeleteError($input: DeleteErrorInput!) {
    deleteError(input: $input) {
      id
      sequenceNumber
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

const registeredUsersClient = new AWSAppSyncClient({
  url: process.env.AppSync_RegisteredUsers,
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
  errors_Mutation_CreateError
) => {
  await s3
    .deleteObject(deleteS3ObjectInput)
    .promise()
    .catch(async () => {
      await errorsClient.hydrated();
      const errors_Mutation_CreateError_Input = {
        sequenceNumber: 0,
        type: 'postScreen',
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

    const versionId = event.Records[0].s3.object.versionId;

    const deleteS3ObjectInput = {
      Bucket: process.env.Bucket,
      Key: objectKey,
      VersionId: versionId,
    };

    let postScreenCount = 0;

    let screens_Query_GetObjectKeys_Result;

    let registeredUsers_Query_GetAccountNames_Result;

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

    (async () => {
      await errorsClient.hydrated();
      await screensClient.hydrated();
      await registeredUsersClient.hydrated();
      try {
        const screens_Query_GetObjectKeys_Input = {
          objectKey,
        };

        screens_Query_GetObjectKeys_Result = await screensClient.query({
          query: screens_Query_GetObjectKeys,
          variables: { input: screens_Query_GetObjectKeys_Input },
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
            errors_Mutation_CreateError
          );
        }
        return;
      }

      try {
        const registeredUsers_Query_GetAccountNames_Input = {
          cognitoIdentityId: s3ObjectData.cognitoIdentityId,
        };
        registeredUsers_Query_GetAccountNames_Result = await registeredUsersClient.query(
          {
            query: registeredUsers_Query_GetAccountNames,
            variables: { input: registeredUsers_Query_GetAccountNames_Input },
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
            errors_Mutation_CreateError
          );
        }
        return;
      }

      if (
        s3ObjectData.validationResult === 'valid' &&
        s3ObjectData.size < Number(process.env.Object_Size_Limit) &&
        registeredUsers_Query_GetAccountNames_Result.data.getAccountNames.accountNames[0].accountName.slice(
          96
        ) === s3ObjectData.displayName
      ) {
        const registeredUsers_Query_GetPostScreenCount_Input = {
          displayName: s3ObjectData.displayName,
        };
        const result = await registeredUsersClient.query({
          query: registeredUsers_Query_GetPostScreenCount,
          variables: { input: registeredUsers_Query_GetPostScreenCount_Input },
          fetchPolicy: 'network-only',
        });
        if (result) {
          postScreenCount = result.data.getPostScreenCount.postScreenCount;
        }
      }

      if (
        !(s3ObjectData.validationResult === 'valid') ||
        !(s3ObjectData.size < Number(process.env.Object_Size_Limit)) ||
        !(screens_Query_GetObjectKeys_Result.data.getObjectKeys.length === 0) ||
        !(
          registeredUsers_Query_GetAccountNames_Result.data.getAccountNames.accountNames[0].accountName.slice(
            96
          ) === s3ObjectData.displayName
        ) ||
        !(postScreenCount + 1 <= Number(process.env.Post_Screen_Count_Limit))
      ) {
        const screens_Mutation_ChangePosterId_Input = {
          posterId: registeredUsers_Query_GetAccountNames_Result.data.getAccountNames.accountNames[0].accountName.slice(
            96
          ),
        };

        const cognitoIdentityServiceProviderAdminDeleteUserInput = {
          UserPoolId: process.env.User_Pool_Id,
          Username:
            registeredUsers_Query_GetAccountNames_Result.data.getAccountNames
              .accountNames[0].accountName,
        };

        const registeredUsers_Mutation_DeleteRegisteredUser_Input = {
          displayName: registeredUsers_Query_GetAccountNames_Result.data.getAccountNames.accountNames[0].accountName.slice(
            96
          ),
        };

        deleteS3Object(
          new AWS.S3(),
          deleteS3ObjectInput,
          errorsClient,
          errors_Mutation_CreateError
        );
        // begin
        let errors_Mutation_CreateError_Result_1;
        let errors_Mutation_CreateError_Result_2;
        let errors_Mutation_CreateError_Result_3;
        try {
          errors_Mutation_CreateError_Result_1 = await errorsClient.mutate({
            mutation: errors_Mutation_CreateError,
            variables: {
              input: {
                sequenceNumber: 1,
                type: 'postScreen',
                data: JSON.stringify({
                  action: 'screens_Mutation_ChangePosterId',
                  screens_Mutation_ChangePosterId_Input,
                }),
              },
            },
            fetchPolicy: 'no-cache',
          });
          errors_Mutation_CreateError_Result_2 = await errorsClient.mutate({
            mutation: errors_Mutation_CreateError,
            variables: {
              input: {
                sequenceNumber: 2,
                type: 'postScreen',
                data: JSON.stringify({
                  action: 'cognitoIdentityServiceProviderAdminDeleteUser',
                  cognitoIdentityServiceProviderAdminDeleteUserInput,
                }),
              },
            },
            fetchPolicy: 'no-cache',
          });
          errors_Mutation_CreateError_Result_3 = await errorsClient.mutate({
            mutation: errors_Mutation_CreateError,
            variables: {
              input: {
                sequenceNumber: 3,
                type: 'postScreen',
                data: JSON.stringify({
                  action: 'registeredUsers_Mutation_DeleteRegisteredUser',
                  registeredUsers_Mutation_DeleteRegisteredUser_Input,
                }),
              },
            },
            fetchPolicy: 'no-cache',
          });
        } catch (error) {
          return;
        }
        // end
        try {
          await screensClient.mutate({
            mutation: screens_Mutation_ChangePosterId,
            variables: { input: screens_Mutation_ChangePosterId_Input },
            fetchPolicy: 'no-cache',
          });
          await errorsClient.mutate({
            mutation: errors_Mutation_DeleteError,
            variables: {
              input: {
                id: errors_Mutation_CreateError_Result_1.data.createError.id,
                sequenceNumber:
                  errors_Mutation_CreateError_Result_1.data.createError
                    .sequenceNumber,
              },
            },
            fetchPolicy: 'no-cache',
          });
        } catch (error) {
          await errorsClient.hydrated();
          const errors_Mutation_CreateError_Input = {
            type: 'postScreen',
            data: JSON.stringify({
              action: 'screens_Mutation_ChangePosterId',
              screens_Mutation_ChangePosterId_Input,
              cognitoIdentityServiceProviderAdminDeleteUserInput,
              registeredUsers_Mutation_DeleteRegisteredUser_Input,
            }),
          };
          await errorsClient.mutate({
            mutation: errors_Mutation_CreateError,
            variables: { input: errors_Mutation_CreateError_Input },
            fetchPolicy: 'no-cache',
          });
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
          const errors_Mutation_CreateError_Input = {
            type: 'postScreen',
            data: JSON.stringify({
              action: 'adminDeleteUser',
              cognitoIdentityServiceProviderAdminDeleteUserInput,
              registeredUsers_Mutation_DeleteRegisteredUser_Input,
            }),
          };
          await errorsClient.mutate({
            mutation: errors_Mutation_CreateError,
            variables: { input: errors_Mutation_CreateError_Input },
            fetchPolicy: 'no-cache',
          });
          return;
        }

        try {
          await registeredUsersClient.mutate({
            mutation: registeredUsers_Mutation_DeleteRegisteredUser,
            variables: {
              input: registeredUsers_Mutation_DeleteRegisteredUser_Input,
            },
            fetchPolicy: 'no-cache',
          });
        } catch (error) {
          await errorsClient.hydrated();
          const errors_Mutation_CreateError_Input = {
            type: 'postScreen',
            data: JSON.stringify({
              action: 'registeredUsers_Mutation_DeleteRegisteredUser',
              registeredUsers_Mutation_DeleteRegisteredUser_Input,
            }),
          };
          await errorsClient.mutate({
            mutation: errors_Mutation_CreateError,
            variables: { input: errors_Mutation_CreateError_Input },
            fetchPolicy: 'no-cache',
          });
        }
        return;
      }

      const registeredUsers_Mutation_SetPostScreenCount_Input = {
        displayName: s3ObjectData.displayName,
        postScreenCount,
      };
      await registeredUsersClient.mutate({
        mutation: registeredUsers_Mutation_SetPostScreenCount,
        variables: { input: registeredUsers_Mutation_SetPostScreenCount_Input },
        fetchPolicy: 'no-cache',
      });

      let labels = [];
      if (s3ObjectData.type === 'thumbnail') {
        const rekognition = new AWS.Rekognition({
          apiVersion: process.env.Rekognition_ApiVersion,
        });
        try {
          const rekognitionDetectModerationLabelsInput = {
            Image: {
              S3Object: {
                Bucket: process.env.Bucket,
                Name: objectKey,
              },
            },
            MinConfidence:
              process.env.Rekognition_DetectModerationLabels_MinConfidence,
          };
          const rekognitionDetectModerationLabelsResult = await rekognition
            .detectModerationLabels(rekognitionDetectModerationLabelsInput)
            .promise();
          if (
            rekognitionDetectModerationLabelsResult.ModerationLabels.length !==
            0
          ) {
            deleteS3Object(
              new AWS.S3(),
              deleteS3ObjectInput,
              errorsClient,
              errors_Mutation_CreateError
            );
            return;
          }

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
          labels = rekognitionDetectLabelsResult.Labels.map((value) => {
            return value.Name;
          });
        } catch (error) {
          deleteS3Object(
            new AWS.S3(),
            deleteS3ObjectInput,
            errorsClient,
            errors_Mutation_CreateError
          );
          return;
        }
      }

      let screens_Mutation_CreateScreen_Input;
      if (s3ObjectData.type === 'thumbnail') {
        screens_Mutation_CreateScreen_Input = {
          screenName,
          objectKey,
          versionId,
          posterId: s3ObjectData.displayName,
          type: s3ObjectData.type,
          labels,
        };
      } else {
        screens_Mutation_CreateScreen_Input = {
          screenName,
          objectKey,
          versionId,
          type: s3ObjectData.type,
        };
      }

      try {
        await screensClient.mutate({
          mutation: screens_Mutation_CreateScreen,
          variables: { input: screens_Mutation_CreateScreen_Input },
          fetchPolicy: 'no-cache',
        });
      } catch (error) {
        deleteS3Object(
          new AWS.S3(),
          deleteS3ObjectInput,
          errorsClient,
          errors_Mutation_CreateError
        );
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

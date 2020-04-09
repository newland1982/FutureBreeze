'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;

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

const screensMutationCreateScreen = gql(`
  mutation CreateScreen($input: CreateScreenInput!) {
    createScreen(input: $input) {
      objectKey
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

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (
      record.eventName !== 'ObjectCreated:Put' &&
      record.eventName !== 'ObjectCreated:CompleteMultipartUpload'
    ) {
      return;
    }

    const objectDataObject = getObjectDataObject(event.Records[0]);

    const registeredUsersQueryGetAccountNameInput = {
      cognitoIdentityId: objectDataObject.cognitoIdentityId,
    };

    (async () => {
      await registeredUsersClient.hydrated();

      const registeredUsersQueryGetAccountNameResult = await registeredUsersClient
        .query({
          query: registeredUsersQueryGetAccountName,
          variables: { input: registeredUsersQueryGetAccountNameInput },
          fetchPolicy: 'network-only',
        })
        .catch(() => {
          // foobar
        });

      console.log(
        'queryyyresulttt',
        registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName
      );
      console.log('event.Records[0]!!!!!????', event.Records[0]);

      if (
        !objectDataObject ||
        !(objectDataObject.size < Number(process.env.OBJECT_SIZE_LIMIT)) ||
        !(
          registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
            96
          ) === objectDataObject.displayName
        )
      ) {
        console.log('errrrobjecttt', event.Records[0]);
        console.log('111111');

        // try {
        //   const s3 = new AWS.S3();
        //   console.log('22222');
        //   const result = await s3
        //     .deleteObject({
        //       Bucket: process.env.Bucket,
        //       Key: event.Records[0].s3.object.key.replace('%3A', ':'),
        //     })
        //     .promise();
        // } catch (error) {
        //   console.log('deleteobjecteroorrr', error);
        // }
        const s3 = new AWS.S3();
        await s3
          .deleteObject({
            Bucket: process.env.Bucket,
            Key: event.Records[0].s3.object.key.replace('%3A', ':'),
          })
          .promise()
          .catch(() => {});

        await screensClient.hydrated();

        const screensMutationChangePosterIdInput = {
          posterId: objectDataObject.displayName,
        };

        const screensMutationChangePosterIdResult = await screensClient
          .mutate({
            mutation: screensMutationChangePosterId,
            variables: { input: screensMutationChangePosterIdInput },
            fetchPolicy: 'no-cache',
          })
          .catch(() => {});

        // try {
        //   const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
        //   await cognitoIdentityServiceProvider
        //     .adminDeleteUser({
        //       UserPoolId: process.env.USER_POOL_ID,
        //       Username:
        //         registeredUsersQueryGetAccountNameResult.data.getAccountName
        //           .accountName
        //     })
        //     .promise();
        // } catch (error) {
        //   // foobar
        // }
        /*         const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
        await cognitoIdentityServiceProvider
          .adminDeleteUser({
            UserPoolId: process.env.USER_POOL_ID,
            Username:
              registeredUsersQueryGetAccountNameResult.data.getAccountName
                .accountName,
          })
          .promise()
          .catch(() => {}); */
        return;
      }

      await screensClient.hydrated();

      const screensMutationCreateScreenInput = {
        objectKey: event.Records[0].s3.object.key.replace('%3A', ':'),
        posterId: objectDataObject.displayName,
        type: objectDataObject.type,
      };

      const screensMutationCreateScreenResult = await screensClient
        .mutate({
          mutation: screensMutationCreateScreen,
          variables: { input: screensMutationCreateScreenInput },
          fetchPolicy: 'no-cache',
        })
        .catch(() => {});

      console.log(
        'screensMutationCreateScreenResulttt',
        screensMutationCreateScreenResult
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

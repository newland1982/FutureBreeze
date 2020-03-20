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
    credentials
  },
  disableOffline: true
});

const screensClient = new AWSAppSyncClient({
  url: process.env.END_POINT_Screens,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

const getObjectData = eventRecord => {
  // const objectKey = event.Records[0].s3.object.key;
  const objectKey = eventRecord.s3.object.key;
  const s3FileAccessLevel = `protected`;
  const region = `(${process.env.REGION}`;
  const UUIDPattern = `[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})`;
  const displayNamePattern = `([0-9a-z]{1,}_[0-9a-z]{1,})`;
  const displayNameSuffixPattern = `[0-9]{13,}`;
  const fileNamePattern = `(pc|mobile|thumbnail)[0-9]{13,}`;
  const objectKeyPattern = new RegExp(
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
  const objectKeyRegexResult = objectKey.match(objectKeyPattern);

  if (
    !objectKeyRegexResult ||
    !objectKeyRegexResult[0] ||
    !objectKeyRegexResult[1] ||
    !objectKeyRegexResult[2] ||
    !objectKeyRegexResult[3]
  ) {
    console.log('errvvvvvvv');
    return;
  }

  return {
    cognitoIdentityId: objectKeyRegexResult[1].replace('%3A', ':'),
    displayName: objectKeyRegexResult[2],
    size: eventRecord.s3.object.size,
    type: objectKeyRegexResult[3]
  };
};

exports.handler = (event, context, callback) => {
  event.Records.forEach(record => {
    if (record.eventName !== 'ObjectCreated:Put') {
      return;
    }
    console.log(
      'typeoffff',
      typeof Number(process.env.END_POINT_OBJECT_SIZE_LIMIT)
    );
    if (
      !getObjectData(event.Records[0]) ||
      getObjectData(event.Records[0]).size >
        Number(process.env.END_POINT_OBJECT_SIZE_LIMIT)
    ) {
      console.log('errrrobjecttt', event.Records[0]);

      // foobar
      return;
    }

    const registeredUsersQueryGetAccountNameInput = {
      cognitoIdentityId: getObjectData(event.Records[0]).cognitoIdentityId
    };

    const screensMutationCreateScreenInput = {
      objectKey: event.Records[0].s3.object.key,
      posterId: getObjectData(event.Records[0]).displayName,
      type: getObjectData(event.Records[0]).type
    };

    (async () => {
      await registeredUsersClient.hydrated();

      const registeredUsersQueryGetAccountNameResult = await registeredUsersClient
        .query({
          query: registeredUsersQueryGetAccountName,
          variables: { input: registeredUsersQueryGetAccountNameInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {});
      console.log(
        'queryyyresulttt',
        registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName
      );
      console.log('event.Records[0]!!!!!????', event.Records[0]);

      if (!registeredUsersQueryGetAccountNameResult) {
        // foobar
      }

      if (
        registeredUsersQueryGetAccountNameResult.data.getAccountName.accountName.slice(
          96
        ) !== getObjectData(event.Records[0]).displayName
      ) {
        console.log('erorrrr');
        // foobar
      }
      await screensClient.hydrated();
      console.log('okkkkk????');
      const screensMutationCreateScreenResult = await screensClient
        .mutate({
          mutation: screensMutationCreateScreen,
          variables: { input: screensMutationCreateScreenInput },
          fetchPolicy: 'no-cache'
        })
        .catch(async () => {});

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

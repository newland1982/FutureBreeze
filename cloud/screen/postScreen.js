'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;

// beign 2

const registeredUsersQueryGetCognitoIdentityId = gql(`query CreateScreen($input: CreateScreenInput!) {
  createScreen(input: $input) {
      objectKey
  }
 }`);

// end 2

const mutationCreateScreen = gql(`mutation CreateScreen($input: CreateScreenInput!) {
    createScreen(input: $input) {
        objectKey
    }
   }`);

const createScreenInput = {
  //   objectKey,
  //   posterId
};

const mutationSetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      status
    }
  }`);

const queryGetIpAddressList = gql(`
  query GetIpAddressList($input: GetIpAddressListInput!) {
    getIpAddressList(input: $input) {
      ipAddressList {
        ipAddress
      }
    }
  }`);

const queryGetStatus = gql(`
  query GetStatus($input: GetStatusInput!) {
    getStatus(input: $input) {
      status
    }
  }`);

const client = new AWSAppSyncClient({
  url: process.env.END_POINT_Screens,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

exports.handler = (event, context, callback) => {
  event.Records.forEach(record => {
    if (record.eventName !== 'ObjectCreated:Put') {
      return;
    }
    // begin 1

    const objectKey = `protected/${process.env.REGION}%3A084ed459-fac4-46c8-afd6-a8cd06a25f15/xx_zz_1583252239848/Thumbnail1583336914921`;

    const objectKeyFirstPartPattern = `protected/${process.env.REGION}%3A`;
    const UUIDPattern = `([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})`;
    const displayNamePattern = `([0-9a-z]{1,}_[0-9a-z]{1,})`;
    const displayNameSuffixPattern = `[0-9]{13,}`;
    const fileNamePattern = `[0-9a-zA-Z]{13,}`;

    const objectKeyPattern = new RegExp(
      '^' +
        objectKeyFirstPartPattern +
        UUIDPattern +
        '/' +
        displayNamePattern +
        '_' +
        displayNameSuffixPattern +
        '/' +
        fileNamePattern +
        '$'
    );

    const regexResult = objectKey.match(objectKeyPattern);

    console.log('eventttt', event);
    console.log('event.userIdentityyyyy', event.Records[0].userIdentity);
    console.log('recorddddd', event.Records[0]);
    const createScreenInput = {
      objectKey,
      posterId
    };

    // end 1

    let ipAddressCount;

    const commonSetStatusInput = {
      id: record.dynamodb.NewImage.id.S,
      createdDate: record.dynamodb.NewImage.createdDate.S
    };

    const getIpAddressListInput = {
      ipAddress: record.dynamodb.NewImage.ipAddress.S
    };

    const getStatusInput = {
      id: record.dynamodb.NewImage.id.S,
      createdDate: record.dynamodb.NewImage.createdDate.S
    };

    (async () => {
      await client.hydrated();

      const queryGetStatusResult = await client
        .query({
          query: queryGetStatus,
          variables: { input: getStatusInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {
          await client
            .mutate({
              mutation: mutationSetStatus,
              variables: {
                input: { ...commonSetStatusInput, status: 'signUpError' }
              },
              fetchPolicy: 'no-cache'
            })
            .catch(() => {});
        });

      if (
        queryGetStatusResult.data.getStatus.status === 'processing' ||
        queryGetStatusResult.data.getStatus.status === 'completed'
      ) {
        return;
      }

      await client
        .mutate({
          mutation: mutationSetStatus,
          variables: {
            input: { ...commonSetStatusInput, status: 'processing' }
          },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});

      const result = await client
        .query({
          query: queryGetIpAddressList,
          variables: { input: getIpAddressListInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {
          await client
            .mutate({
              mutation: mutationSetStatus,
              variables: {
                input: { ...commonSetStatusInput, status: 'signUpError' }
              },
              fetchPolicy: 'no-cache'
            })
            .catch(() => {});
        });

      ipAddressCount = result.data.getIpAddressList.ipAddressList.length;

      if (ipAddressCount > process.env.ACCESS_LIMIT) {
        await client
          .mutate({
            mutation: mutationSetStatus,
            variables: {
              input: { ...commonSetStatusInput, status: 'accessLimitExceeded' }
            },
            fetchPolicy: 'no-cache'
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

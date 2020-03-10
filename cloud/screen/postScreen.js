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

const registeredUsersQueryGetCognitoIdentityId = gql(`
  query GetCognitoIdentityId($input: getCognitoIdentityIdInput!) {
    getCognitoIdentityId(input: $input) {
      cognitoIdentityId
  }
 }`);

// end 2

const registeredUsersClient = new AWSAppSyncClient({
  url: process.env.END_POINT_RegisteredUsers,
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

    const objectKey = event.Records[0].s3.object.key;
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

    // end 1

    // begin 3
    const registeredUsersQueryGetCognitoIdentityIdInput = {
      displayName: regexResult[2]
    };
    // end 3

    (async () => {
      await registeredUsersClient.hydrated();

      const registeredUsersQueryGetCognitoIdentityIdResult = await registeredUsersClient
        .query({
          query: registeredUsersQueryGetCognitoIdentityId,
          variables: { input: registeredUsersQueryGetCognitoIdentityIdInput },
          fetchPolicy: 'network-only'
        })
        .catch(async () => {});
      console.log(
        'queryyyresulttt',
        registeredUsersQueryGetCognitoIdentityIdResult
      );
      console.log(
        'displaynaemmm',
        registeredUsersQueryGetCognitoIdentityIdInput
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

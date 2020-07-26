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

const screens_Mutation_ChangePosterId = gql(`
  mutation ChangePosterId($input: ChangePosterIdInput!) {
    changePosterId(input: $input) {
      timed_out
    }
  }`);

const registeredUsers_Mutation_DeleteRegisteredUser = gql(`
  mutation DeleteRegisteredUser($input: DeleteRegisteredUserInput!) {
    deleteRegisteredUser(input: $input) {
      displayName
    }
  }`);

const registeredUsers_Mutation_SetStatus = gql(`
  mutation SetStatus($input: SetStatusInput!) {
    setStatus(input: $input) {
      displayName
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

exports.handler = (event) => {
  (async () => {
    console.log('eventtttt', event);
    const displayName = event.displayName;
    const accountName = event.accountName;

    await screensClient.hydrated();
    await registeredUsersClient.hydrated();

    const screens_Mutation_ChangePosterId_Input = {
      posterId: displayName,
    };

    const cognitoIdentityServiceProviderAdminDeleteUserInput = {
      UserPoolId: process.env.User_Pool_Id,
      Username: accountName,
    };

    const registeredUsers_Mutation_DeleteRegisteredUser_Input = {
      displayName,
    };

    const registeredUsers_Mutation_SetStatus_Input = {
      displayName,
      status: 'invalid',
    };

    try {
      await screensClient.mutate({
        mutation: screens_Mutation_ChangePosterId,
        variables: { input: screens_Mutation_ChangePosterId_Input },
        fetchPolicy: 'no-cache',
      });
    } catch (error) {
      await registeredUsersClient.mutate({
        mutation: registeredUsers_Mutation_SetStatus,
        variables: {
          input: registeredUsers_Mutation_SetStatus_Input,
        },
        fetchPolicy: 'no-cache',
      });
      return;
    }
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

'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;

const mutationCreateRegisteredUser = gql(`
  mutation CreateRegisteredUser($input: CreateRegisteredUserInput!) {
    createRegisteredUser(input: $input) {
      username
    }
  }`);

const mutationSetStatus = gql(`
mutation SetStatus($input: SetStatusInput!) {
  setStatus(input: $input) {
    status
  }
}`);

const clientRegisteredUsers = new AWSAppSyncClient({
  url: process.env.END_POINT_RegisteredUsers,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

const clientSignUpUsers = new AWSAppSyncClient({
  url: process.env.END_POINT_SignUpUsers,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

exports.handler = (event, context, callback) => {
  const accountName = event.userName;
  const username = accountName.slice(96);
  const usernamePrefix = event.userName.slice(0, 96);

  const createRegisteredUserInput = {
    username,
    accountName,
    status: 'nomal',
    jsonString: '{}'
  };

  const setStatusInput = {
    id: event.request.clientMetadata.id,
    status: 'preSignUpError'
  };

  if (
    !username.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/) ||
    !usernamePrefix.match(/^[a-f0-9]{96}$/)
  ) {
    (async () => {
      await clientSignUpUsers.hydrated();
      await clientSignUpUsers
        .mutate({
          mutation: mutationSetStatus,
          variables: { input: setStatusInput },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});
    })();
    return;
  }

  (async () => {
    await clientRegisteredUsers.hydrated();

    const result = await clientRegisteredUsers
      .mutate({
        mutation: mutationCreateRegisteredUser,
        variables: { input: createRegisteredUserInput },
        fetchPolicy: 'no-cache'
      })
      .catch(() => {});

    if (!result) {
      await clientSignUpUsers.hydrated();
      await clientSignUpUsers
        .mutate({
          mutation: mutationSetStatus,
          variables: { input: setStatusInput },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});
      return;
    }

    event.response.autoConfirmUser = true;
    callback(null, event);
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
    "ws": "^3.3.1",
    "amazon-cognito-identity-js": "^3.2.0"
  }
}
*/

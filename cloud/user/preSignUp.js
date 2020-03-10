'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;

const signUpUsersMutationSetStatus = gql(`
mutation SetStatus($input: SetStatusInput!) {
  setStatus(input: $input) {
    status
  }
}`);

const registeredUsersMutationCreateRegisteredUser = gql(`
  mutation CreateRegisteredUser($input: CreateRegisteredUserInput!) {
    createRegisteredUser(input: $input) {
      displayName
    }
  }`);

const signUpUsersClient = new AWSAppSyncClient({
  url: process.env.END_POINT_SignUpUsers,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

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
  const accountName = event.userName;
  const displayName = accountName.slice(96);
  const displayNamePrefix = event.userName.slice(0, 96);

  const signUpUsersMutationSetStatusInput = {
    id: event.request.clientMetadata.id,
    status: 'preSignUpError'
  };

  const registeredUsersMutationCreateRegisteredUserInput = {
    displayName,
    accountName,
    status: 'nomal',
    jsonString: '{}'
  };

  if (
    !displayName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/) ||
    !displayNamePrefix.match(/^[a-f0-9]{96}$/)
  ) {
    (async () => {
      await signUpUsersClient.hydrated();
      await signUpUsersClient
        .mutate({
          mutation: signUpUsersMutationSetStatus,
          variables: { input: signUpUsersMutationSetStatusInput },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});
    })();
    return;
  }

  (async () => {
    await registeredUsersClient.hydrated();

    const result = await registeredUsersClient
      .mutate({
        mutation: registeredUsersMutationCreateRegisteredUser,
        variables: { input: registeredUsersMutationCreateRegisteredUserInput },
        fetchPolicy: 'no-cache'
      })
      .catch(() => {});

    if (!result) {
      await signUpUsersClient.hydrated();
      await signUpUsersClient
        .mutate({
          mutation: signUpUsersMutationSetStatus,
          variables: { input: signUpUsersMutationSetStatusInput },
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

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

const signUpUsers_Mutation_SetStatus = gql(`
mutation SetStatus($input: SetStatusInput!) {
  setStatus(input: $input) {
    status
  }
}`);

const signUpUsersClient = new AWSAppSyncClient({
  url: process.env.AppSync_SignUpUsers,
  region: process.env.AppSync_Region,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials,
  },
  disableOffline: true,
});

exports.handler = (event, context, callback) => {
  const signUpUsers_Mutation_SetStatus_Input = {
    id: event.request.clientMetadata.id,
    status: 'completed',
  };

  (async () => {
    await signUpUsersClient.hydrated();
    await signUpUsersClient.mutate({
      mutation: signUpUsers_Mutation_SetStatus,
      variables: { input: signUpUsers_Mutation_SetStatus_Input },
      fetchPolicy: 'no-cache',
    });

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

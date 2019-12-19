'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const gql = require('graphql-tag');
const credentials = AWS.config.credentials;

const mutationCreateUserData = gql(`
  mutation CreateUserData($input: CreateUserDataInput!) {
    createUserData(input: $input) {
      userName
    }
  }`);

const mutationSetStatus = gql(`
mutation SetStatus($input: SetStatusInput!) {
  setStatus(input: $input) {
    status
  }
}`);

const clientAdminUserData = new AWSAppSyncClient({
  url: process.env.END_POINT_AdminUserData,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

const clientSignUpUserInfo = new AWSAppSyncClient({
  url: process.env.END_POINT_SignUpUserInfo,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials
  },
  disableOffline: true
});

exports.handler = (event, context, callback) => {
  const userName = event.userName.slice(96);
  const userNamePrefix = event.userName.slice(0, 96);
  console.log('eventtttt', event);
  console.log('contexttt', context);

  const createUserDataInput = {
    userName,
    jsonString: '{}'
  };

  const setStatusInput = {
    id: event.request.clientMetadata.id,
    createdDate: event.request.clientMetadata.createdDate,
    status: 'presignupError'
  };

  if (
    !userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/) ||
    !userNamePrefix.match(/^[a-f0-9]{96}$/)
  ) {
    (async () => {
      await clientSignUpUserInfo.hydrated();
      console.log('1111');
      await clientSignUpUserInfo
        .mutate({
          mutation: mutationSetStatus,
          variables: { input: setStatusInput },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});
    })();
    return;
  }
  console.log('callbackkkkk');
  (async () => {
    await clientAdminUserData.hydrated();

    const result = await clientAdminUserData
      .mutate({
        mutation: mutationCreateUserData,
        variables: { input: createUserDataInput },
        fetchPolicy: 'no-cache'
      })
      .catch(() => {});

    console.log('resultttt', result);
    if (!result) {
      await clientSignUpUserInfo.hydrated();
      console.log('1111');
      await clientSignUpUserInfo
        .mutate({
          mutation: mutationSetStatus,
          variables: { input: setStatusInput },
          fetchPolicy: 'no-cache'
        })
        .catch(() => {});
      return;
    }

    console.log(2222);
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

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

const screensMutationCreateScreen = gql(`
  mutation CreateScreen($input: CreateScreenInput!) {
    createScreen(input: $input) {
      objectKey
  }
 }`);

const screensMutationChangePosterId = gql(`
  mutation ChangePosterId($input: ChangePosterIdInput!) {
    changePosterId(input: $input) {
      timed_out
  }
 }`);

const screensQueryGetScreenNames = gql(`
  query GetScreenNames($input: GetScreenNamesInput!) {
    getScreenNames(input: $input) {
        screenName
  }
 }`);

const screensQueryGetTypes = gql(`
  query GetTypes($input: GetTypesInput!) {
    getTypes(input: $input) {
        type
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

const types = ['thumbnai', 'mobile', 'pc'];

exports.handler = async (event) => {
  (async () => {
    await screensClient.hydrated();
    for (let type of types) {
      try {
        const screensQueryGetScreenNamesInput = {
          type,
        };
        const screensQueryGetScreenNamesResult = await screensClient.query({
          query: screensQueryGetScreenNames,
          variables: { input: screensQueryGetScreenNamesInput },
          fetchPolicy: 'network-only',
        });
        if (screensQueryGetScreenNamesResult.length !== 0) {
          for (let value of screensQueryGetScreenNamesResult) {
            const screenName = value.screenName;
            const screensQueryGetTypesInput = {
              screenName,
            };
            const screensQueryGetTypesResult = await screensClient.query({
              query: screensQueryGetTypes,
              variables: { input: screensQueryGetTypesInput },
              fetchPolicy: 'network-only',
            });
          }
        }
      } catch (error) {
        return;
      }
    }
  })();
};

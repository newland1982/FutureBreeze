//triggered by dynamodb stream
'use strict';

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;

const gql = require('graphql-tag');
const query = gql(`
query GetIpAddress($ipAddress: String!) {
  getIpAddress(ipAddress: $ipAddress) {
    ipAddress
}
}`);

const client = new AWSAppSyncClient({
  url: process.env.ENDPOINT,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.API_KEY,
    apiKey: process.env.APIKEY
  },
  disableOffline: true
});

client.hydrated().then(function(client) {
  client
    .query({ query: query, variables: { userId }, fetchPolicy: 'network-only' })
    .then(function logData(data) {
      console.log('results of queryyyyyy: ', data);
    })
    .catch(console.error);
});

exports.handler = (event, context, callback) => {
  event.Records.forEach(record => {
    console.log('eventName', record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);

    if (record.eventName == 'INSERT') {
      const newItem = record.dynamodb.NewImage;
    } else if (record.eventName == 'MODIFY') {
      const oldItem = record.dynamodb.OldImage;
      const newItem = record.dynamodb.NewImage;
    } else if (record.eventName == 'REMOVE') {
      const deletedItem = record.dynamodb.OldImage;
    } else {
    }
  });
};

//pre-signup
exports.handler = (event, context, callback) => {
  if (!event.userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
    callback(new Error('invalid userName'), event);
  } else {
    event.response.autoConfirmUser = false;
    callback(null, event);
  }
};

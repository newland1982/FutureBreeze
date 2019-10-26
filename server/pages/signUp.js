exports.handler = (event, context, callback) => {
  if (event.userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
    event.response.autoConfirmUser = true;
    callback(null, event);
  } else {
    callback(new Error('invalid userName'), event);
  }
};

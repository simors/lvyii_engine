'use strict';

var crypto = require('crypto');

exports.unauthResp = function(res) {
  res.statusCode = 401;
  res.setHeader('content-type', 'application/json; charset=UTF-8');
  return res.end(JSON.stringify({ code: 401, error: 'Unauthorized.' }));
};

/* options: req, user, params, object*/
exports.prepareRequestObject = function(options) {
  var req = options.req;
  var user = options.user;

  var currentUser = user || (req && req.LY && req.LY.user);

  return {
    params: options.params,
    meta: {
      remoteAddress: req && req.headers && getRemoteAddress(req)
    },
    currentUser: currentUser,
    sessionToken: (currentUser && currentUser.token) || (req && req.sessionToken)
  };
};

exports.prepareResponseObject = function(res, callback) {
  return {
    success: function(result) {
      callback(null, result);
    },

    error: function(error) {
      callback(error);
    }
  };
};

var getRemoteAddress = exports.getRemoteAddress = function(req) {
  return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress
};

exports.endsWith = function(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

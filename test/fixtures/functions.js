const assert = require('assert');
const should = require('should');

const LY = require('../..');

LY.Cloud.define('firstCall', function(request) {
  assert.ok(request.meta.remoteAddress);
  return "success"
});

LY.Cloud.define('callWithParams', function(request) {
  var params = request.params
  var username = params.username
  var password = params.password
  if (!username || !password) {
    throw new LY.Cloud.Error('params error', {code: 1001})
  }
  
  if (username !== 'lvyii' || password !== '123') {
    throw new LY.Cloud.Error('user login error', {code: 2001})
  }
  
  return {
    code: 0,
    message: 'login success'
  }
});
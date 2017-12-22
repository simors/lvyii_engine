const assert = require('assert');
const should = require('should');

const LY = require('../..');

LY.Cloud.define('firstCall', function(request) {
  assert.ok(request.meta.remoteAddress);
  return "success"
});
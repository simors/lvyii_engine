'use strict';

var LY = {};
var debug = require('debug')('LY:LvyiiEngine');
var utils = require('./utils');
var _ = require('underscore');

var Cloud = module.exports = {
  functions: {}
};

Cloud.define = function(name, func) {
  debug('define function: %s', name);

  if (Cloud.functions[name]) {
    throw new Error(`LvyiiEngine: ${name} already defined`);
  } else {
    Cloud.functions[name] = func;
  }
};

Cloud.Error = class CloudError extends Error {
  constructor(message, extra) {
    super()

    extra = extra || {}

    if (!extra.status) {
      extra.status = 400;
    }

    _.extend(this, {
      name: 'CloudError',
      message: message
    }, extra)

    Error.captureStackTrace(this, this.constructor)
  }
}

function className(clazz) {
  if (_.isString(clazz)) {
    return clazz;
  } else if (clazz.className) {
    return clazz.className;
  } else {
    throw new Error('Unknown class:' + clazz);
  }
}

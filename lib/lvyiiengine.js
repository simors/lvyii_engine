/**
 * Created by yangyang on 2017/12/20.
 */
'use strict';

var connect = require('connect');
var bodyParser = require('body-parser');
var https = require('https');
var timeout = require('connect-timeout');
var _ = require('underscore');

var LY = require('./storage-extra')
var utils = require('./utils');
var frameworks = require('./frameworks');

var NODE_ENV = process.env.NODE_ENV || 'development';

LY.express = function(options) {
  return frameworks(createRootRouter(options), 'express');
};

var Cloud = _.extend(LY.Cloud, require('./cloud'));

// Don't reject unauthorized ssl.
if (https.globalAgent && https.globalAgent.options) {
  https.globalAgent.options.rejectUnauthorized = false;
}

LY.Cloud.LvyiiCloudHeaders = function(options) {
  return frameworks(require('../middleware/lvyii-headers')(LY)(options), options && options.framework);
};

function createRootRouter(options) {
  var router = connect();
  
  ['1'].forEach(function(apiVersion) {
    router.use('/' + apiVersion + '/function/', createCloudFunctionRouter(options));
  });
  
  return router;
}

function createCloudFunctionRouter(options) {
  options = options || {};
  
  var cloudFunctions = connect();
  
  cloudFunctions.use(timeout(options.timeout || '15s'));
  cloudFunctions.use(bodyParser.urlencoded({extended: false, limit: '20mb'}));
  cloudFunctions.use(bodyParser.json({limit: '20mb'}));
  cloudFunctions.use(bodyParser.text({limit: '20mb'}));
  cloudFunctions.use(require('../middleware/cors')());
  
  cloudFunctions.use(function(req, res, next) {
    promiseTry( () => {
      if (req.url === '/') {
        throw new Cloud.Error(`No function name or class name: ${req.originalUrl}`, {status: 404, printToLog: true, printFullStack: false});
      }
      
      const urlParams = req.url.split('/');
      const functionOrClass = urlParams[1];
  
      return callCloudFunction(req, functionOrClass);
    }).then( response => {
      responseJson(res, response);
    }).catch( err => {
      var statusCode;
      
      if (err instanceof Error) {
        statusCode = err.status || err.statusCode || 500;
      } else {
        statusCode = 400;
      }
      
      if (statusCode === 500 || err.printToLog) {
        if (options.printFullStack !== false && err.printFullStack !== false) {
          console.warn(`LvyiiEngine: ${req.url}: ${statusCode}: ${err.stack || err.message}`);
        } else {
          console.warn(`LvyiiEngine: ${req.url}: ${statusCode}: ${err.name}: ${err.message}`);
        }
      }
      
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.statusCode = statusCode;
        
        res.end(JSON.stringify({
          code: err.code || 1,
          error: err.message || err.responseText || err || 'unknown error'
        }));
      }
    });
  });
  
  cloudFunctions.use(function(err, req, res, next) { // jshint ignore:line
    if(req.timedout) {
      console.error(`LvyiiEngine: ${req.originalUrl}: function timeout (${err.timeout}ms)`);
      err.code = 124; // 自定义错误代码
      err.message = 'The request timed out on the server.';
    }
    responseError(res, err);
  });
  
  return cloudFunctions;
}

function callCloudFunction(req, funcName) {
  const cloudFunction = Cloud.functions[funcName];
  
  if (!cloudFunction) {
    throw new Cloud.Error(`No such cloud function '${funcName}'`, {status: 404, printToLog: true, printFullStack: false});
  }
  
  var params = req.body;
  
  return promiseTry( () => {
    // if (req.LY.sessionToken && req.LY.sessionToken !== '') {
    //   return AV.User.become(req.AV.sessionToken);
    // }
    return null
  }).then( user => {
    const request = utils.prepareRequestObject({req, user, params});
  
    return cloudFunction(request);
  }).then( result => {
    return {result};
  });
}

function responseJson(res, data) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = 200;
  return res.end(JSON.stringify(data));
}

function responseError(res, err) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = err.status || err.statusCode || 400;
  res.end(JSON.stringify({
    code: err.code || 1,
    error: err && (err.message || err.responseText || err) || 'null message'
  }));
}

function promiseTry(func) {
  return new Promise( (resolve, reject) => {
    try {
      Promise.resolve(func()).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = LY;
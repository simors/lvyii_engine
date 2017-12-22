/**
 * Created by yangyang on 2017/12/22.
 */
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('supertest');
var should = require('should');
var assert = require('assert');

const LY = require('../..');
const appInfo = require('../fixtures/app-info');

var appId = appInfo.appId;
var appKey = appInfo.appKey;

var app = express();

require('../fixtures/functions')

app.use(LY.Cloud.LvyiiCloudHeaders());
app.use(LY.express());
app.use(bodyParser.json());

describe('function-call', function() {
  it('callFuncNormal', function(done) {
    request(app).post('/1/function/callWithParams')
      .set('X-LY-Id', appId)
      .set('X-LY-Key', appKey)
      .send({
        username: 'lvyii',
        password: '123'
      })
      .expect(200, function(err, res) {
        let result = res.body.result
        assert.equal(0, result.code);
        done(err);
      });
  });
  
  it('passwordError', function(done) {
    request(app).post('/1/function/callWithParams')
      .set('X-LY-Id', appId)
      .set('X-LY-Key', appKey)
      .send({
        username: 'lvyii',
        password: '321'
      })
      .expect(400, function(err, res) {
        let result = res.body
        assert.equal(2001, result.code);
        done(err);
      });
  });
  
  it('paramsError', function(done) {
    request(app).post('/1/function/callWithParams')
      .set('X-LY-Id', appId)
      .set('X-LY-Key', appKey)
      .send({
        password: '321'
      })
      .expect(400, function(err, res) {
        let result = res.body
        assert.equal(1001, result.code);
        done(err);
      });
  });
  
});
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

app.use(LY.Cloud.LvyiiCloudHeaders({restrict: false}));
app.use(LY.express());
app.use(bodyParser.json());

describe('header-validation', function() {
  it('noSign', function(done) {
    request(app).post('/1/function/firstCall')
      .set('X-LY-Id', appId)
      .set('X-LY-Key', appKey)
      .expect(200, function(err, res) {
        assert.equal('success', res.body.result);
        done(err);
      });
  });
  
  it('wrong app id', function(done) {
    request(app).post('/1/function/firstCall')
      .set('X-LY-Id', 'abc')
      .set('X-LY-Key', appKey)
      .expect(401, function(err, res) {
        done(err);
      });
  });
  
  it('wrong app key', function(done) {
    request(app).post('/1/function/firstCall')
      .set('X-LY-Id', appId)
      .set('X-LY-Key', 'abc')
      .expect(401, function(err, res) {
        done(err);
      });
  });
});

'use strict';
var LY = require('lvyii_storage');

if (process.env.LY_API_SERVER) {
  LY.setServerURLs(process.env.LY_API_SERVER);
}

LY._config.userAgent = 'Lvyii Cloud Code Node v0.0.1';
LY.Cloud.__prod = process.env.NODE_ENV === 'production' ? 1 : 0;
LY.setProduction(LY.Cloud.__prod);

module.exports = LY;

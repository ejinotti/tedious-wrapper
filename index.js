'use strict';

var ConnPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

var path = require('path');

function TediousWrapper(opts) {
  if (!(this instanceof TediousWrapper)) {
    return new TediousWrapper(opts);
  }

  opts = opts || {};

  var config = require(
    opts.path ? path.join(opts.path, 'tds-config') : './tds-config'
  );

  var poolConfig = {
    min: config.poolMin,
    max: config.poolMax,
    log: false,
  };

  var connConfig = {
    userName: config.username,
    password: config.password,
    server: config.server,
    options: {
      encrypt: config.encrypt,
      database: config.dbname,
      rowCollectionOnRequestCompletion: true,
    },
  };

  this.pool = new ConnPool(poolConfig, connConfig);
}

TediousWrapper.prototype.exec = function exec(sql, cb) {
  this.pool.acquire(function (err, conn) {
    if (err) {
      return console.error('Pool Error: ' + err);
    }

    var req = new Request(sql, function (err, count, rows) {
      if (err) {
        console.error('Request Error: ' + err);
      } else {
        console.log('Rows: ' + count);
        cb(rows);
      }

      conn.release();
    });

    conn.execSql(req);
  });
};

module.exports = TediousWrapper;

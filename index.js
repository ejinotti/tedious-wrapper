'use strict';

var ConnPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

var path = require('path');
var _ = require('underscore');

var timing = require('./timing');

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
  var t0 = timing.init();

  this.pool.acquire(function (err, conn) {
    if (err) {
      console.error('Pool Error: ' + err);
      return cb(err, null);
    }

    var req = new Request(sql, function (err, count, rows) {
      if (err) {
        console.error('Request Error: ' + err);
        cb(err, null);
      } else {
        console.log(count + 'rows in ' + timing.elapsed(t0) + 'ms.');

        cb(null, _.map(rows, function (row) {
          return _.reduce(row, function (rowObj, col) {
            rowObj[col.metadata.colName] = col.value;
            return rowObj;
          }, {});
        }));
      }

      conn.release();
    });

    conn.execSql(req);
  });
};

module.exports = TediousWrapper;

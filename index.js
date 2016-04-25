'use strict';

var ConnPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

var path = require('path');
var _ = require('underscore');

var timing = require('./timing');

function TediousWrapper(opts) {
  opts = opts || {};

  var config = require(
    opts.path ? path.join(opts.path, 'tds-config') : './tds-config'
  );

  var poolConfig = {
    min: config.poolMin || 5,
    max: config.poolMax || 10,
    log: config.poolLog || false,
  };

  var options = {rowCollectionOnRequestCompletion: true};

  if (config.encrypt !== undefined) {
    options.encrypt = config.encrypt;
  }

  if (config.dbname !== undefined) {
    options.database = config.dbname;
  }

  var connConfig = {
    userName: config.username,
    password: config.password,
    server: config.server,
    options: options,
  };

  this.pool = new ConnPool(poolConfig, connConfig);
}

function execute(sql, params, cb, method) {
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
        var result = _.map(rows, function (row) {
          return _.reduce(row, function (rowObj, col) {
            rowObj[col.metadata.colName] = col.value;
            return rowObj;
          }, {});
        });

        console.log(result.length + ' rows in ' + timing.elapsed(t0) + 'ms.');

        cb(null, result);
      }

      conn.release();
    });

    _.each(params, function (param, name) {
      req.addParameter(name, param.type, param.value);
    });

    conn[method](req);
  });
}

TediousWrapper.prototype.exec = function exec(sql, params, cb) {
  execute.call(this, sql, params, cb, 'execSql');
};

TediousWrapper.prototype.execsp = function execsp(sql, params, cb) {
  execute.call(this, sql, params, cb, 'callProcedure');
};

TediousWrapper.prototype.TYPES = require('tedious').TYPES;

module.exports = function (opts) {
  return new TediousWrapper(opts);
};

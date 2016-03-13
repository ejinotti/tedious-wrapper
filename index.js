'use strict';

var ConnPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

var path = require('path');

function TediousWrapper(opts) {
  if (!(this instanceof TediousWrapper)) {
    console.log('not instanceof.. calling new.');
    return new TediousWrapper(opts);
  }

  opts = opts || {};

  var config = require(
    opts.path ? path.join(opts.path, 'tds-config') : './tds-config'
  );

  var poolConfig = {
    min: 2,
    max: 4,
    log: false,
  };

  var connConfig = {
    userName: config.username,
    password: config.password,
    server: config.server,
    options: {
      database: config.dbname,
      rowCollectionOnDone: true,
    },
  };

  this.pool = new ConnPool(poolConfig, connConfig);
}

TediousWrapper.prototype.exec = function exec(sql, cb) {
  this.pool.acquire(function (err, conn) {
    if (err) {
      console.error(err);
    }

    var request = new Request(sql, function (err, count) {
      if (err) {
        console.error(err);
      }

      console.log('Rows: ' + count);

      conn.release();
    });

    request.on('done', function (count, more, rows) {
      cb(rows);
    });
  });
};

module.exports = TediousWrapper;

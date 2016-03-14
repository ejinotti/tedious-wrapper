'use strict';

exports.init = function () {
  return process.hrtime();
};

exports.elapsed = function (t0) {
  var diff = process.hrtime(t0);
  return Math.round(diff[0] * 1000 + diff[1] / 1000000);
};

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function Diff() {
  this.diffenerce = {};
  this.diffs = {};
}
Diff.prototype.inject = function (name, line, lineCount) {
  if (name in this.diffs && lineCount in this.diffs[name]) {
    return this.compare(name, line, lineCount);
  }
  this.diffs[name] = _extends({}, this.diffs[name], _defineProperty({}, lineCount, {
    line: line
  }));
};

Diff.prototype.compare = function (name, lineDiff, lineCount) {
  var line = this.diffs[name][lineCount].line;
  if (lineDiff !== line) {
    var lineChange = [line, lineDiff],
        data = _defineProperty({}, lineCount, lineChange);
    this.diffenerce[name] = name in this.diffenerce ? _extends({}, this.diffenerce[name], data) : data;
  }
  //   delete this.diffs[name]
};

Diff.prototype.log = function () {
  var _this = this;

  var keys = Object.keys(this.diffenerce);
  if (keys.length === 0) return;

  keys.forEach(function (v, i) {
    console.table(_this.diffenerce[v]);
  });
};

exports.default = new Diff();
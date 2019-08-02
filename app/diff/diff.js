"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Diff() {
  this.diffenerce = {};
  this.diffs = {};
}

Diff.prototype.inject = function (name, line, lineCount) {
  if (name in this.diffs && lineCount in this.diffs[name]) {
    return this.compare(name, line, lineCount);
  }

  this.diffs[name] = _objectSpread({}, this.diffs[name], {}, (0, _defineProperty2["default"])({}, lineCount, {
    line: line
  }));
};

Diff.prototype.compare = function (name, lineDiff, lineCount) {
  var line = this.diffs[name][lineCount].line;

  if (lineDiff !== line) {
    var lineChange = [line, lineDiff],
        data = (0, _defineProperty2["default"])({}, lineCount, lineChange);
    this.diffenerce[name] = name in this.diffenerce ? _objectSpread({}, this.diffenerce[name], {}, data) : data;
  }
};

Diff.prototype.getDiff = function () {
  return this.diffenerce;
};

var _default = new Diff();

exports["default"] = _default;
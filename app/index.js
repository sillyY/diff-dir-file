"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _folder = _interopRequireDefault(require("./file/folder"));

var _consola = _interopRequireDefault(require("consola"));

var _diff = _interopRequireDefault(require("./diff/diff"));

var log = _consola["default"].withTag('Compare');

function compare(path1, path2) {
  return new Promise(
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(resolve, reject) {
      var folder1, folder2, res;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              folder1 = new _folder["default"](path1);
              folder2 = new _folder["default"](path2);
              log.info('开始比对', folder1.name, folder2.name);
              _context.next = 6;
              return folder1.init();

            case 6:
              _context.next = 8;
              return folder2.init();

            case 8:
              res = _diff["default"].getDiff();
              resolve(res);
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](0);
              reject(_context.t0);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 12]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

module.exports = compare;
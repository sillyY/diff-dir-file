'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _folder = require('../file/folder');

var _folder2 = _interopRequireDefault(_folder);

var _consola = require('consola');

var _consola2 = _interopRequireDefault(_consola);

var _diff = require('../diff/diff');

var _diff2 = _interopRequireDefault(_diff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = _consola2.default.withTag('Run');

var folder1 = new _folder2.default('/Users/sillyy/Desktop/diff-test/a');
var folder2 = new _folder2.default('/Users/sillyy/Desktop/diff-test/b');

function run() {
  var _this = this;

  return new Promise(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(resolve, reject) {
      var res;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;

              log.info('开始比对');
              _context.next = 4;
              return folder1.init();

            case 4:
              _context.next = 6;
              return folder2.init();

            case 6:
              res = _diff2.default.getDiff();

              log.info(res);
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context['catch'](0);

              log.error(_context.t0);

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[0, 10]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

run();
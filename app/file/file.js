'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _linebyline = require('linebyline');

var _linebyline2 = _interopRequireDefault(_linebyline);

var _consola = require('consola');

var _consola2 = _interopRequireDefault(_consola);

var _diff = require('../diff/diff');

var _diff2 = _interopRequireDefault(_diff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = _consola2.default.withTag('File');

var File = function File(name, path) {
  this.name = name;
  this.path = path;
  this.content = [];
  this.lines = 0;
};

File.prototype.add = function () {
  throw new Error('文件下面不能再添加文件');
};

File.prototype.scan = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(dir) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            log.info('开始扫描文件: ', this.name);
            _context.next = 4;
            return this._read(dir);

          case 4:
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context['catch'](0);

            log.error(_context.t0);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 6]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

File.prototype._read = function (dir) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    log.info('开始读取行: ', _this.path);
    var that = _this;
    var rl = (0, _linebyline2.default)(_this.path);
    rl.on('line', function (line, lineCount, byteCount) {
      _diff2.default.inject(that.path.replace(dir + '/', ''), line, lineCount);
    }).on('end', function () {
      resolve();
      // log.info(that.name,' 扫描完成')
    }).on('error', function (e) {
      reject(e);
    });
  });
};

exports.default = File;
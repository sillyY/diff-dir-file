'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _readdir = require('readdir');

var readDir = _interopRequireWildcard(_readdir);

var _consola = require('consola');

var _consola2 = _interopRequireDefault(_consola);

var _util = require('./util');

var _file = require('./file');

var _file2 = _interopRequireDefault(_file);

var _diff = require('../diff/diff');

var _diff2 = _interopRequireDefault(_diff);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = _consola2.default.withTag('Folder');

var Folder = function Folder(path) {
  this.path = path;
  var folder = this._parse(path);
  this.name = folder.name;
  this.files = [];
};

Folder.prototype.init = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
  var directory, i, len, _parse, name, path;

  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          directory = this._readDir();
          i = 0, len = directory.length;


          for (; i < len; i++) {
            _parse = this._parse(directory[i]), name = _parse.name, path = _parse.path;

            this._add(new _file2.default(name, path));
          }
          _context.next = 5;
          return this._scan();

        case 5:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
}));

Folder.prototype._add = function (file) {
  this.files.push(file);
};

Folder.prototype._scan = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(directory) {
    var i, file, files;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            log.info('开始扫描文件夹: ' + this.name);
            i = 0, files = this.files;

          case 2:
            if (!(file = files[i++])) {
              _context2.next = 7;
              break;
            }

            _context2.next = 5;
            return file.scan(this.path);

          case 5:
            _context2.next = 2;
            break;

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

Folder.prototype._readDir = function () {
  return readDir.readSync(this.path, null, readDir.ABSOLUTE_PATHS);
};

Folder.prototype._parse = function (path) {
  if (!path) return null;
  var data = path.split('/');
  return {
    path: path,
    name: this.name
  };
};

exports.default = Folder;
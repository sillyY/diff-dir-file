"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var readDir = _interopRequireWildcard(require("readdir"));

var _consola = _interopRequireDefault(require("consola"));

var _file = _interopRequireDefault(require("./file"));

var log = _consola["default"].withTag('Folder');

var Folder = function Folder(path) {
  this.path = path;

  var folder = this._parse(path);

  this.name = folder.name;
  this.files = [];
};

Folder.prototype.init =
/*#__PURE__*/
(0, _asyncToGenerator2["default"])(
/*#__PURE__*/
_regenerator["default"].mark(function _callee() {
  var directory, i, len, _this$_parse, name, path;

  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          directory = this._readDir();
          i = 0, len = directory.length;

          for (; i < len; i++) {
            _this$_parse = this._parse(directory[i]), name = _this$_parse.name, path = _this$_parse.path;

            this._add(new _file["default"](name, path));
          }

          _context.next = 5;
          return this._scan();

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));

Folder.prototype._add = function (file) {
  this.files.push(file);
};

Folder.prototype._scan =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(directory) {
    var i, file, files;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
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
          case "end":
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

var _default = Folder;
exports["default"] = _default;
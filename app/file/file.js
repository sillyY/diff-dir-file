"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _linebyline = _interopRequireDefault(require("linebyline"));

var _consola = _interopRequireDefault(require("consola"));

var _diff = _interopRequireDefault(require("../diff/diff"));

var log = _consola["default"].withTag('File');

var File = function File(name, path) {
  this.name = name;
  this.path = path;
  this.content = [];
  this.lines = 0;
};

File.prototype.add = function () {
  throw new Error('文件下面不能再添加文件');
};

File.prototype.scan =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(dir) {
    return _regenerator["default"].wrap(function _callee$(_context) {
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
            _context.t0 = _context["catch"](0);
            log.error(_context.t0);

          case 9:
          case "end":
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
    var rl = (0, _linebyline["default"])(_this.path);
    rl.on('line', function (line, lineCount, byteCount) {
      _diff["default"].inject(that.path.replace("".concat(dir, "/"), ''), line, lineCount);
    }).on('end', function () {
      resolve(); // log.info(that.name,' 扫描完成')
    }).on('error', function (e) {
      reject(e);
    });
  });
};

var _default = File;
exports["default"] = _default;
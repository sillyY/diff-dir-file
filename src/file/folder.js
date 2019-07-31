const readDir
var Folder = function(name, path) {
  this.name = name
  this.path = path
  this.files = []
}

Folder.prototype.init = function() {
  const directory = this._readDir
  let i = 0,
    len = directory.length

  // if()
}

Folder.prototype._add = function(file) {
  this.files.push(file)
}

Folder.prototype._scan = function() {
  console.log('开始扫描文件夹: ' + this.name)
  for (var i = 0, file, files = this.files; (file = files[i++]); ) {
    file.scan()
  }
}

Folder.prototype._readDir = function() {
  return readDir.readSync( this.path, null, readDir.ABSOLUTE_PATHS );
}
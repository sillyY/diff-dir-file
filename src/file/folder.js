import readDir from 'readdir'
import consola from 'consola'

import File from './file'

const log = consola.withTag('Folder')

var Folder = function(path) {
  this.path = path
  const folder = this._parse(path)
  this.name = folder.name
  this.files = []
}

Folder.prototype.init = async function() {
  log.info('开始读取内容文件')
  const directory = this._readDir()
  log.info('结束读取内容文件')

  let i = 0,
    len = directory.length

  for (; i < len; i++) {
    const { name, path } = this._parse(directory[i])
    this._add(new File(name, path))
  }
  await this._scan()
}

Folder.prototype._add = function(file) {
  this.files.push(file)
}

Folder.prototype._scan = async function(directory) {
  log.info('开始扫描文件夹: ' + this.name)
  for (var i = 0, file, files = this.files; (file = files[i++]); ) {
    await file.scan(this.path)
  }
}

Folder.prototype._readDir = function() {
  return readDir.readSync(this.path, null, readDir.ABSOLUTE_PATHS)
}

Folder.prototype._parse = function(path) {
  if (!path) return null
  const data = path.split('/')
  return {
    path,
    name: this.name
  }
}

export default Folder

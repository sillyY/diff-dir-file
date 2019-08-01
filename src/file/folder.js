import * as readDir from 'readdir'
import consola from 'consola'

import { complieFile } from './util'
import File from './file'
import diff from '../diff/diff'

const log = consola.withTag('Folder')

var Folder = function(name, path) {
  this.name = name
  this.path = path
  this.files = []
}

Folder.prototype.init = async function() {
  const directory = this._readDir()

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
    name: data[data.length - 1]
  }
}

export default Folder
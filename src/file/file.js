import readline from 'readline'
import consola from 'consola'
import { Diff } from '../diff/index.js'

const log = consola.withTag('File')

const diff = new Diff()

var File = function(name, path) {
  this.name = name
  this.path = path
  this.content = []
  this.lines = 0
}

File.prototype.add = function() {
  throw new Error('文件下面不能再添加文件')
}

File.prototype.scan = async function() {
  try {
    log.info('开始扫描文件: ', this.name)
  } catch (error) {
    log.error(error)
  }
}

File.prototype.read = function(path) {
  var r1 = readline(path)
  rl.on('line', function(line, lineCount, byteCount) {
    diff.inject(path, line, lineCount)
  })
    .on('end', function() {
      diff.log()
    })
    .on('error', function(e) {
      log.error(e)
    })
}
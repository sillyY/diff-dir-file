import readline from 'linebyline'
import consola from 'consola'
import diff from '../diff/diff'

const log = consola.withTag('File')

var File = function(name, path) {
  this.name = name
  this.path = path
  this.content = []
  this.lines = 0
}

File.prototype.add = function() {
  throw new Error('文件下面不能再添加文件')
}

File.prototype.scan = async function(dir) {
  try {
    log.info('开始扫描文件: ', this.name)
    await this._read(dir)
  } catch (error) {
    log.error(error)
  }
}

File.prototype._read = function(dir) {
  return new Promise((resolve, reject) => {
    log.info('开始读取行: ', this.path)
    const that = this
    var rl = readline(this.path)
    rl.on('line', function(line, lineCount, byteCount) {
      diff.inject(that.path.replace(`${dir}/`, ''), line, lineCount)
    })
      .on('end', function() {
        resolve()
        // log.info(that.name,' 扫描完成')
      })
      .on('error', function(e) {
        reject(e)
      })
  })
}

export default File

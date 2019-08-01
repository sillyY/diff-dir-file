import Folder from './file/folder'
import consola from 'consola'
import diff from './diff/diff'

const log = consola.withTag('Compare')

function compare(path1, path) {
  return new Promsie(async (resolve, reject) => {
    try {
      const folder1 = new Folder(path1)
      const folder2 = new Folder(path2)

      log.info('开始比对', folder1.name, folder2.name)
      await folder1.init()
      await folder2.init()
      const res = diff.getDiff()
      resolve(res)
    } catch (err) {
      reject(err)
    }
  })
}

// module.exports = compare

var a = compare(
  '/Users/sillyy/Desktop/diff-test/a',
  '/Users/sillyy/Desktop/diff-test/b'
)
a.then(res => console.log(res))

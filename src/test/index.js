import Folder from '../file/folder'
import consola from 'consola'
import diff from '../diff/diff';

const log = consola.withTag('Run')

const folder1 = new Folder('a', '/Users/sillyy/Desktop/diff-test/a')
const folder2 = new Folder('b', '/Users/sillyy/Desktop/diff-test/b')

function run() {
  return new Promise(async (resolve, reject) => {
    try {
      log.info('开始比对')
      await folder1.init()
      await folder2.init()
      diff.log()
    } catch (error) {
      log.error(error)
    }
  })
}

run()

import fs from 'fs'
import path from 'path'
import readline from 'readline'

export function readFile(path) {
    var r1 = readline(path)
    rl.on('line', function(line, lineCount, byteCount) {
        // do something with the line of text
      })
      .on('error', function(e) {
        // something went wrong
      });
}

export function resolve(filepath) {
    return path.resolve(__dirname,`../../${filepath}`)
}


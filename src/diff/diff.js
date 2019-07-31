var hasOwnProperty = Object.prototype.hasOwnProperty
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}

function Diff() {
  this.diffenerce = {}
  this.diffs = {}
}
Diff.prototype.inject = function(name, line, lineCount) {
  if (name in this.diffs && lineCount in this.diffs[name])
    return this.compare(name, line, lineCount)
  this.diffs[name] = {
    ...this.diffs[name],
    ...{
      [lineCount]: {
        line
      }
    }
  }
}

Diff.prototype.compare = function(name, lineDiff, lineCount) {
  const line = this.diffs[name][lineCount].line
  if (lineDiff !== line) {
    let lineChange = [line, lineDiff],
      data = {
        [lineCount]: lineChange
      }
    this.diffenerce[name] =
      name in this.diffenerce ? { ...this.diffenerce[name], ...data } : data
  }
  //   delete this.diffs[name]
}

Diff.prototype.log = function() {
  let keys = Object.keys(this.diffenerce)
  if (keys.length === 0) return

  keys.forEach((v, i) => {
    console.table(this.diffenerce[v])
  })
}

export default {
  Diff
}

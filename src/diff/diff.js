function Diff() {
  this.diffenerce = {}
  this.diffs = {}
}
Diff.prototype.inject = function(name, line, lineCount) {
  if (name in this.diffs && lineCount in this.diffs[name]){
    return this.compare(name, line, lineCount)
  }
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
}

Diff.prototype.getDiff = function() {
  return this.diffenerce
}

export default new Diff()

<h1 align="center">Welcome to file-diff 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/npm/v/dir-compare.svg">
  <a href="https://github.com/sillyY/file-diff#readme">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
  <a href="https://github.com/sillyY/file-diff/graphs/commit-activity">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" target="_blank" />
  </a>
  <a href="https://github.com/sillyY/file-diff/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
</p>

> directory compare and show the difference of files

### 🏠 [Homepage](https://github.com/sillyY/file-diff#readme)

## Install

```sh
npm install file-diff
```

## Usage

```sh
const diff = require('file-diff')
let difference = difCompare(path1, path2)
difference.then(res => {
  // do something
  // ....
})
```

## Return

`dirDiff` returns Promise. Fulfilled value -`Object` in following format:

```
// the filename of the diff
interface IOut {
  name: IIner 
}
// the lineCount of the file
interface IInner{
  index: String[] // length: 2 , File A and File B
}

// For example

//a/a.js
function a() {
  console.log(1)
}
// b/a.js
function b() {
  console.log(2)
}

// result
{
  'a.js': {
    '1': ['function a() {' , 'function b() {'],
    '2': ['console.log(1)', 'console.log(2)'],
  }
}
```

## Author

👤 **sillyy**

- Github: [@sillyY](https://github.com/sillyY)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/sillyY/file-diff/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [sillyy](https://github.com/sillyY).<br />
This project is [MIT](https://github.com/sillyY/file-diff/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_

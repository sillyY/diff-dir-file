import babel from "rollup-plugin-babel";
import common from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

export default [
  {
    input: "src/index.js",
    output: {
      file: "lib/index.js",
      format: "cjs"
    },
    external: ['path'],
    plugins: [babel(), common(), resolve()]
  }
];
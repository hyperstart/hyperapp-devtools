const minimist = require("minimist")

const commonjs = require("rollup-plugin-commonjs")
const nodeResolve = require("rollup-plugin-node-resolve")
const typescript = require("rollup-plugin-typescript2")
const uglify = require("rollup-plugin-uglify")

const options = minimist(process.argv.slice(2), {
  boolean: ["min", "es"]
})

const plugins = [
  nodeResolve({
    extensions: [".ts", ".js", ".json"],
    jsnext: true
  }),
  commonjs(),
  typescript({
    clean: true,
    exclude: ["*.d.ts", "**/*.d.ts", "*.test.*", "**/*.test.*"]
  })
]
if (options.min) {
  plugins.push(uglify())
}

export default {
  input: "src/index.ts",
  output: {
    file: options.min
      ? "dist/hyperapp-devtools.min.js"
      : options.es
        ? "dist/hyperapp-devtools.es.js"
        : "dist/hyperapp-devtools.js",
    format: options.es ? "es" : "umd",
    name: "devtools",
    sourcemap: true
  },
  plugins
}

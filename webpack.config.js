const path = require("path")
const webpack = require("webpack")

const sourceMap = new webpack.SourceMapDevToolPlugin({
  filename: '[name].js.map'
})

module.exports = {
  mode: "production",
  entry: "./index.js",
  plugins: [sourceMap],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "vuex-module-maker.js",
    library: {
      name: "vuexModuleMaker",
      type: "umd"
    },
  },
  module: {   
    rules: [
      { 
        test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"
      }   
    ] 
  },
  externals: {
    "vuex-cache": {
      commonjs: 'vuex-cache',
      commonjs2: 'vuex-cache',
      amd: 'vuex-cache',
      root: 'vuex-cache',
    }
  }
}
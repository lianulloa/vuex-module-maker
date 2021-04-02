const path = require("path")

module.exports = {
  mode: "production",
  entry: "./index.js",
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
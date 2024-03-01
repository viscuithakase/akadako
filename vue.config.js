const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  publicPath: './',
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
  devServer: {
    port: 3000,
  },
  pages: {
    index: {
      entry: 'src/vismain.js',
      template: 'templates/viscuit.html',
      filename: 'index.html'
    }
  },
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,
        child_process: false
      }
    },
    plugins: [
      new NodePolyfillPlugin()
    ]
  }
}

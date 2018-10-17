module.exports = {
  mode: process.env.WEBPACK_MODE || 'development',
  entry: __dirname + '/src/videojs.hlsjs',
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: 'videojs-contrib-hlsjs.min.js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader" },
      { test: /\.js$/, exclude: [/node_modules/], loader: "ts-loader" },
    ]
  },
  optimization: {
    minimize: false
  },
  externals: {
    'hls\.js': 'Hls',
    'video\.js': {
      commonjs: 'video.js',
      commonjs2: 'video.js',
      amd: 'video.js',
      root: 'videojs'
    }
  }
};

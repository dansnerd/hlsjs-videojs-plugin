const config = {
  mode: process.env.WEBPACK_MODE || 'development',
  entry: __dirname + '/src/videojs.hlsjs',
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    publicPath: '/dist/',
    filename: 'videojs-contrib-hlsjs.min.js',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this'
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
    minimize: true
  },
  externals: {
    'video\.js': {
      commonjs: 'video.js',
      commonjs2: 'video.js',
      amd: 'video.js',
      root: 'videojs'
    }
  }
};

if (process.env.USE_EXTERNAL_HLSJS) {
  console.warn('Not bundling Hlsjs distro into the plugin - you have to make it available externally\n');
  config.externals['hls\.js'] = 'Hls';
}

module.exports = config;

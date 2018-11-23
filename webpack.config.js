
const LIB_NAME = 'HlsjsVideojsPlugin';
const DIST_DIR = 'dist';
const ENTRY_PATH = 'src/hlsjs-videojs-plugin'

function makeConfig(options = {}) {

  const libName = options.libName || LIB_NAME;

  const config = {
    mode: process.env.WEBPACK_MODE || 'development',
    entry: __dirname + '/' + ENTRY_PATH,
    devtool: 'source-map',
    output: {
      path: __dirname + '/' + DIST_DIR,
      publicPath: '/' + DIST_DIR +  '/',
      filename: libName + '.min.js',
      library: libName,
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

  if (options.useExternalHlsjs) {
    config.externals['hls\.js'] = 'Hls';
  }

  return config;
}

const multiConfigs = [
  makeConfig(),
  makeConfig({useExternalHlsjs: true, libName: LIB_NAME + 'External'})
];

module.exports = multiConfigs;


const LIB_NAME = 'HlsjsVideojsPlugin';
const DIST_DIR = 'dist';
const ENTRY_PATH = 'src/hlsjs-videojs-plugin'

const MINIMIZE = true;

function makeConfig(options = {}) {

  const libName = options.libName || LIB_NAME;
  const entryPath = options.entryPath || ENTRY_PATH;

  const config = {
    mode: process.env.WEBPACK_MODE || 'development',
    entry: __dirname + '/' + entryPath,
    devtool: 'source-map',
    output: {
      path: __dirname + '/' + DIST_DIR,
      publicPath: '/' + DIST_DIR +  '/',
      filename: libName + '.min.js',
      library: libName,
      libraryTarget: 'umd',
      libraryExport: 'default'
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
      minimize: MINIMIZE
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
    config.externals['hls\.js'] = {
      commonjs: 'hls.js',
      commonjs2: 'hls.js',
      amd: 'hls.js',
      root: 'Hls'
    }
  }

  return config;
}

const appConfig = makeConfig({libName: LIB_NAME + 'AppExample', entryPath: 'examples/app'});
appConfig.externals = {};

const multiConfigs = [
  makeConfig(),
  makeConfig({useExternalHlsjs: true, libName: LIB_NAME + 'External'}),
  appConfig
];

module.exports = multiConfigs;

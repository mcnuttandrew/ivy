const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isProd = process.env.NODE_ENV === 'production'; // eslint-disable-line
const isAnalysis = process.env.NODE_ENV === 'analysis'; // eslint-disable-line
module.exports = {
  plugins: [
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['json'],
      features: ['!gotoSymbol'],
    }),
    isAnalysis ? new BundleAnalyzerPlugin() : false,
  ].filter(d => d),
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['node_modules'],
  },

  entry: {
    app: './src/app.tsx',
    monacoConfig: './src/utils/monaco.ts',
  },
  output: {
    chunkFilename: 'chunk-[name].[contenthash].js',
    publicPath: '/dist/',
  },
  optimization: {
    concatenateModules: false,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vega: {
          test: /vega/,
          name: 'vega',
          priority: 10,
          reuseExistingChunk: true,
        },
        vegaLite: {
          test: /vega-lite/,
          name: 'vega-lite',
          priority: 20,
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vendor',
          reuseExistingChunk: true,
        },
        default: {
          name: 'default',
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {plugins: [require('autoprefixer')]},
          },
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        query: {
          presets: ['es2017'],
        },
      },
    ],
  },
  devServer: {
    stats: {
      children: false, // Hide children information
      maxModules: 0, // Set the maximum number of modules to be shown
    },
  },
  mode: isProd || isAnalysis ? 'production' : 'development',
  devtool: isProd || isAnalysis ? 'source-map' : 'cheap-module-source-map',
};

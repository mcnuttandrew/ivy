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
      {
        test: /\.md$/i,
        use: 'raw-loader',
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

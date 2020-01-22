const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  plugins: [
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['json'],
    }),
  ],
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
        test: /\.hydra$/,
        loader: 'raw-loader',
        exclude: [/node_modules/],
      },
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
        exclude: [/node_modules/, /\.hydra$/],
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
        exclude: [/node_modules/, /\.hydra$/],
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
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development', // eslint-disable-line
  devtool:
    process.env.NODE_ENV === 'production' // eslint-disable-line
      ? 'source-map'
      : 'cheap-module-source-map',
};

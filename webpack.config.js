const path = require('path');

module.exports = {
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js'],
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
        use: ['style-loader', 'css-loader'],
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
  // output: {
  //   filename: '[name]-bundle.js',
  //   path: path.join(__dirname, './'),
  // },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development', // eslint-disable-line
};

// module.exports = {
//   mode: 'production',
//
//   // Enable sourcemaps for debugging webpack's output.
//   devtool: 'source-map',
//
//   resolve: {
//     // Add '.ts' and '.tsx' as resolvable extensions.
//     extensions: ['.ts', '.tsx'],
//   },
//
//   module: {
//     rules: [
//       {
//         test: /\.ts(x?)$/,
//         exclude: /node_modules/,
//         use: [
//           {
//             loader: 'ts-loader',
//           },
//         ],
//       },
//       // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
//       {
//         enforce: 'pre',
//         test: /\.js$/,
//         loader: 'source-map-loader',
//       },
//     ],
//   },
//
//   // When importing a module whose path matches one of the following, just
//   // assume a corresponding global variable exists and use that instead.
//   // This is important because it allows us to avoid bundling all of our
//   // dependencies, which allows browsers to cache those libraries between builds.
//   externals: {
//     react: 'React',
//     'react-dom': 'ReactDOM',
//   },
//   entry: {
//      app: './src/app.tsx',
//    },
// };

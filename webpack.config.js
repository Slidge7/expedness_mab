const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = __dirname;

module.exports = {
  entry: path.join(appDirectory, 'index.web.js'),
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(appDirectory, 'web-build'),
  },
  experiments: {
    topLevelAwait: true,
  },
  resolve: {
    mainFields: ['browser', 'main', 'module'],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
    ],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-bootsplash': path.resolve(
        appDirectory,
        'src/web-stubs/react-native-bootsplash.ts',
      ),
      'react-native-vector-icons/Ionicons': path.resolve(
        appDirectory,
        'src/web-stubs/Ionicons.tsx',
      ),
      'react-native-image-picker': path.resolve(
        appDirectory,
        'src/web-stubs/react-native-image-picker.ts',
      ),
      '@react-native-async-storage/async-storage': path.resolve(
        appDirectory,
        'node_modules/@react-native-async-storage/async-storage/lib/commonjs/index.js',
      ),
      i18next: path.resolve(
        appDirectory,
        'node_modules/i18next/dist/cjs/i18next.js',
      ),
      'react-i18next': path.resolve(
        appDirectory,
        'node_modules/react-i18next/dist/commonjs/index.js',
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude:
          /node_modules\/(?!(react-native|react-native-web|@react-navigation|react-native-safe-area-context|react-native-screens|@react-native-async-storage|@react-native-picker|react-native-vector-icons|@reduxjs|react-redux|axios)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { browsers: ['last 2 versions'] },
                  modules: 'commonjs',
                },
              ],
              '@babel/preset-typescript',
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        use: { loader: 'url-loader', options: { name: '[name].[ext]' } },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(appDirectory, 'web/index.html'),
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  mode: 'development',
};

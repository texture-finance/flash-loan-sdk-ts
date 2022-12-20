const { ProvidePlugin } = require('webpack');
const path = require('node:path');

const pkg = require(path.resolve(process.cwd(), 'package.json'));
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VERSION = pkg.version;

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.ts',
  devServer: {
    static: {
      directory: path.join(process.cwd(), 'public'),
    },
    client: {
      progress: true,
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    historyApiFallback: true,
    open: {
      app: {
        name: 'google-chrome',
      },
    },
    hot: true,
    compress: true,
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  resolveLoader: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(process.cwd(), './public/index.html'),
    })
  ],
  output: {
    filename: `index.js?v=${VERSION}`,
    publicPath: "/",
    path: path.resolve(__dirname, 'build'),
  },
};

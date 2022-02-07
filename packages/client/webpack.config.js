const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../dist/public')
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use:[ 
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
          }
        ]
      },
      {
        test: /\.html$/i,
        type: "asset/resource",
      },
/*
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
*/
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'ts-loader'
      }
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          context: path.resolve(__dirname, "src"),
          from: "./*.html",
        },
      ],
    }),
  ],
  resolve: {
    // 拡張子を配列で指定
    extensions: [
      '.js', '.ts', '.tsx', '.json', '.css', '.html', 'scss', 'sass'
    ],
  },
  target: ['web', 'es5'],
};

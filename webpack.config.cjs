const path = require("path");
const webpack = require("webpack");

module.exports = {
  devtool: "source-map",
  entry: {
    login: "./src/login.js",
    script: "./src/script.js",
    altIndex: "./src/tab-src/altIndex.js",
    costVol: "./src/tab-src/costVol.js",
    dashboard: "./src/tab-src/dashboard.js",
    ebay: "./src/tab-src/ebay.js",
    product: "./src/tab-src/product.js",
    stats: "./src/tab-src/stats.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "public/js/dist"),
    publicPath: "/js/dist/",
    sourceMapFilename: "[name].bundle.js.map",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "window.$": "jquery",
    }),
  ],
};

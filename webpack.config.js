const path = require("path");

module.exports = {
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
};

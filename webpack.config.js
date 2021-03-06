const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

require("dotenv").config({
  path: path.join(
    process.cwd(),
    process.env.NODE_ENV === "development" ? ".env.development" : ".env"
  )
});

const getExtendConfig = environment => {
  const noop = config => config;
  try {
    return require(`./webpack.config.${environment}`);
  } catch (e) {
    return noop;
  }
};

module.exports = function webpackConfig() {
  const extend = getExtendConfig(process.env.NODE_ENV);
  const base = {
    mode: "production",
    entry: "./src/index",
    output: {
      path: path.join(process.cwd(), "dist"),
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [path.join(process.cwd(), "src")],
          use: ["babel-loader"]
        },
        {
          test: /reveal\.js\/plugin\/.*\.(js|html)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[path][name].[ext]"
              }
            }
          ],
          include: [path.join(process.cwd(), "node_modules")]
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: require(path.join(process.cwd(), "postcss.config"))
            }
          ]
        },
        {
          test: /\.(pug|jade)$/,
          use: [
            {
              loader: "html-loader",
              options: {
                attrs: ["img:src", "video:src"]
              }
            },
            "pug-html-loader"
          ]
        },
        {
          test: /\.(md|markdown)$/,
          use: ["html-loader", "markdown-loader"]
        },
        {
          test: /\.mdx$/,
          use: ["babel-loader", "mdx-loader"]
        },
        {
          test: /\.(jpe?g|png|gif|svg|mp4)/,
          use: ["url-loader"]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env)
      }),
      new HtmlWebpackPlugin({
        template: path.join(process.cwd(), "src/public/index.pug"),
        chunksSortMode: "dependency"
      }),
      new CopyWebpackPlugin([
        {
          from: path.resolve("node_modules/reveal.js/plugin/**/*"),
          to: path.resolve("dist")
        }
      ])
    ],
    resolve: {
      alias: {
        resources: path.join(process.cwd(), "resources")
      }
    }
  };

  return extend(base);
};

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

class VersionStaticAssetsPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('VersionStaticAssetsPlugin', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap('VersionStaticAssetsPlugin', data => {
        const version = compilation.hash;
        data.html = data.html.replace(/__APP_BUILD_VERSION__/g, version);
        data.html = data.html.replace(
          /((?:href|src)="(?!(?:https?:|\/\/|data:|#))([^"?]+?\.(?:css|js|png|svg|ico|webmanifest)))(?:\?[^"]*)?"/g,
          `$1?v=${version}"`
        );
        return data;
      });
    });
  }
}

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'css', to: 'css' },
        { from: 'js/core', to: 'js/core' },
        { from: 'js/data', to: 'js/data' },
        { from: 'js/renderers', to: 'js/renderers' },
        { from: 'js/services', to: 'js/services' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'icon.png', to: 'icon.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
    new VersionStaticAssetsPlugin(),
  ],
});

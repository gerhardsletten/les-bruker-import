const {injectBabelPlugin} = require('react-app-rewired');
const rewirePreact = require('react-app-rewire-preact');
const rewireStyledComponents = require('react-app-rewire-styled-components');

/* config-overrides.js */
module.exports = function override(config, env) {
  // add a plugin
  config = rewireStyledComponents(config, env)
  config = injectBabelPlugin('react-hot-loader/babel',config)
  if (env === "production") {
    console.log("⚡ Production build with Preact");
    config = rewirePreact(config, env);
  }
  if (process.env.ANALYZE) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: 8888,
        openAnalyzer: true
      })
    )
  }
  return config;
}
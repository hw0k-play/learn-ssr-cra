const webpack = require("webpack");
const { merge } = require("webpack-merge");
const webpackNodeExternals = require("webpack-node-externals");

const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');

const paths = require("./paths");
const getClientEnvironment = require('./env');

const commonConfig = require("./webpack.config");

module.exports = webpackEnv => merge(commonConfig(webpackEnv), (() => {
  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

  return {
    mode: 'production',
    entry: paths.ssrIndexJs,
    target: 'node',
    output: {
      path: paths.ssrBuild,
      filename: 'server.js',
      chunkFilename: 'js/[name].chunk.js',
      publicPath: paths.publicUrlOrPath,
    },
    resolve: {
      modules: ['node_modules'],
    },
    externals: [webpackNodeExternals()],
    plugins: [
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),
    ].filter(Boolean),
  };
})());

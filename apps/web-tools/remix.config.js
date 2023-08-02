const edgeDeployConfig =
  process.env.NODE_ENV === 'production'
    ? {
        server: './server.js',
        serverBuildPath: '.netlify/edge-functions/server.js',
        serverConditions: ['deno', 'worker'],
        serverDependenciesToBundle: 'all',
        serverModuleFormat: 'esm',
        serverPlatform: 'neutral',
      }
    : {};

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'cjs',
  serverNodeBuiltinsPolyfill: {
    modules: {},
  },
  watchPaths: () => require('@nx/remix').createWatchPaths(__dirname),
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  ...edgeDeployConfig,
};

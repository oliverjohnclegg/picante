const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const tslibCjsPath = path.join(projectRoot, 'node_modules', 'tslib', 'tslib.js');

const config = getDefaultConfig(projectRoot);

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform, ...rest) => {
  if (moduleName === 'tslib' && fs.existsSync(tslibCjsPath)) {
    return { type: 'sourceFile', filePath: tslibCjsPath };
  }
  if (typeof upstreamResolveRequest === 'function') {
    return upstreamResolveRequest(context, moduleName, platform, ...rest);
  }
  return context.resolveRequest(context, moduleName, platform, ...rest);
};

module.exports = config;

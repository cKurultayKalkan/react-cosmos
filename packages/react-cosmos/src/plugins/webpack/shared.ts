import importFrom from 'import-from';
// TODO: Test if a webpack import (require) is kept in the compiled file
import webpack from 'webpack';

// TODO
// type WebpackCosmosConfig = {
//   hotReload: boolean
// }

export function getWebpack(rootDir: string) {
  const userWebpack = importFrom.silent<typeof webpack>(rootDir, 'webpack');
  if (!userWebpack) {
    console.warn('[Cosmos] webpack dependency missing!');
    console.log('Install using "yarn add webpack" or "npm install webpack"');
    return;
  }

  return userWebpack;
}
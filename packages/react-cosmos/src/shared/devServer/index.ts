import http from 'http';
import express from 'express';
import { CosmosConfig, getCosmosConfig } from '../config';
import { createHttpServer } from './httpServer';
import { createApp } from './app';
// IDEA: Maybe replace react-dev-utils with https://github.com/yyx990803/launch-editor
// import launchEditor from 'react-dev-utils/launchEditor';

type PluginCleanupCallback = () => unknown;

export type DevServerPluginArgs = {
  cosmosConfig: CosmosConfig;
  httpServer: http.Server;
  expressApp: express.Express;
};

export type DevServerPlugin = (
  args: DevServerPluginArgs
) => void | null | PluginCleanupCallback;

export async function startDevServer(plugins: DevServerPlugin[] = []) {
  // TODO: Bring back config generation
  // if (!hasUserCosmosConfig()) {
  //   const generatedConfigFor = generateCosmosConfig();
  //   if (generatedConfigFor) {
  //     console.log(`[Cosmos] Nice! You're using ${generatedConfigFor}`);
  //     console.log('[Cosmos] Generated a tailored config file for your setup');
  //   }
  // }
  const cosmosConfig = getCosmosConfig();

  const app = createApp(cosmosConfig);
  const httpServer = createHttpServer(cosmosConfig, app);

  // if (cosmos.publicPath) {
  //   serveStaticDir(app, cosmosConfig.publicUrl, cosmos.publicPath);
  // }

  await httpServer.start();

  const pluginCleanupCallbacks: PluginCleanupCallback[] = [];
  // TODO: await on each plugin?
  plugins.forEach(plugin => {
    const pluginReturn = plugin({
      cosmosConfig,
      httpServer: httpServer.server,
      expressApp: app
    });
    if (typeof pluginReturn === 'function') {
      pluginCleanupCallbacks.push(pluginReturn);
    }
  });

  // attachStackFrameEditorLauncher(app);

  // const closeSockets = attachSockets(server);

  return async () => {
    pluginCleanupCallbacks.forEach(cleanup => cleanup());
    // closeSockets();
    await httpServer.stop();
  };
}

// TODO: Make plugin
// export function attachStackFrameEditorLauncher(app: express.Application) {
//   app.get(
//     '/__open-stack-frame-in-editor',
//     (req: express.Request, res: express.Response) => {
//       const lineNumber = parseInt(req.query.lineNumber, 10) || 1;
//       const colNumber = parseInt(req.query.colNumber, 10) || 1;
//       launchEditor(req.query.fileName, lineNumber, colNumber);
//       res.end();
//     }
//   );
// }
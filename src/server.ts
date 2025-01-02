import Hapi from '@hapi/hapi';
import { routes } from './routes/routes';
import { registerPluginsFromDirectory } from './plugins/loader/main';
import Config from './config/config';

const init = async () => {
  const server = Hapi.server({
    port: Config.server.port,
    host: Config.server.host,
  });

  registerPluginsFromDirectory(Config.plugins.directory, server);
  server.route(routes);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

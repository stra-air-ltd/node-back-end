import Hapi from '@hapi/hapi';
import routes from './routes';
import plugins from './plugins';
import config from './config';
const init = async () => {
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
  });

  await server.register(plugins);
  server.route(routes);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

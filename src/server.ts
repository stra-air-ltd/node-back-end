import Hapi from '@hapi/hapi';
import { routes } from './routes/routes';
import LoaderPluginAll from './loader/main';  
import * as dotenv from 'dotenv';

dotenv.config();
const init = async () => {
  
  const server = Hapi.server({
    port: process.env.SERVER_PORT,
    host: process.env.SERVER_HOST,
  });

  server.route(routes);
  await LoaderPluginAll(server)
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

import { Server } from '@hapi/hapi';
import { init } from '../server';
import { routes } from '../routes/routes';
import LoaderPluginAll from '../loader/main';

describe('Server Tests', () => {
    let server: Server;
  
    beforeEach(async () => {
      server = new Server({
        port: process.env.SERVER_PORT || 7000,
        host: process.env.SERVER_HOST || '0.0.0.0',
      });
      server.route(routes(server));
      await LoaderPluginAll(server);
    });
  
    test('健康检查接口', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      });
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({ status: 'ok' });
    });
  });
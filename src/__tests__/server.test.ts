import { Server } from '@hapi/hapi';
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

    afterEach(async () => {
        await server.stop();
        // 清理所有定时器
        jest.clearAllTimers();
    });

    afterAll(async () => {
        // 等待所有异步操作完成
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    test('健康检查接口', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/health'
        });
        expect(response.statusCode).toBe(200);
    });
});
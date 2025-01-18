import { Server } from '@hapi/hapi';
import { routes } from '../../routes/routes';
import LoaderPluginAll from '../../loader/main';

describe('Server Tests', () => {
    let server: Server;

    beforeEach(async () => {
        server = new Server({
            port: process.env.SERVER_PORT,
            host: process.env.SERVER_HOST,
        });

        server.route(routes(server));
        await LoaderPluginAll(server);
    });

    afterEach(async () => {
        if (server) {
            await server.stop();
        }
        jest.resetModules();
    });

    // ...existing beforeEach, afterEach, afterAll code...

    test('首页接口', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/'
        });
        expect(response.statusCode).toBe(200);
        expect(response.result).toHaveProperty('message');
        expect(response.result).toHaveProperty('code', 200);
        expect(response.result).toHaveProperty('data.time');
    });

    test('随机图片接口', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/randomImage?requestType=json'
        });
        expect(response.statusCode).toBe(200);
    });

    describe('用户登录接口', () => {
        test('使用账号密码登录', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/user/login',
                payload: {
                    loginWay: 'password',
                    userInput: 'testUser',
                    userPassword: 'testPass'
                }
            });
            expect(response.statusCode).toBe(500);
        });

        test('使用无效登录方式', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/user/login',
                payload: {
                    loginWay: 'null',
                    userInput: 'testUser',
                    userPassword: 'testPass'
                }
            });
            expect(response.statusCode).toBe(401);
        });
    });

    describe('用户令牌验证接口', () => {
        test('验证有效令牌', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/user/token/verify',
                payload: {
                    userId: '0',
                    userToken: 'validToken'
                }
            });
            expect(response.statusCode).toBe(500);
        });

        test('验证无效令牌', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/user/token/verify',
                payload: {
                    userId: '114514',
                    userToken: 'invalidToken'
                }
            });
            expect(response.statusCode).toBe(500);
        });
    });

    test('健康检查接口', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/health'
        });
        expect(response.statusCode).toBe(200);
        expect(response.result).toEqual({ status: 'ok' });
    });
});
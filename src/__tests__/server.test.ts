import { Server } from '@hapi/hapi';
import { init } from '../server';
import { routes } from '../routes/routes';
import LoaderPluginAll from '../loader/main';

describe('Server', () => {
    let server: Server;

    beforeEach(async () => {
        // 保存原始环境变量
        process.env.NODE_ENV = 'test';
        process.env.SERVER_PORT = '7000';
        process.env.SERVER_HOST = '0.0.0.0';
    });

    afterEach(async () => {
        if (server) {
            await server.stop();
        }
    });

    test('服务器应该正确初始化', async () => {
        server = await init();
        expect(server).toBeDefined();
        expect(server.info.port).toBe(7000);
        expect(server.info.host).toBe('0.0.0.0');
    });

    test('服务器应该使用环境变量配置', async () => {
        process.env.SERVER_PORT = '8000';
        process.env.SERVER_HOST = 'localhost';
        
        server = await init();
        expect(server.info.port).toBe(8000);
        expect(server.info.host).toBe('localhost');
    });

    test('服务器应该加载所有路由', async () => {
        server = await init();
        const table = server.table();
        
        // 验证基本路由是否存在
        expect(table.find(route => route.path === '/')).toBeDefined();
        expect(table.find(route => route.path === '/health')).toBeDefined();
        expect(table.find(route => route.path === '/randomImage')).toBeDefined();
    });

    test('服务器应该能启动和停止', async () => {
        server = await init();
        await server.start();
        expect(server.info.started).not.toBe(0);
        
        await server.stop();
        expect(server.info.started).toBe(0);
    });

    test('服务器应该处理插件加载错误', async () => {
        jest.mock('../loader/main', () => ({
            __esModule: true,
            default: jest.fn().mockRejectedValue(new Error('插件加载失败'))
        }));

        // Clear module cache to ensure mock is used
        jest.resetModules();
        const { init } = require('../server');

        await expect(init()).rejects.toThrow('插件加载失败');
    });

    test('服务器应该在无环境变量时使用默认值', async () => {
        delete process.env.SERVER_PORT;
        delete process.env.SERVER_HOST;

        server = await init();
        expect(server.info.port).toBe(7000);  // 默认端口
        expect(server.info.host).toBe('0.0.0.0');  // 默认主机
    });
});
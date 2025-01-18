import { server, Server } from '@hapi/hapi';
import { routes } from './routes/routes';
import LoaderPluginAll from './loader/main';

export async function init(): Promise<Server> {
    const server = new Server({
        port: process.env.SERVER_PORT || 7000,
        host: process.env.SERVER_HOST || '0.0.0.0',
    });

    try {
        server.route(routes(server));
        await LoaderPluginAll(server);
        await server.initialize();
        return server;
    } catch (error) {
        console.error('服务器初始化失败:', error);
        throw error;
    }
}

export async function start(): Promise<void> {
    try {
        const server = await init();
        await server.start();
        console.log(`服务器运行在: ${server.info.uri}`);
    } catch (error) {
        console.error('服务器启动失败:', error);
        throw error;
    }
}

process.on('unhandledRejection', (err) => {
    console.error('未处理的异步错误:', err);
    process.exit(1);
});

start();
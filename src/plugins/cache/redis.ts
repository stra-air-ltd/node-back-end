import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import Redis from 'ioredis';

const redisPlugin: Hapi.Plugin<undefined> = {
    name: 'redisPlugin',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        dotenv.config();
        let redisLoaderNumber = 0;
        let redisConnect: Redis;
        if (process.env.REDIS_ENABLE == "false") {
            console.log('redis没有启用，我们不确定这是不是有意的')
            console.log('如果您想启用Redis请检查 .env 文件的 REDIS_ENABLE 字段是否为 true');
        }
        async function createRedisConnect() {
            return new Redis({
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT as string),
                password: process.env.REDIS_PASSWORD,
            });
        }
        server.method('redisQuery', async (queryStatement: string) => {
            if (process.env.REDIS_ENABLE == "false") {
                return {
                    code: 200,
                    message: 'Redis没有启用, 如果您想启用Redis请检查 .env 文件的 REDIS_ENABLE 字段是否为 true',
                    data: null
                };
            }

            try {
                if (redisLoaderNumber == 0) {
                    redisLoaderNumber++;
                    redisConnect = await createRedisConnect();
                }
                const result = await redisConnect.get(queryStatement);
                return {
                    code: 200,
                    message: '成功',
                    data: result
                };
            } catch (error) {
                return {
                    code: 500,
                    message: 'Redis出现错误，消息' + error,
                    data: null
                };
            }
        });
    }
};
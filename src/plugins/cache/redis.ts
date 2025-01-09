/**
 * Redis插件 - 提供Redis缓存服务
 * 该插件为系统提供Redis缓存功能，包括连接管理和查询操作
 * 
 * 使用示例:
 * 1. 获取数据:
 *    const result = await server.methods.redisQuery("GET key");
 *    if (result.code === 200) {
 *        console.log('获取的值:', result.data);
 *    }
 * 
 * 2. 设置数据:
 *    await server.methods.redisQuery("SET key value");
 * 
 * 3. 设置带过期时间的数据:
 *    await server.methods.redisQuery("SET key value");
 *    await server.methods.redisQuery("EXPIRE key 3600"); // 过期时间3600秒
 * 
 * 4. 删除数据:
 *    await server.methods.redisQuery("DEL key");
 * 
 * 返回值格式:
 * {
 *    code: number,      // 200-成功, 400-未启用, 500-错误
 *    message: string,   // 状态说明
 *    data: string|null  // 查询结果
 * }
 */
import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';

dotenv.config();

const redisPlugin: Hapi.Plugin<undefined> = {
    name: 'redisPlugin',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        // Redis客户端实例
        let redisClient: RedisClientType | null = null;

        if (process.env.REDIS_ENABLE === "true") {
            // 创建Redis客户端连接
            redisClient = createClient({
                url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
                password: process.env.REDIS_PASSWORD,
            });

            // 建立Redis连接
            try {
                await redisClient.connect();
                console.log('Redis client connected');
            } catch (err) {
                console.error('Redis connection error:', err);
            }

            // 注册Redis错误事件监听器
            redisClient.on('error', (err) => {
                console.error('Redis error:', err);
            });
        } else {
            console.log('redis没有启用，我们不确定这是不是有意的');
            console.log('如果您想启用Redis请检查 .env 文件的 REDIS_ENABLE 字段是否为 true');
        }

        /**
         * Redis查询方法
         * @param queryStatement - Redis查询语句
         * @returns {Promise<Object>} 返回查询结果对象
         * - code: 状态码 (200-成功, 400-未启用, 500-错误)
         * - message: 状态信息
         * - data: 查询结果数据
         */
        server.method('redisQuery', async (queryStatement: string) => {
            if (process.env.REDIS_ENABLE === "false" || !redisClient) {
                console.log('[Redis] 未启用Redis服务');
                return {
                    code: 400,
                    message: 'Redis没有启用, 如果您想启用Redis请检查 .env 文件的 REDIS_ENABLE 字段是否为 true',
                    data: null,
                };
            }

            try {
                console.log(`[Redis] 执行查询: ${queryStatement}`);
                const result = await redisClient.get(queryStatement);
                console.log(`[Redis] 查询结果: ${result}`);
                return {
                    code: 200,
                    message: '查询成功',
                    data: result,
                };
            } catch (err) {
                console.error('[Redis] 查询错误:', err);
                return {
                    code: 500,
                    message: '查询失败',
                    data: err instanceof Error ? err.message : '未知错误',
                };
            }
        });
    }
};

export default redisPlugin;
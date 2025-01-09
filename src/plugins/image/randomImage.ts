/**
 * 随机图片插件
 * 提供随机图片获取功能，支持JSON返回和重定向两种方式
 * 使用Redis缓存优化性能
 */
import Hapi from '@hapi/hapi';

const randomImagePlugin: Hapi.Plugin<undefined> = {
    name: 'randomImagePlugin',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        
        /**
         * 获取图片数据库中的最大ID
         * 优先从Redis缓存获取，缓存未命中则查询数据库
         * @returns {Promise<number>} 返回最大ID值
         */
        async function getMaxId(): Promise<number> {
            try {
                // 尝试从 Redis 获取 maxId
                console.log('[RandomImage] 尝试从Redis获取maxId');
                const redisResult = await server.methods.redisQuery("maxId");
                
                if (redisResult.code === 200 && redisResult.data !== null) {
                    console.log('[RandomImage] Redis缓存命中, maxId =', redisResult.data);
                    return parseInt(redisResult.data);
                }

                console.log('[RandomImage] Redis缓存未命中，从数据库查询');
                // Redis 未命中或出错，从数据库查询
                const maxIdQueryResult = await server.methods.databaseQuery('SELECT MAX(id) as maxId FROM random_image');
                const maxId = maxIdQueryResult[0][0].maxId;

                // 存入 Redis 并设置过期时间
                if (redisResult.code === 400) {
                    console.log('[RandomImage] 将新的maxId存入Redis:', maxId);
                    await server.methods.redisQuery(`SET maxId ${maxId}`);
                    await server.methods.redisQuery(`EXPIRE maxId 10`);
                }

                return maxId;
            } catch (error) {
                console.error('[RandomImage] 获取maxId失败:', error);
                throw error;
            }
        }

        /**
         * 生成指定范围内的随机整数
         * @param min - 最小值（包含）
         * @param max - 最大值（包含）
         * @returns {number} 返回随机整数
         */
        function getRandomInt(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        /**
         * 随机图片处理函数
         * @param requestType - 请求类型：'json' 或 'redirect'
         * @param h - Hapi响应工具包
         * @returns {Promise<Object|ResponseObject>} 返回JSON数据或重定向响应
         */
        async function randomImage(requestType: string, h: Hapi.ResponseToolkit) {
            try {
                const max = await getMaxId();
                const randomId = getRandomInt(0, max);
                const sqlRequest = await server.methods.databaseQuery(`SELECT src FROM random_image WHERE id = ${randomId}`);
                const requestURL = sqlRequest[0][0].src;

                switch (requestType) {
                    case 'json':
                        return {
                            message: 'ok',
                            code: 200,
                            data: { url: requestURL }
                        };
                    case 'redirect':
                        return h.redirect(requestURL).code(302);
                    default:
                        return {
                            message: 'requestType参数存在问题,应为 json 或 redirect',
                            code: 400,
                            data: null
                        };
                }
            } catch (error) {
                return {
                    message: '服务器内部错误',
                    code: 500,
                    data: null
                };
            }
        }

        // 注册路由
        server.route({
            method: 'GET',
            path: '/randomImage',
            handler: (request, h) => {
                return randomImage(request.query.requestType, h);
            }
        });
    }
};

export default randomImagePlugin;
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
         * user: <pysio>team@pysio.online & <maomao>official@nerv.games
         * 获取图片数据库中的最大ID
         * 优先从Redis缓存获取，缓存未命中则查询数据库
         * @returns {Promise<number>} 返回最大ID值
         */
        async function getMaxId(): Promise<number> {
            try {
                const redisResult = await server.methods.redisQuery("GET maxId");
                
                // 优先使用缓存的maxId
                if (redisResult.code === 200 && redisResult.data !== null) {
                    const maxId = parseInt(redisResult.data);
                    return maxId;
                }

                // 缓存未命中，查询数据库并长期缓存
                const maxIdQueryResult = await server.methods.databaseQuery('SELECT MAX(id) as maxId FROM random_image');
                
                if (!maxIdQueryResult?.[0]?.[0]?.maxId) {
                    throw new Error('数据库查询结果无效');
                }
                
                const maxId = maxIdQueryResult[0][0].maxId;

	                // 设置较长的缓存时间（24小时）
                if (redisResult.code === 200) {
                    await server.methods.redisQuery(`SETEX maxId 10 "${maxId}"`);
                }

                return maxId;
            } catch (error: any) {
                console.log(['error', 'cache'], `[RandomImage] 获取maxId失败: ${error?.message || '未知错误'}`);
                throw error;
            }
        }

        /**
         * user: <maomao>official@nerv.games
         * 获取图片
         * @param id: number 图片id
         * @returns  {Promise<string>} 返回最大ID值
         */

        async function getRandomImageUrl(id: number): Promise<string> {
            try {
                const cacheKey = `random_image_${id}`;
                
                // 尝试从缓存获取
                const redisResult = await server.methods.redisQuery(`GET ${cacheKey}`);
                
                if (redisResult.code === 200 && redisResult.data !== null) {
                    return redisResult.data;
                }

                // 缓存未命中，查询数据库
                const IdQueryResult = await server.methods.databaseQuery(`SELECT src FROM random_image WHERE id = ${id}`);
                
                if (!IdQueryResult?.[0]?.[0]?.src) {
                    throw new Error(`未找到ID ${id} 对应的图片`);
                }

                const url = IdQueryResult[0][0].src;

	                // 永久缓存URL（除非手动清除）
                if (redisResult.code === 200 && url) {
                    await server.methods.redisQuery(`SET ${cacheKey} "${url}"`);
                    await server.methods.redisQuery(`SETEX ${cacheKey} 3600`)
                }

                return url;
            } catch (error: any) {
                console.log(['error', 'cache'], `[RandomImage] 获取图片URL失败, id: ${id}: ${error?.message || '未知错误'}`);
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
                const requestURL = await getRandomImageUrl(randomId);

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
            } catch (error: any) {
                console.log(['error', 'request'], `[RandomImage] 处理请求失败: ${error?.message || '未知错误'}`);
                return {
                    message: '服务器内部错误',
                    code: 500,
                    data: null,
                    error: error?.message || '未知错误'
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
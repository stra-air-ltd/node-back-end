import Hapi from '@hapi/hapi';
import crypto from 'crypto';
import Redis from 'ioredis';
import { DatabaseError } from 'pg';

/**
 * Hapi 插件，用于管理用户令牌的分发、更新、注销和验证。
 * @plugin userTokenDistribute
 * @version 1.0.0
 */
const userTokenDistribute: Hapi.Plugin<undefined> = {
    name: 'userTokenDistribute',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {

        interface request {
            code: number,
            message: string,
            data: any
        };

        let request: request;
        /**
         * 创建用户令牌
         * 
         * @param {number} id - 用户ID
         * @returns {Promise<{code: number, message: string, data: {token: string}}>} 包含令牌信息的响应对象
         * 
         * 该函数生成一个随机字符串，并使用SHA-256算法对其进行哈希处理，然后将哈希值存储在Redis和数据库中。
         * Redis中的令牌设置为7天后过期。最后返回包含令牌的响应对象。
         */
        async function createUserToken (id: number) {
            const randomString = crypto.randomBytes(512).toString('hex').slice(0, length);
            const tokenHash256 = crypto.createHash('sha256').update(randomString).digest('hex');
            
            await server.methods.redisQuery(`SET user_${id}_token ${tokenHash256}`);
            server.methods.databaseQuery(`INSERT INTO 'users_token' ('id', 'token', 'enable_status') VALUES ('${id}', '${tokenHash256}', 'true'`);
            server.methods.redisQuery(`EXPIREAT user_${id}_token 604800`);

            return {
                code: 200,
                message: "ok",
                data: {
                    token: tokenHash256,
                }
            };
        }

        /**
         * 获取用户的token。
         *
         * 此函数首先尝试从Redis缓存中获取用户的token。如果缓存中存在有效的token，则直接返回该token。
         * 如果缓存中没有找到有效的token，则从数据库中查询用户的token及其启用状态。
         * 如果数据库中存在有效的token且启用状态为true，则返回该token。
         * 否则，返回404错误，表示用户的token已注销或用户不存在。
         *
         * @param {number} id - 用户的ID。
         * @returns {Promise<{code: number, message: string, data: {token?: string} | null}>} 包含状态码、消息和token数据的Promise对象。
         */
        async function obtainUserToken (id:number) {
            const redisResult = await server.methods.redisQuery(`GET user_${id}_token`);
            
            if (redisResult.data !== null && redisResult.code == 200) {
                request = {
                    code: 200,
                    message: '获取token成功',
                    data: {
                        token: redisResult.data
                    }
                };
                return request;
            }

            const databaseResult = await server.methods.databaseQuery(`SELECT token, enable_status FROM users_token WHERE id = ${id}`);

            if (databaseResult[0][0].enable_status === 'true' && databaseResult[0][0].token !== null) {
                request = {
                    code: 200,
                    message: '获取token成功',
                    data: {
                        token: databaseResult[0][0].token
                    }
                };
                return request;
            } else {
                request = {
                    code: 404,
                    message: '您请求的user的token已经注销或者user不存在',
                    data: null
                }
                return request;
            }
        }
        
        /**
         * 更新用户令牌
         * 
         * @param {number} id - 用户的唯一标识符
         * @returns {Promise<{code: number, message: string, data: {token: string}}>} 包含状态码、消息和新生成的令牌数据的 Promise 对象
         * 
         * @description
         * 该异步函数用于更新指定用户的令牌。首先生成一个随机字符串，并将其转换为 SHA-256 哈希值。
         * 然后将该哈希值存储在 Redis 中，并设置过期时间为 604800 秒（7 天）。
         * 最后，将新令牌更新到数据库中，并返回包含状态码、消息和新令牌数据的对象。
         */
        async function updateUserToken (id: number) {
            const randomString = crypto.randomBytes(512).toString('hex').slice(0, length);
            const tokenHash256 = crypto.createHash('sha256').update(randomString).digest('hex');
            await server.methods.redisQuery(`SET user_${id}_token ${tokenHash256}`);
            server.methods.redisQuery(`EXPIREAT user_${id}_token 604800`);
            server.methods.databaseQuery(`UPDATE SET 'id' = '${id}','token'='${tokenHash256}', 'enable_status'='true' WHERE id = ${id}`);

            return {
                code: 200,
                message: "ok",
                data: {
                    token: tokenHash256,
                }
            };
        }

        /**
         * 注销用户的token。
         *
         * @param {number} id - 用户的ID。
         * @param {string} token - 用户的token。
         * @returns {Promise<{code: number, message: string}>} 返回一个包含状态码和消息的请求对象。
         *
         * @remarks
         * 该函数首先从Redis中获取用户的token，如果token匹配，则将其设置为过期并更新数据库中的状态。
         * 如果Redis中的token不匹配，则从数据库中获取用户的token和状态，并根据匹配结果更新状态或返回错误消息。
         */
        async function logoutUserToken (id: number, token: string) {
            const redisResult = await server.methods.redisQuery(`GET user_${id}_token`)

            if (redisResult.data === token) {
                server.methods.redisQuery(`EXPIREAT user_${id}_token 1`);
                server.methods.databaseQuery(`UPDATE SET 'enable_status'='false' WHERE id = ${id}`);
                request = {
                    code: 200,
                    message: "token已注销，您已退出登录",
                    data: null
                }
                return request;
            }

            const databaseResult = await server.methods.databaseQuery(`SELECT token, enable_status FROM users_token WHERE id = ${id}`);
            
            if (databaseResult[0][0].enable_status === 'true' && databaseResult[0][0].token === token) {
                server.methods.databaseQuery(`UPDATE SET 'enable_status'='false' WHERE id = ${id}`);
                request = {
                    code: 200,
                    message: "token已注销，您已退出登录",
                    data: null
                }
            } else {
                request = {
                    code: 401,
                    message: "您的token存在问题",
                    data: null
                }
            }
        }

        /**
         * 验证用户的令牌是否有效。
         *
         * @param {number} id - 用户的ID。
         * @param {string} token - 用户的令牌。
         * @returns {Promise<{code: number, message: string}>} 返回一个包含状态码和消息的请求对象。
         *
         * @example
         * const result = await verifyUserToken(123, 'some-token');
         * console.log(result); // { code: 200, message: "登陆正常" }
         *
         * @description
         * 该函数首先从Redis中查询用户的令牌，如果Redis中的令牌与传入的令牌匹配，则返回一个状态码为200的请求对象。
         * 如果Redis中的令牌不匹配，则从数据库中查询用户的令牌和启用状态。
         * 如果数据库中的令牌与传入的令牌匹配且启用状态为true，则返回一个状态码为200的请求对象，并将令牌存储到Redis中。
         * 否则，返回一个状态码为401的请求对象，表示登录过期或令牌存在问题。
         */
        async function verifyUserToken (id: number, token: string) {
            let request: request;
            const redisResult = await server.methods.redisQuery(`GET user_${id}_token`);
            
            if (redisResult.data === token) {
                request = {
                    code: 200,
                    message: "登陆正常",
                    data: null
                }
                return request;
            }

            const databaseResult = server.methods.databaseQuery(`SELECT token, enable_status FROM users_token WHERE id = ${id}`);

            if (databaseResult[0][0].token === token && databaseResult[0][0].enable_status === true) {
                request = {
                    code: 200,
                    message: "登陆正常",
                    data: null
                }
                await server.methods.redisQuery(`SET user_${id}_token ${databaseResult[0][0].token}`);
            } else {
                request = {
                    code: 401,
                    message: "您的登陆过期或token存在问题",
                    data: null
                }
            }

            return request;
        }

        server.method('obtainUserToken', async (userId: number) => {
            return await obtainUserToken(userId);
        });
        
        server.method('createUserToken', async (userId: number) => {
            return await createUserToken(userId);
        });

        server.method('updateUserToken', async (userId: number) => {
            return await updateUserToken(userId);
        });

        server.method('verifyUserToken', async (userId: number, UserToken: string) => {
            return await verifyUserToken(userId, UserToken);
        });

        server.method('logoutUserToken', async (UserId: number, UserToken: string) => {
            return await logoutUserToken(UserId, UserToken)
        });
    },
};

export default userTokenDistribute;
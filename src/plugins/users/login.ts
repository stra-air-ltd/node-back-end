/**
 * 用户登陆插件
 * 提供用户登陆功能，JSON返回
 * 使用Redis缓存优化性能
 */

import Hapi from '@hapi/hapi';
import crypto from 'crypto';

const userLoginPlugin: Hapi.Plugin<undefined> = {
    name: 'userLoginPlugin',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {

        /**
         * 根据提供的类型和用户输入检索用户ID。
         * 
         * @param {string} type - 用户输入的类型，可以是 'userName' 或 'userMail'。
         * @param {string} userInput - 要查询的用户输入值。
         * @returns {Promise<number>} - 与提供的输入相关联的用户ID。
         * 
         * @throws {Error} - 如果类型不是 'userName' 或 'userMail'，则抛出错误。
         * 
         * @author maomao
         * @contact official@nerv.games
         * @lastModified 2025/1/14 GMT+8 22:59
         */
        async function getUserId(type: string, userInput: string) {
            switch (type) {
                case 'userName':
                    const userNameRedisResult = await server.methods.redisQuery(`GET user_name_${userInput}`);
                    
                    if (userNameRedisResult.data !== null) {
                        return userNameRedisResult.data;
                    }

                    const userNameDatabaseResult = await server.methods.databaseQuery(`SELECT id FORM users WHERE user_name = ${userInput}`);

                    if (userNameDatabaseResult[0][0].id !== null && userNameRedisResult.code === 200) {
                        await server.methods.redisQuery(`SET user_name_${userInput} ${userNameDatabaseResult[0][0].id}`);
                        await server.methods.redisQuery(`SETEX user_name_${userInput} 3600`);
                    }
                    
                    return userNameDatabaseResult[0][0].id as number;

                case 'userMail':
                    const userMailRedisResult = await server.methods.redisQuery(`GET user_mail_${userInput}`);

                    if (userMailRedisResult.data !== null) {
                        return userMailRedisResult.data;
                    }

                    const userMailDatabaseResult = await server.methods.databaseQuery(`SELECT id FORM users WHERE user_mail = ${userInput}`);

                    if (userMailDatabaseResult[0][0].id !== null && userMailRedisResult.code === 200) {
                        await server.methods.redisQuery(`SET user_name_${userInput} ${userMailDatabaseResult[0][0].id}`);
                        await server.methods.redisQuery(`SETEX user_name_${userInput} 3600`);
                    }
                    
                    return userMailDatabaseResult[0][0].id as number;
                
                default:
                    break;
            }
        }

        /**
         * 测试输入的用户id与密码能否登陆
         * @param userid
         * @param userPassword 
         * @returns boolean 
         */
        async function userLoginWayPssswordOrId(userId: string, userPassword: string): Promise<boolean> {
            try {
                const userPasswordHash256 = await stringSha256Count(userPassword);
                const redisResult = await server.methods.redisQuery(`GET user_id_password_${userId}`);

                if (redisResult.code === 200 && redisResult.data !== null) {
                    return userPasswordHash256 === redisResult.data;
                }

                const databaseUserResult = await server.methods.databaseQuery(`SELECT user_id FORM users WHERE user_id = ${userId}`);

                if (databaseUserResult[0][0].user_id === null) {
                    return false;
                }

                const databaseResult = await server.methods.databaseQuery(`SELECT user_password FROM users WHERE user_id = ${userId}`);

                if (redisResult.code === 200 && userPasswordHash256 === databaseResult[0][0].user_password) {
                    await server.methods.redisQuery(`SET user_id_password_${userId} ${userPasswordHash256}`)
                    await server.methods.redisQuery(`SETEX user_id_password_${userId} 3600`)
                    return true;
                }

                return false;
            } catch (error) {
                console.error('[userLogin] 出现错误,信息为', error);
                throw error;
            }
        }
        /**
         * 计算输入的字符串为sha256并返回
         * @param inputString 要计算为sha256的字符串
         * @returns 返回字符串HASH256计算结果
         */
        async function stringSha256Count(inputString: string): Promise<string> {
            return crypto.createHash('sha256').update(inputString).digest('hex');
        }

        /**
         * 测试输入的用户名与密码能否登陆
         * @param userName 
         * @param userPassword 
         * @returns boolean 
         */
        async function userLoginWayPssswordOrUserName(userName: string, userPassword: string): Promise<boolean> {
            try {
                const userId = await getUserId('userName', userName)
                return userLoginWayPssswordOrId(userId, userPassword);
            } catch(error) {
                console.error('[userLogin] 登陆方式username, password。错误信息:', error);
                throw error;
            }
        }

        /**
         * 测试输入的邮箱与密码能否登陆
         * @param userMail
         * @param userPassword 
         * @returns boolean 
         */
        async function userLoginWayPssswordOrMail(userMail: string, userPassword: string): Promise<boolean> {
            try {
                const userId = await getUserId('userMail', userMail)
                return userLoginWayPssswordOrId(userId, userPassword);
            } catch(error) {
                console.error('[userLogin] 出现错误,信息为', error);
                throw error;
            }
        }


        
        /**
         * 处理传入的登陆类型
         * @param requestUserLoginWay 
         */
        server.method('loginResult', async (requestUserLoginWay: string, requestUserInput: string, requestUserPassword: string) => {
            interface request {
                code: number,
                message: string,
                data: any,
            };
            let request: request;
            switch (requestUserLoginWay) {
                case 'userNameOrPassword':
                    if (await userLoginWayPssswordOrUserName(requestUserInput, requestUserPassword)) {
                        request = {
                            code: 200,
                            message: '登陆成功',
                            data: {
                                token: await server.methods.obtainUserToken(getUserId('userName', requestUserInput)),
                            }
                        };
                    } else {
                        request = {
                            code: 401,
                            message: '此用户不存在或密码错误',
                            data: null
                        };
                    }
                    break;
                case 'userMailOrPassword':
                    if (await userLoginWayPssswordOrMail(requestUserInput, requestUserPassword)) {
                        request = {
                            code: 200,
                            message: '登陆成功',
                            data: {
                                token: await server.methods.obtainUserToken(getUserId('userMail', requestUserInput)),
                            }
                        };
                    } else {
                        request = {
                            code: 401,
                            message: '此用户不存在或密码错误',
                            data: null
                        };
                    }
                    break
                case 'userIdOrPsssword':
                    if (await userLoginWayPssswordOrId(requestUserInput, requestUserPassword)) {
                        request = {
                            code: 200,
                            message: '登陆成功',
                            data: {
                                token: await server.methods.obtainUserToken(getUserId('userMail', requestUserInput)),
                            }
                        };
                    } else {
                        request = {
                            code: 401,
                            message: '此用户不存在或密码错误',
                            data: null
                        };
                    }
                    break;
                default:
                    break;
            }
        });
    }
};

export default userLoginPlugin;
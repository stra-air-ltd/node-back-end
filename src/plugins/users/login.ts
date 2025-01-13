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
                const userPasswordHash256 = await stringSha256Count(userPassword);
                const redisResult = await server.methods.redisQuery(`GET user_name_${userName}`);

                if (redisResult.code === 200 && redisResult.data !== null) {
                    return userPasswordHash256 === redisResult.data;
                }

                const databaseUserResult = await server.methods.databaseQuery(`SELECT user_name FORM users WHERE user_name = ${userName}`);

                if (databaseUserResult[0][0].user_name === null) {
                    return false;
                }

                const databaseResult = await server.methods.databaseQuery(`SELECT user_password FROM users WHERE user_name = ${userName}`);
                
                if (redisResult.code === 200 && userPasswordHash256 === databaseResult[0][0].user_password) {
                    await server.methods.redisQuery(`SET user_name_${userName} ${userPasswordHash256}`)
                    await server.methods.redisQuery(`SETEX user_name_${userName} 3600`)
                    return true;
                }

                return false;
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
                const userPasswordHash256 = await stringSha256Count(userPassword);
                const redisResult = await server.methods.redisQuery(`GET user_mali_${userMail}`);

                if (redisResult.code === 200 && redisResult.data !== null) {
                    return userPasswordHash256 === redisResult.data;
                }

                const databaseUserResult = await server.methods.databaseQuery(`SELECT user_mail FORM users WHERE user_mail = ${userMail}`);

                if (databaseUserResult[0][0].user_mail === null) {
                    return false;
                }

                const databaseResult = await server.methods.databaseQuery(`SELECT user_password FROM users WHERE user_mail = ${userMail}`);
                
                if (redisResult.code === 200 && userPasswordHash256 === databaseResult[0][0].user_password) {
                    await server.methods.redisQuery(`SET user_mali_${userMail} ${userPasswordHash256}`)
                    await server.methods.redisQuery(`SETEX user_mail_${userMail} 3600`)
                    return true;
                }

                return false;
            } catch(error) {
                console.error('[userLogin] 出现错误,信息为', error);
                throw error;
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
                const redisResult = await server.methods.redisQuery(`GET user_id_${userId}`);

                if (redisResult.code === 200 && redisResult.data !== null) {
                    return userPasswordHash256 === redisResult.data;
                }

                const databaseUserResult = await server.methods.databaseQuery(`SELECT user_id FORM users WHERE user_id = ${userId}`);

                if (databaseUserResult[0][0].user_id === null) {
                    return false;
                }

                const databaseResult = await server.methods.databaseQuery(`SELECT user_password FROM users WHERE user_id = ${userId}`);
                
                if (redisResult.code === 200 && userPasswordHash256 === databaseResult[0][0].user_password) {
                    await server.methods.redisQuery(`SET user_id_${userId} ${userPasswordHash256}`)
                    await server.methods.redisQuery(`SETEX user_id_${userId} 3600`)
                    return true;
                }

                return false;
            } catch(error) {
                console.error('[userLogin] 出现错误,信息为', error);
                throw error;
            }
        }
        /**
         * 处理传入的登陆类型
         * @param requestUserLoginWay 
         */
        async function loginResult(requestUserLoginWay: string, requestUserPassword: string, requestUserName?: string, requestUserId?: string, requestUserMail?: string) {
            interface request {
                code: number,
                message: string,
                data: any,
            };
            let request: request;
            switch (requestUserLoginWay) {
                case 'userNameOrPassword':
                    if (await userLoginWayPssswordOrUserName(requestUserName as string, requestUserPassword)) {
                        request = {
                            code: 200,
                            message: '登陆成功',
                            data: {
                                token: await server.methods.obtainUserToken(),
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
                    if (await userLoginWayPssswordOrMail(requestUserMail as string, requestUserPassword)) {
                        request = {
                            code: 200,
                            message: '登陆成功',
                            data: {
                                token: null,
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
                    if (await userLoginWayPssswordOrId(requestUserId as string, requestUserPassword)) {
                        request = {
                            code: 200,
                            message: '登陆成功',
                            data: {
                                token: null,
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
        }
        server.route({
            method: 'POST',
            path: '/login',
            handler: async (request, h) => {
                // Your login logic here
                return h.response({ message: 'Login successful' }).code(200);
            }
        });
    }
};

export default userLoginPlugin;
import Hapi from '@hapi/hapi';
import crypto from 'crypto';

const userTokenDistribute: Hapi.Plugin<undefined> = {
    name: 'userTokenDistribute',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        async function createUserToken (id: number) {
            const randomString = crypto.randomBytes(512).toString('hex').slice(0, length);
            const tokenHash256 = crypto.createHash('sha256').update(randomString).digest('hex');
            
            await server.methods.redisQuery(`SET user_${id}_token ${tokenHash256}`);
            server.methods.databaseQuery(`INSERT INTO 'users_token' ('id', 'token') VALUES ('${id}', '${tokenHash256}'`);
            server.methods.redisQuery(`EXPIREAT user_${id}_token 604800`);

            return {
                code: 200,
                message: "ok",
                data: {
                    token: tokenHash256,
                }
            };
        }
        
        async function verifyUserToken (id: number, token: string) {
            interface request {
                code: number,
                message: string
            };
            
            let request: request;
            const redisResult = await server.methods.redisQuery(`GET user_${id}_token`);
            
            if (redisResult.data === token) {
                request = {
                    code: 200,
                    message: "登陆正常"
                }
                return request;
            }

            const databaseResult = server.methods.databaseQuery(`SELECT token FROM users_token WHERE id = ${id}`);

            if (databaseResult[0][0].token === token) {
                request = {
                    code: 200,
                    message: "登陆正常"
                }
                await server.methods.redisQuery(`SET user_${id}_token ${databaseResult[0][0].token}`);
            } else {
                request = {
                    code: 401,
                    message: "您的登陆过期或token存在问题"
                }
            }

            return request;
        }

        server.method('createUserToken', async (userId: number) => {
            return await createUserToken(userId);
        });
    },
};

export default userTokenDistribute;
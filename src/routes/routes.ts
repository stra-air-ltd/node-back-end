import * as Hapi from '@hapi/hapi';

export const routes = (server: Hapi.Server): Array<Hapi.ServerRoute> => [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return {
                message: 'Hello, World! 这是首页 此页没有意义',
                code: 200,
                data: {
                    time: Date
                }
            };
        }
    },
    {
        method: 'GET',
        path: '/randomImage',
        handler: (request, h) => {
            return server.methods.randomImage(request.query.requestType, h);
        }
    },
    {
        method: 'POST',
        path: '/user/login',
        handler: async (request, h) => {
            
            interface LoginPayload {
                loginWay: string;
                userInput: string;
                userPassword: string;
            }
            const { loginWay, userInput, userPassword } = request.payload as LoginPayload;
            return server.methods.loginResult(loginWay, userInput, userPassword);
        }
    },
    {
        method: 'POST',
        path: '/user/token/verify',
        handler: (request, h) => {
            interface LoginPayload {
                userId: string;
                userToken: string;
            }
            const { userId, userToken } = request.payload as LoginPayload;
            return server.methods.verifyUserToken(userId, userToken);
        }
    },
];
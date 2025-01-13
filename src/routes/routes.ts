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
        method: 'POST',
        path: '/user/token/verify',
        handler: (request, h) => {
            return server.methods.verifyUserToken(request.query.userId, request.query.userToken);
        }
    },
];
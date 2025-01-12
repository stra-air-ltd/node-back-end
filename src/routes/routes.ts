import * as Hapi from '@hapi/hapi';
export const routes: Array<Hapi.ServerRoute> = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return {
                message: 'Hello, World! 这是首页 此页没有意义',
                code: 200,
                data: null
            };
        }
    },
];
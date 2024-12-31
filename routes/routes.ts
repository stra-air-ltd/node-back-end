import * as Hapi from '@hapi/hapi';
import Config from "@/config/config";
export const routes: Array<Hapi.ServerRoute> = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return {
                message: 'Hello, World! 这是首页 此页没有意义',
                code: 200
            };
        }
    },
    {
        method: 'GET',
        path: '/logo',
        handler: (request, h) => {
            
            return {
                message: 'ok',
                code: 200
            };
        }
    },
    {
        method: 'POST',
        path: '/users',
        handler: (request, h) => {
            const payload = request.payload as { name: string, age: number };
            return `Created user: ${payload.name}, Age: ${payload.age}`;
        }
    }
];
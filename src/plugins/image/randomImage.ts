import Hapi, { ServerApplicationState } from '@hapi/hapi';

const randomImagePlugin: Hapi.Plugin<undefined> = {
    name: 'randomImagePlugin',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        let message;
        let code;
        let data: any;
        let min = 0;
        
        let maxIdQueryResult = await server.methods.databaseQuery('SELECT MAX(id) as maxId FROM random_image');
        let max = maxIdQueryResult[0][0].maxId;
        function getRandomInt(): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        async function randomImage(requestType: string, h: Hapi.ResponseToolkit) {
            let randomId = getRandomInt();
            let sqlRequest = await server.methods.databaseQuery(`SELECT src FROM random_image WHERE id = ${randomId}`);
            let requestURL = sqlRequest[0][0].src;
            switch (true) {
                case requestType === 'json':
                    message = 'ok';
                    code = 200;
                    data = {
                        url: requestURL
                    };
                    break;
                case requestType === 'redirect':
                    message = 'redirect';
                    code = 302;
                    data = {
                        url: requestURL
                    };
                    break;
                default:
                    message = 'requestType参数存在问题,应为 json 或 redirect';
                    code = 400;
                    data = null;
                    break;
            }

            if (code === 302) {
                return h.redirect(data.url).code(code);
            } 

            return {
                message,
                code,
                data
            };
        }

        server.route({
            method: 'GET',
            path: '/randomImage',
            handler: (request, h) => {
                return randomImage(request.query.requestType, h);
            }
        });
    }
}

export default randomImagePlugin;
import Hapi from '@hapi/hapi';
import crypto from 'crypto';

const register: Hapi.Plugin<undefined> = {
    name: 'register',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        async function userRegister (userName: string, userMail: string, userPassword: string, userConfirmPsaaword: string) {

            interface request {
                code: number,
                message: string,
                data?: any 
            }

            let request: request;

            if (userPassword !== userConfirmPsaaword) {
                request = {
                    code: 400,
                    message: '确认密码与密码不一致'
                };
                return request;
            }
        }
    }
};
export default register;
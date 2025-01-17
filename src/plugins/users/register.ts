import Hapi from '@hapi/hapi';

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

            const userNamePattern = /^[\w\u4E00-\u9FA5]{4,64}$/;
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?.&_-])[\w$@$!%*?.&-]{8,128}/;
            const userMailPattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/

            if (!userNamePattern.test(userName)) {
                request = {
                    code: 401,
                    message: "用户名不合规, 只能使用汉字，大小写字母和数字",
                };
                return request;
            }

            if (!passwordPattern.test(userPassword)) {
                request = {
                    code: 401,
                    message: "密码8~128位，至少包含大小写字母，一个特殊字符和一个数字"
                };
                return request;
            }

            if (!userMailPattern.test(userMail)){
                request = {
                    code: 401,
                    message: "您的邮箱格式存在问题"
                };
                return request;
            }

            if (userPassword !== userConfirmPsaaword) {
                request = {
                    code: 400,
                    message: '确认密码与密码不一致'
                };
                return request;
            }

            if (await server.methods.getUserId('userName', userName) !== null) {
                request = {
                    code: 400,
                    message: '当前用户名已存在，请更换后重试'
                };
                return request;
            }

            if (await server.methods.getUserId('userMail', userMail) !== null) {
                request = {
                    code: 400,
                    message: '当前用户邮箱已经已存在，请直接登陆'
                };
                return request;
            }

            const userMaxId = await server.methods.databaseQuery("SELECT MAX(id) as maxId FROM users")
            const registerUserId = userMaxId + 1;
            const encryptionPsssword = await server.methods.rsaEncrypt(userPassword);

            await server.methods.databaseQuery(`INSERT INTO 'users' ('id', 'name', 'mail', 'password') VALUES ('${ registerUserId }', '${ userName }', '${userMail}', '${ encryptionPsssword }')`);
            
            const userToken = await server.methods.createUserToken(registerUserId).data.token;
            request = {
                code: 204,
                message: "用户注册成功，请登陆然后验证您的邮箱",
                data: {
                    token: userToken
                }
            };

            return request;
        }

        server.method('userRegister', async (userName: string, userMail: string, userPassword: string, userConfirmPsaaword: string) => {
            return userRegister(userName, userMail, userPassword, userConfirmPsaaword);
        });
    }
};

export default register;
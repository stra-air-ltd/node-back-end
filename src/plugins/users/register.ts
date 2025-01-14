import Hapi from '@hapi/hapi';
import crypto from 'crypto';

const register: Hapi.Plugin<undefined> = {
    name: 'register',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        
    }
};
export default register;
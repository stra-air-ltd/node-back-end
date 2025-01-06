import Hapi from '@hapi/hapi';
import { createPool } from 'mysql2/promise';
import { Pool } from 'pg';
import dotenv from 'dotenv';

const databasePlugin: Hapi.Plugin<undefined> = {
    name: 'databasePlugin',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        dotenv.config();
        const databaseType = process.env.DATABASE_TYPE;
        switch (databaseType) {
            case 'mysql':
                const mysqlConnect = createPool({
                    host: process.env.DATABASE_HOST,
                    user: process.env.DATABASE_USER,
                    password: process.env.DATABASE_PASSWORD,
                    database: process.env.DATABASE_USERNAME,
                    port: process.env.DATABASE_PORT as unknown as number,
                    connectionLimit: 10
                });
            break;
            case 'postgres':
                const postgresConnect = new Pool({
                    user: process.env.DATABASE_USER,
                    host: process.env.DATABASE_HOST,
                    database: process.env.DATABASE_DATABASE,
                    password: process.env.DATABASE_PASSWORD,
                    port: process.env.DATABASE_PORT as unknown as number,
                });
            break;
            default:
                throw new Error('数据库类型错误 请检查 .env 文件的 DATABASE_TYPE 字段是否正确 当前值为: ' + databaseType);
        }
    }
}

export default databasePlugin;